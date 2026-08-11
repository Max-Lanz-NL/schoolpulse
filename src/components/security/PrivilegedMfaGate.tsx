import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { KeyRound, LogOut, RefreshCw, ShieldCheck } from "lucide-react";

type Factor = { id: string; friendly_name?: string; status: string };

type Props = {
  children: ReactNode;
  supabase: SupabaseClient;
  onSignOut: () => Promise<void>;
};

export function PrivilegedMfaGate({ children, supabase, onSignOut }: Props) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [factor, setFactor] = useState<Factor | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inspect = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [{ data: assurance, error: assuranceError }, { data: factors, error: factorsError }] =
      await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);
    if (assuranceError || factorsError) {
      setError("De extra beveiligingscontrole kon niet worden geladen.");
      setLoading(false);
      return;
    }
    if (assurance.currentLevel === "aal2") {
      setVerified(true);
      setLoading(false);
      return;
    }
    setVerified(false);
    setFactor(((factors?.totp ?? []).find((item) => item.status === "verified") as Factor) ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => void inspect(), [inspect]);

  const enroll = async () => {
    setBusy(true);
    setError(null);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "SchoolPulse beheer",
    });
    if (enrollError)
      setError("2FA instellen is mislukt. Probeer opnieuw of gebruik de herstelprocedure.");
    else {
      setFactor({ id: data.id, friendly_name: data.friendly_name, status: "unverified" });
      setQrCode(data.totp.qr_code);
    }
    setBusy(false);
  };

  const verify = async () => {
    if (!factor || !/^\d{6}$/.test(code.trim())) {
      setError("Vul de zescijferige code uit je authenticator-app in.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });
    if (challengeError) {
      setError("De 2FA-controle kon niet worden gestart.");
      setBusy(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (verifyError) setError("De code is niet geldig of verlopen.");
    else {
      await supabase.auth.refreshSession();
      await inspect();
    }
    setBusy(false);
  };

  if (verified) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-elegant)]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-center text-xl font-bold">Extra beveiliging verplicht</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Beheeraccounts krijgen pas toegang na verificatie op beveiligingsniveau AAL2.
        </p>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" /> Beveiligingsniveau controleren…
          </div>
        ) : factor ? (
          <div className="mt-6 space-y-4">
            {qrCode ? (
              <div className="rounded-xl border border-border bg-white p-4 text-center">
                <img
                  src={qrCode}
                  alt="QR-code voor authenticator-app"
                  className="mx-auto h-44 w-44"
                />
                <p className="mt-2 text-xs text-slate-600">
                  Scan deze code en bewaar de factor op een beheerd apparaat.
                </p>
              </div>
            ) : null}
            <label className="block text-xs font-semibold">
              Authenticatorcode
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-center text-lg tracking-[0.35em] outline-none focus:border-primary"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void verify()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" /> Verifiëren
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void enroll()}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            2FA instellen
          </button>
        )}

        {error ? (
          <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        ) : null}
        <div className="mt-5 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          Toegang tot je factor kwijt? Stop met inloggen en laat een tweede aangewezen
          platformbeheerder de herstelprocedure uitvoeren. Support vraagt nooit om je code.
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Uitloggen
        </button>
      </section>
    </main>
  );
}
