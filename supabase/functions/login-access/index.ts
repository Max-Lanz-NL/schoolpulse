import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type RequestBody = {
  action?: "request" | "poll" | "list" | "approve" | "deny";
  email?: string;
  request_id?: string;
  request_secret_hash?: string;
};

const allowedOrigins = new Set([
  "https://app.schoolpulse.nl",
  "https://admin.schoolpulse.nl",
  "http://localhost:5173",
  "http://localhost:3000",
]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const secretHashPattern = /^[0-9a-f]{64}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200, origin = "") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      "access-control-max-age": "86400",
      vary: "Origin",
    },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  if (!allowedOrigins.has(origin)) return json({ error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return json({ ok: true }, 200, origin);
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey)
    return json({ error: "Function is not configured" }, 500, origin);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json({ error: "Invalid request" }, 400, origin);
  }

  if (body.action === "request") {
    const email = body.email?.trim().toLowerCase() ?? "";
    if (
      !emailPattern.test(email) ||
      !body.request_id ||
      !uuidPattern.test(body.request_id) ||
      !body.request_secret_hash ||
      !secretHashPattern.test(body.request_secret_hash)
    ) {
      return json({ error: "Controleer het e-mailadres en probeer opnieuw." }, 400, origin);
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id,email,full_name,role,school_name,is_blocked")
      .eq("email", email)
      .maybeSingle();
    if (profileError)
      return json({ error: "Loginverzoek kon niet worden opgeslagen." }, 500, origin);

    // Keep the response the same for unknown and blocked accounts so the endpoint
    // cannot be used to enumerate account addresses.
    if (!profile || profile.is_blocked) return json({ ok: true }, 200, origin);
    const { data: authAccount, error: authAccountError } = await adminClient.auth.admin.getUserById(
      profile.id,
    );
    if (
      authAccountError ||
      !authAccount.user?.email ||
      authAccount.user.email.toLowerCase() !== profile.email.toLowerCase()
    ) {
      return json({ ok: true }, 200, origin);
    }

    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const { data: recentRequest, error: recentError } = await adminClient
      .from("login_requests")
      .select("id")
      .eq("profile_id", profile.id)
      .gt("created_at", cutoff)
      .limit(1)
      .maybeSingle();
    if (recentError)
      return json({ error: "Loginverzoek kon niet worden opgeslagen." }, 500, origin);
    if (recentRequest) return json({ ok: true }, 200, origin);

    const { error: insertError } = await adminClient.from("login_requests").insert({
      id: body.request_id,
      profile_id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      school_name: profile.school_name,
      request_secret_hash: body.request_secret_hash,
    });
    if (insertError)
      return json({ error: "Loginverzoek kon niet worden opgeslagen." }, 500, origin);
    return json({ ok: true }, 200, origin);
  }

  if (body.action === "poll") {
    if (
      !body.request_id ||
      !uuidPattern.test(body.request_id) ||
      !body.request_secret_hash ||
      !secretHashPattern.test(body.request_secret_hash)
    ) {
      return json({ error: "Loginverzoek verlopen. Dien opnieuw een verzoek in." }, 400, origin);
    }

    const { data: request, error: requestError } = await adminClient
      .from("login_requests")
      .select(
        "id,profile_id,status,expires_at,request_secret_hash,grant_token_hash,grant_consumed_at,email",
      )
      .eq("id", body.request_id)
      .maybeSingle();
    if (requestError) return json({ error: "Status kon niet worden gecontroleerd." }, 500, origin);
    if (
      !request ||
      request.request_secret_hash !== body.request_secret_hash ||
      new Date(request.expires_at).getTime() <= Date.now()
    ) {
      return json({ status: "pending" }, 200, origin);
    }
    if (request.status !== "approved") return json({ status: request.status }, 200, origin);
    if (request.grant_consumed_at) return json({ status: "used" }, 200, origin);

    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("id,email,is_blocked")
      .eq("id", request.profile_id)
      .maybeSingle();
    if (
      targetError ||
      !targetProfile ||
      targetProfile.is_blocked ||
      targetProfile.email.toLowerCase() !== request.email.toLowerCase()
    ) {
      return json({ status: "denied" }, 200, origin);
    }
    const { data: authUser, error: authUserError } = await adminClient.auth.admin.getUserById(
      targetProfile.id,
    );
    if (
      authUserError ||
      !authUser.user?.email ||
      authUser.user.email.toLowerCase() !== targetProfile.email.toLowerCase()
    ) {
      return json({ error: "Het testaccount kan niet worden ingelogd." }, 409, origin);
    }

    let tokenHash = request.grant_token_hash as string | null;
    if (!tokenHash) {
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: authUser.user.email,
      });
      if (linkError || !linkData.properties?.hashed_token) {
        return json({ error: "De goedgekeurde sessie kon niet worden klaargezet." }, 500, origin);
      }
      tokenHash = linkData.properties.hashed_token;
      const { error: tokenStoreError } = await adminClient
        .from("login_requests")
        .update({ grant_token_hash: tokenHash })
        .eq("id", request.id)
        .eq("request_secret_hash", body.request_secret_hash)
        .eq("status", "approved")
        .is("grant_token_hash", null)
        .is("grant_consumed_at", null);
      if (tokenStoreError)
        return json({ error: "De goedgekeurde sessie kon niet worden klaargezet." }, 500, origin);
    }

    const { data: consumedHash, error: consumeError } = await adminClient.rpc(
      "consume_login_request_grant",
      { _request_id: request.id, _request_secret_hash: body.request_secret_hash },
    );
    if (consumeError)
      return json({ error: "De goedgekeurde sessie kon niet worden klaargezet." }, 500, origin);
    if (!consumedHash) return json({ status: "used" }, 200, origin);
    return json({ status: "approved", token_hash: consumedHash }, 200, origin);
  }

  const authorization = req.headers.get("authorization") ?? "";
  const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!accessToken) return json({ error: "Beheerderlogin vereist." }, 401, origin);
  const { data: authData, error: authError } = await adminClient.auth.getUser(accessToken);
  if (authError || !authData.user) return json({ error: "Beheerderlogin verlopen." }, 401, origin);

  let claims: { aal?: string } = {};
  try {
    claims = JSON.parse(atob(accessToken.split(".")[1] ?? "")) as { aal?: string };
  } catch {
    return json({ error: "Beheerderlogin ongeldig." }, 401, origin);
  }
  if (claims.aal !== "aal2") return json({ error: "Voltooi eerst de 2FA-controle." }, 403, origin);

  const { data: requesterProfile, error: requesterError } = await adminClient
    .from("profiles")
    .select("role,is_blocked")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (
    requesterError ||
    requesterProfile?.role !== "platform_admin" ||
    requesterProfile.is_blocked
  ) {
    return json({ error: "Alleen een platformbeheerder mag dit doen." }, 403, origin);
  }

  if (body.action === "list") {
    const { data: requests, error: listError } = await adminClient
      .from("login_requests")
      .select("id,email,full_name,role,school_name,status,created_at,expires_at")
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(100);
    if (listError)
      return json({ error: "Loginverzoeken konden niet worden geladen." }, 500, origin);
    return json({ requests: requests ?? [] }, 200, origin);
  }

  if (
    (body.action === "approve" || body.action === "deny") &&
    body.request_id &&
    uuidPattern.test(body.request_id)
  ) {
    const { data: pendingRequest, error: pendingError } = await adminClient
      .from("login_requests")
      .select("id,profile_id,email")
      .eq("id", body.request_id)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (pendingError || !pendingRequest)
      return json({ error: "Dit verzoek is verlopen of al afgehandeld." }, 409, origin);

    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("id,is_blocked")
      .eq("id", pendingRequest.profile_id)
      .maybeSingle();
    if (targetError || !targetProfile || targetProfile.is_blocked) {
      return json({ error: "Dit account is niet beschikbaar voor inloggen." }, 409, origin);
    }

    const status = body.action === "approve" ? "approved" : "denied";
    const { data: updated, error: updateError } = await adminClient
      .from("login_requests")
      .update({ status, resolved_at: new Date().toISOString(), resolved_by: authData.user.id })
      .eq("id", pendingRequest.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (updateError || !updated)
      return json({ error: "Verzoek is intussen al afgehandeld." }, 409, origin);
    const { error: auditError } = await adminClient.from("admin_audit_logs").insert({
      table_name: "login_requests",
      action: status.toUpperCase(),
      record_id: pendingRequest.id,
      actor_id: authData.user.id,
      details: { target_profile_id: pendingRequest.profile_id },
    });
    if (auditError)
      return json(
        { error: "De actie kon niet in het beheerderslogboek worden opgeslagen." },
        500,
        origin,
      );
    return json({ ok: true }, 200, origin);
  }

  return json({ error: "Ongeldige actie." }, 400, origin);
});
