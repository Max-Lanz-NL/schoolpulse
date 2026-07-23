import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/schoolpulse-logo.png";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const [form, setForm] = useState({
    school: "",
    naam: "",
    email: "",
    telefoon: "",
    vraag: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.school.trim()) next.school = "Vul de schoolnaam in.";
    if (!form.naam.trim()) next.naam = "Vul uw naam in.";
    if (!form.email.trim() || !form.email.includes("@"))
      next.email = "Vul een geldig e-mailadres in.";
    if (!form.vraag.trim() || form.vraag.trim().length < 15)
      next.vraag = "Geef een korte toelichting (minimaal 15 tekens).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Controleer het formulier", {
        description: "Niet alle verplichte velden zijn correct ingevuld.",
      });
      return;
    }
    toast.success("Offerteaanvraag ontvangen", {
      description:
        "Bedankt! In deze demo-omgeving wordt niets verzonden, maar in productie nemen we binnen 1 werkdag contact op.",
    });
    setForm({ school: "", naam: "", email: "", telefoon: "", vraag: "" });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">Schoolpulse</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Terug
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-52 bg-gradient-to-b from-primary/[0.08] to-transparent" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground">
              <CalendarCheck2 className="h-3.5 w-3.5 text-primary" /> Vrijblijvende offerte
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Vraag een offerte aan voor uw school
            </h1>
            <p className="mt-3 text-muted-foreground">
              Vertel kort wat uw school nodig heeft. U ontvangt een passend voorstel en toegang tot
              de interactieve demo-omgeving.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  label: "E-mail",
                  value: "info@schoolpulse.nl",
                  hint: "Reactie binnen 1 werkdag",
                },
                {
                  icon: Phone,
                  label: "Telefoon",
                  value: "+31 20 123 4567",
                  hint: "Ma-vr van 09:00 tot 17:00",
                },
                {
                  icon: MapPin,
                  label: "Adres",
                  value: "Amsterdam, Nederland",
                  hint: "Afspraken op locatie of online",
                },
              ].map(({ icon: Icon, label, value, hint }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 text-sm font-semibold">{value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-border/80 bg-card p-5 text-sm shadow-[var(--shadow-soft)]">
                <div className="font-semibold">Hoe werkt de offerteaanvraag?</div>
                <ol className="mt-2 space-y-1 text-muted-foreground">
                  <li>1. Laat uw gegevens en context achter.</li>
                  <li>2. Wij nemen binnen één werkdag contact met u op.</li>
                  <li>3. U ontvangt een voorstel en toegang tot de ingerichte demo.</li>
                </ol>
              </div>
            </div>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-elegant)] md:p-8"
            >
              <h2 className="text-lg font-semibold">Vraag een vrijblijvende offerte aan</h2>
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
              </div>

              <div className="mt-4">
                <label
                  htmlFor="vraag"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Waar zoekt uw school een oplossing voor? *
                </label>
                <textarea
                  id="vraag"
                  rows={5}
                  value={form.vraag}
                  onChange={(e) => setForm((s) => ({ ...s, vraag: e.target.value }))}
                  placeholder="Bijv. communicatie met ouders, management-overzicht of overgang vanuit huidige systemen."
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ${errors.vraag ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                <div
                  className={`mt-1 text-xs ${errors.vraag ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {errors.vraag ??
                    "Tip: noem vooral welke rollen het belangrijkst zijn voor jullie school."}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Verstuur aanvraag
                </button>
                <div className="text-xs text-muted-foreground">
                  In deze demo wordt het formulier niet extern verzonden.
                </div>
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
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
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
