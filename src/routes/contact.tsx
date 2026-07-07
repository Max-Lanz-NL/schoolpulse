import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/schoolpulse-logo.png";
import { createQuoteRequest, getReadableAdminError } from "@/lib/admin-client";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const [form, setForm] = useState({
    school: "",
    naam: "",
    email: "",
    telefoon: "",
    leerlingen: "",
    medewerkers: "",
    modules: "",
    startdatum: "",
    huidigeSystemen: "",
    extraWensen: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.school.trim()) next.school = "Vul de schoolnaam in.";
    if (!form.naam.trim()) next.naam = "Vul uw naam in.";
    if (!form.email.trim() || !form.email.includes("@")) next.email = "Vul een geldig e-mailadres in.";
    if (!form.leerlingen.trim()) next.leerlingen = "Vul een indicatie van het aantal leerlingen in.";
    if (!form.medewerkers.trim()) next.medewerkers = "Vul een indicatie van het aantal medewerkers in.";
    if (!form.modules.trim() || form.modules.trim().length < 10) next.modules = "Noem de gewenste modules (minimaal 10 tekens).";
    if (!form.startdatum.trim()) next.startdatum = "Geef een gewenste startperiode op.";
    if (!form.huidigeSystemen.trim()) next.huidigeSystemen = "Beschrijf kort jullie huidige systemen.";
    if (!form.extraWensen.trim() || form.extraWensen.trim().length < 15) next.extraWensen = "Geef aanvullende wensen (minimaal 15 tekens).";
    if (form.leerlingen.trim() && !/^\d+$/.test(form.leerlingen.trim())) next.leerlingen = "Gebruik alleen cijfers.";
    if (form.medewerkers.trim() && !/^\d+$/.test(form.medewerkers.trim())) next.medewerkers = "Gebruik alleen cijfers.";
    if (form.leerlingen.trim() && Number(form.leerlingen) < 1) next.leerlingen = "Aantal leerlingen moet minimaal 1 zijn.";
    if (form.medewerkers.trim() && Number(form.medewerkers) < 1) next.medewerkers = "Aantal medewerkers moet minimaal 1 zijn.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Controleer het formulier", { description: "Niet alle verplichte velden zijn correct ingevuld." });
      return;
    }
    setSubmitting(true);
    try {
      await createQuoteRequest({
        school_name: form.school,
        contact_name: form.naam,
        contact_email: form.email,
        contact_phone: form.telefoon,
        student_count: Number(form.leerlingen),
        staff_count: Number(form.medewerkers),
        requested_modules: form.modules,
        desired_start_period: form.startdatum,
        current_systems: form.huidigeSystemen,
        additional_requirements: form.extraWensen,
      });
      toast.success("Offerte-aanvraag ontvangen", {
        description: "Bedankt! We nemen binnen 1 werkdag contact op.",
      });
    } catch (submitError) {
      toast.error("Offerte-aanvraag mislukt", {
        description: getReadableAdminError(
          submitError,
          "Probeer opnieuw of neem contact op via info@schoolpulse.nl.",
        ),
      });
      setSubmitting(false);
      return;
    }

    setForm({
      school: "",
      naam: "",
      email: "",
      telefoon: "",
      leerlingen: "",
      medewerkers: "",
      modules: "",
      startdatum: "",
      huidigeSystemen: "",
      extraWensen: "",
    });
    setErrors({});
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">Schoolpulse</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-52 bg-gradient-to-b from-primary/[0.08] to-transparent" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground">
              <CalendarCheck2 className="h-3.5 w-3.5 text-primary" /> Offerte aanvragen
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Vraag een offerte aan voor Schoolpulse</h1>
            <p className="mt-3 text-muted-foreground">
              De live demo is openbaar beschikbaar. Deel kort jullie situatie voor een passende offerte en implementatievoorstel.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              {[
                { icon: Mail, label: "E-mail", value: "info@schoolpulse.nl", hint: "Reactie binnen 1 werkdag" },
                { icon: Phone, label: "Telefoon", value: "+31 20 123 4567", hint: "Ma-vr van 09:00 tot 17:00" },
                { icon: MapPin, label: "Adres", value: "Amsterdam, Nederland", hint: "Afspraken op locatie of online" },
              ].map(({ icon: Icon, label, value, hint }) => (
                <div key={label} className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-soft)]">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
                      <div className="mt-1 text-sm font-semibold">{value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-border/80 bg-card p-5 text-sm shadow-[var(--shadow-soft)]">
                <div className="font-semibold">Hoe werkt de offerte-aanvraag?</div>
                <ol className="mt-2 space-y-1 text-muted-foreground">
                  <li>1. Laat uw gegevens en context achter.</li>
                  <li>2. Wij nemen contact op voor aanvullende wensen.</li>
                  <li>3. U ontvangt een offerte en voorstel op maat.</li>
                </ol>
              </div>
            </div>

            <form onSubmit={submit} className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-elegant)] md:p-8">
              <h2 className="text-lg font-semibold">Vraag een offerte aan</h2>
              <p className="mt-1 text-xs text-muted-foreground">Velden met * zijn verplicht.</p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field
                  id="school"
                  label="Schoolnaam *"
                  value={form.school}
                  error={errors.school}
                  onChange={(v) => setForm((s) => ({ ...s, school: v }))}
                  placeholder="Bijv. Scholengemeenschap De Horizon"
                />
                <Field
                  id="naam"
                  label="Naam contactpersoon *"
                  value={form.naam}
                  error={errors.naam}
                  onChange={(v) => setForm((s) => ({ ...s, naam: v }))}
                  placeholder="Voor- en achternaam"
                />
                <Field
                  id="email"
                  label="E-mailadres *"
                  type="email"
                  value={form.email}
                  error={errors.email}
                  onChange={(v) => setForm((s) => ({ ...s, email: v }))}
                  placeholder="naam@school.nl"
                />
                <Field
                  id="telefoon"
                  label="Telefoon (optioneel)"
                  value={form.telefoon}
                  error={errors.telefoon}
                  onChange={(v) => setForm((s) => ({ ...s, telefoon: v }))}
                  placeholder="+31 ..."
                />
                <Field
                  id="leerlingen"
                  label="Aantal leerlingen *"
                  value={form.leerlingen}
                  error={errors.leerlingen}
                  onChange={(v) => setForm((s) => ({ ...s, leerlingen: v }))}
                  placeholder="Bijv. 850"
                />
                <Field
                  id="medewerkers"
                  label="Aantal medewerkers *"
                  value={form.medewerkers}
                  error={errors.medewerkers}
                  onChange={(v) => setForm((s) => ({ ...s, medewerkers: v }))}
                  placeholder="Bijv. 90"
                />
                <Field
                  id="startdatum"
                  label="Gewenste startperiode *"
                  value={form.startdatum}
                  error={errors.startdatum}
                  onChange={(v) => setForm((s) => ({ ...s, startdatum: v }))}
                  placeholder="Bijv. Q1 2027"
                />
                <Field
                  id="huidigeSystemen"
                  label="Huidige systemen *"
                  value={form.huidigeSystemen}
                  error={errors.huidigeSystemen}
                  onChange={(v) => setForm((s) => ({ ...s, huidigeSystemen: v }))}
                  placeholder="Bijv. Magister + losse mailtools"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="modules" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gewenste modules in offerte *
                </label>
                <textarea
                  id="modules"
                  rows={3}
                  value={form.modules}
                  onChange={(e) => setForm((s) => ({ ...s, modules: e.target.value }))}
                  placeholder="Bijv. rooster, berichten, opdrachten, ouderportaal, management dashboard."
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ${errors.modules ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                <div className={`mt-1 text-xs ${errors.modules ? "text-destructive" : "text-muted-foreground"}`}>
                  {errors.modules ?? "Noem vooral welke onderdelen in fase 1 live moeten."}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="extraWensen" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aanvullende eisen en wensen *
                </label>
                <textarea
                  id="extraWensen"
                  rows={4}
                  value={form.extraWensen}
                  onChange={(e) => setForm((s) => ({ ...s, extraWensen: e.target.value }))}
                  placeholder="Bijv. koppelingen, datamigratie, onboarding, supportniveau en security-eisen."
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ${errors.extraWensen ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                <div className={`mt-1 text-xs ${errors.extraWensen ? "text-destructive" : "text-muted-foreground"}`}>
                  {errors.extraWensen ?? "Hoe concreter dit is, hoe nauwkeuriger de offerte."}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? "Versturen..." : "Verstuur offerte-aanvraag"}
                </button>
                <div className="text-xs text-muted-foreground">Je aanvraag wordt veilig opgeslagen voor opvolging.</div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  type?: "text" | "email";
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ${error ? "border-destructive" : "border-border focus:border-primary"}`}
      />
      <div className={`mt-1 text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}>
        {error ?? " "}
      </div>
    </div>
  );
}
