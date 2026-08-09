import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type Role = "platform_admin" | "school_admin" | "teacher" | "student" | "parent";

type CreateUserAction = {
  action: "create_user";
  email: string;
  password: string;
  full_name: string;
  role: Role;
  school_id: string | null;
  school_name: string | null;
};

type UpdateUserAction = {
  action: "update_user";
  user_id: string;
  email: string;
  full_name: string;
  role: Role;
  school_id: string | null;
  school_name: string | null;
};

type DeleteUserAction = {
  action: "delete_user";
  user_id: string;
};

type InviteUserAction = {
  action: "invite_user";
  email: string;
  full_name: string;
  role: Exclude<Role, "platform_admin">;
};

type SetUserBlockedAction = {
  action: "set_user_blocked";
  user_id: string;
  blocked: boolean;
};

type ResetPasswordAction = {
  action: "reset_password";
  user_id: string;
};

type ActionBody =
  | CreateUserAction
  | UpdateUserAction
  | DeleteUserAction
  | InviteUserAction
  | SetUserBlockedAction
  | ResetPasswordAction;

const allowedRoles = new Set<Role>([
  "platform_admin",
  "school_admin",
  "teacher",
  "student",
  "parent",
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("authorization");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Missing function secrets" }, 500);
  }

  if (!authHeader) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return json({ error: "Invalid Authorization header" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !authData.user) {
    return json({ error: "Invalid user token" }, 401);
  }

  const requesterId = authData.user.id;
  const { data: requesterProfile, error: requesterError } = await adminClient
    .from("profiles")
    .select("role,school_id,school_name")
    .eq("id", requesterId)
    .maybeSingle();

  const isPlatformAdmin = requesterProfile?.role === "platform_admin";
  const isSchoolAdmin = requesterProfile?.role === "school_admin";
  if (requesterError || (!isPlatformAdmin && !isSchoolAdmin)) {
    return json({ error: "Forbidden" }, 403);
  }

  let body: ActionBody;
  try {
    body = (await req.json()) as ActionBody;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const targetBelongsToRequesterSchool = async (userId: string) => {
    if (isPlatformAdmin) return true;
    const { data: target } = await adminClient
      .from("profiles")
      .select("school_id,role")
      .eq("id", userId)
      .maybeSingle();
    return (
      target?.school_id === requesterProfile?.school_id &&
      target?.role !== "platform_admin" &&
      target?.role !== "school_admin"
    );
  };

  if (body.action === "invite_user") {
    if (!requesterProfile?.school_id) return json({ error: "Requester has no school" }, 400);
    if (!allowedRoles.has(body.role) || body.role === "platform_admin") {
      return json({ error: "Invalid role" }, 400);
    }
    if (isSchoolAdmin && body.role === "school_admin") {
      return json({ error: "Only platform admins can invite school admins" }, 403);
    }
    const normalizedEmail = body.email.trim().toLowerCase();
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
      data: {
        full_name: body.full_name.trim(),
        role: body.role,
        school_name: requesterProfile.school_name,
      },
    });
    if (error || !data.user) return json({ error: error?.message ?? "Unable to invite user" }, 400);
    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: data.user.id,
        email: normalizedEmail,
        full_name: body.full_name.trim(),
        role: body.role,
        school_id: requesterProfile.school_id,
        school_name: requesterProfile.school_name,
      },
      { onConflict: "id" },
    );
    if (profileError) return json({ error: "Unable to create profile" }, 400);
    return json({ ok: true, user_id: data.user.id });
  }

  if (body.action === "set_user_blocked") {
    if (!(await targetBelongsToRequesterSchool(body.user_id)))
      return json({ error: "Forbidden" }, 403);
    const { error } = await adminClient.auth.admin.updateUserById(body.user_id, {
      ban_duration: body.blocked ? "876000h" : "none",
    });
    if (error) return json({ error: "Unable to update account status" }, 400);
    return json({ ok: true });
  }

  if (body.action === "reset_password") {
    if (!(await targetBelongsToRequesterSchool(body.user_id)))
      return json({ error: "Forbidden" }, 403);
    const { data: target } = await adminClient
      .from("profiles")
      .select("email")
      .eq("id", body.user_id)
      .single();
    if (!target?.email) return json({ error: "Account has no email address" }, 400);
    const { error } = await adminClient.auth.resetPasswordForEmail(target.email);
    if (error) return json({ error: "Unable to send password reset" }, 400);
    return json({ ok: true });
  }

  if (body.action === "create_user") {
    if (!isPlatformAdmin) return json({ error: "Forbidden" }, 403);
    if (!allowedRoles.has(body.role)) return json({ error: "Invalid role" }, 400);

    const { data, error } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name,
        role: body.role,
        school_name: body.school_name,
      },
    });

    if (error || !data.user) {
      return json({ error: "Unable to create auth user" }, 400);
    }

    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: data.user.id,
        email: body.email,
        full_name: body.full_name,
        role: body.role,
        school_id: body.school_id,
        school_name: body.school_name,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return json({ error: "Unable to create profile" }, 400);
    }

    return json({ ok: true });
  }

  if (body.action === "update_user") {
    if (!(await targetBelongsToRequesterSchool(body.user_id)))
      return json({ error: "Forbidden" }, 403);
    if (!allowedRoles.has(body.role)) return json({ error: "Invalid role" }, 400);
    if (
      isSchoolAdmin &&
      (body.role === "platform_admin" ||
        body.role === "school_admin" ||
        body.school_id !== requesterProfile?.school_id)
    ) {
      return json({ error: "School admins cannot grant administrative platform roles" }, 403);
    }

    const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(body.user_id, {
      email: body.email,
      user_metadata: {
        full_name: body.full_name,
        role: body.role,
        school_name: body.school_name,
      },
    });

    if (updateAuthError) {
      return json({ error: "Unable to update auth user" }, 400);
    }

    const { error: updateProfileError } = await adminClient
      .from("profiles")
      .update({
        email: body.email,
        full_name: body.full_name,
        role: body.role,
        school_id: body.school_id,
        school_name: body.school_name,
      })
      .eq("id", body.user_id);

    if (updateProfileError) {
      return json({ error: "Unable to update profile" }, 400);
    }

    return json({ ok: true });
  }

  if (body.action === "delete_user") {
    if (!(await targetBelongsToRequesterSchool(body.user_id)))
      return json({ error: "Forbidden" }, 403);
    const { error } = await adminClient.auth.admin.deleteUser(body.user_id, false);
    if (error) return json({ error: "Unable to delete auth user" }, 400);
    return json({ ok: true });
  }

  return json({ error: "Unsupported action" }, 400);
});
