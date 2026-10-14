import { createFileRoute, Link } from "@tanstack/react-router";
import { roleLabels, type Role } from "@/lib/demo-data";
import { DOMAIN_ORIGINS } from "@/lib/domains";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";
import dashboardPreview from "@/assets/schoolpulse-dashboard-preview.png";
import teacherPreview from "@/assets/schoolpulse-docent-preview.png";
import managementPreview from "@/assets/schoolpulse-directie-preview.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Menu, Maximize2 } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

const dashboardPreviews = [
  {
    role: "leerling",
    label: "Leerling",
    image: dashboardPreview,
    width: 1780,
    height: 883,
    description: "Je schooldag in één overzicht",
    alt: "Leerlingdashboard met het rooster van vandaag, recente cijfers, berichten en openstaande taken.",
  },
  {
    role: "docent",
    label: "Docent",
    image: teacherPreview,
    width: 1785,
    height: 881,
    description: "Klassen, beoordelingen en berichten bij elkaar",
    alt: "Docentdashboard met klassen, ingeleverde opdrachten, lessen en nieuwe berichten.",
  },
  {
    role: "directie",
    label: "Directie",
    image: managementPreview,
    width: 1784,
    height: 881,
    description: "Inzicht in resultaten en schooldoelstellingen",
    alt: "Directiedashboard met leerlingaantallen, aanwezigheid, slagingspercentages en schooldoelstellingen.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">Schoolpulse</span>
          </Link>
          <nav
            aria-label="Hoofdnavigatie"
            className="hidden items-center gap-5 whitespace-nowrap lg:flex"
          >
            <a
              href="#waarde"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Waarom Schoolpulse
            </a>
            <a
              href="#doelgroepen"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Voor wie
            </a>
            <a
              href="#vertrouwen"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Vertrouwen
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/contact"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted lg:inline-flex"
            >
              Contact
            </Link>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90 sm:px-4"
            >
              <span className="sm:hidden">Offerte</span>
              <span className="hidden sm:inline">Offerte aanvragen</span>{" "}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Navigatiemenu openen"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetTitle>Schoolpulse</SheetTitle>
                <SheetDescription>Ontdek het platform voor jullie school.</SheetDescription>
                <nav aria-label="Mobiele hoofdnavigatie" className="mt-6 flex flex-col gap-2">
                  {[
                    ["#waarde", "Waarom Schoolpulse"],
                    ["#doelgroepen", "Voor wie"],
                    ["#vertrouwen", "Privacy & vertrouwen"],
                  ].map(([href, label]) => (
                    <SheetClose asChild key={href}>
                      <a href={href} className="rounded-lg px-3 py-3 font-medium hover:bg-muted">
                        {label}
                      </a>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link to="/contact" className="rounded-lg px-3 py-3 font-medium hover:bg-muted">
                      Contact
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href={`${DOMAIN_ORIGINS.demo}/app`}
                      className="rounded-lg px-3 py-3 font-medium text-primary hover:bg-muted"
                    >
                      Bekijk de demo
                    </a>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.10] via-background to-background" />
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)]">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Nieuw en gebouwd voor de
              schoolpraktijk
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
              Eén platform voor{" "}
              <span className="text-primary">rooster, communicatie en voortgang</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Stuur berichten naar een klas of jaarlaag, verwerk roosterwijzigingen en volg
              absenties en resultaten vanuit één centrale omgeving.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Offerte aanvragen
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`${DOMAIN_ORIGINS.demo}/app`}
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-5 py-3 text-sm font-semibold shadow-[var(--shadow-soft)] hover:bg-muted"
              >
                Bekijk de ingerichte demo
              </a>
            </div>
            <div className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
                Samen ingericht voor jullie school
              </div>
              <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
                Rollen & rechten per gebruiker
              </div>
              <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
                Duidelijke communicatieflow
              </div>
            </div>
          </div>

          <Tabs defaultValue="leerling" className="min-w-0">
            <TabsList aria-label="Kies een schoolrol" className="mb-2 grid h-11 w-full grid-cols-3">
              {dashboardPreviews.map((preview) => (
                <TabsTrigger key={preview.role} value={preview.role} className="h-9">
                  {preview.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {dashboardPreviews.map((preview) => (
              <TabsContent key={preview.role} value={preview.role}>
                <figure>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Vergroot het ${preview.label.toLowerCase()}dashboard`}
                        className="block w-full overflow-hidden rounded-2xl border border-border/80 bg-card text-left shadow-[var(--shadow-elegant)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3 text-xs">
                          <span className="font-semibold">{preview.description}</span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-primary">
                            <Maximize2 className="h-3.5 w-3.5" /> Vergroten
                          </span>
                        </div>
                        <div className="aspect-[2/1] bg-muted/20">
                          <img
                            src={preview.image}
                            alt={preview.alt}
                            width={preview.width}
                            height={preview.height}
                            fetchPriority={preview.role === "leerling" ? "high" : "auto"}
                            className="block h-full w-full object-contain"
                          />
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-6xl overflow-y-auto p-4 sm:p-6">
                      <DialogTitle className="pr-8">
                        Het {preview.label.toLowerCase()}dashboard
                      </DialogTitle>
                      <DialogDescription>
                        Voorbeeld van de demo-omgeving met fictieve gegevens. Naam school is een
                        voorbeeldlabel.
                      </DialogDescription>
                      <div
                        tabIndex={0}
                        aria-label="Scroll door het vergrote dashboard"
                        className="max-h-[55dvh] overflow-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <img
                          src={preview.image}
                          alt={preview.alt}
                          width={preview.width}
                          height={preview.height}
                          className="h-auto w-full min-w-[900px]"
                        />
                      </div>
                      <a
                        href={`${DOMAIN_ORIGINS.demo}/app?role=${preview.role}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        Probeer de demo als {preview.label.toLowerCase()}{" "}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </DialogContent>
                  </Dialog>
                  <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{preview.label}dashboard · Fictieve voorbeeldgegevens</span>
                    <a
                      href={`${DOMAIN_ORIGINS.demo}/app?role=${preview.role}`}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      Zelf proberen <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </figcaption>
                </figure>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section id="in-actie" className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                Schoolpulse in actie
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Bekijk een volledig ingerichte schoolomgeving
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Verken Schoolpulse met realistische voorbeeldgegevens en bekijk het platform vanuit
                directie, docent, ouder en leerling. Zo ervaart u zelf hoe dagelijkse processen
                samenkomen voordat u een beslissing neemt.
              </p>
              <a
                href={`${DOMAIN_ORIGINS.demo}/app`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-5 py-3 text-sm font-semibold shadow-[var(--shadow-soft)] hover:bg-muted"
              >
                Open de interactieve demo <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Rooster", "Bekijk lessen, lokalen en wijzigingen per rol."],
                ["Absenties", "Registreer en volg aanwezigheid zonder losse lijsten."],
                ["Berichten", "Bereik een klas, jaarlaag of oudergroep vanuit één plek."],
                ["Cijfers", "Geef leerlingen en ouders helder inzicht in resultaten."],
                ["Ouderportaal", "Bundel gesprekken, berichten en voortgang van het kind."],
                ["Management", "Volg meldingen, verzuim en schoolbrede ontwikkelingen."],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-soft)]"
                >
                  <div className="text-sm font-semibold">{title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="vertrouwen" className="scroll-mt-20 border-b border-border/60 bg-muted/35 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Duidelijkheid voordat jullie kiezen</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Bekijk hoe het platform werkt en bespreek de afspraken over persoonsgegevens en
            invoering voor jullie school.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Verkennen met voorbeeldgegevens",
                description:
                  "De ingerichte demo laat rooster, berichten en resultaten zien met fictieve schoolgegevens.",
                to: "/privacy",
                label: "Lees over de demo en privacy",
              },
              {
                title: "Een overzicht per schoolrol",
                description:
                  "Probeer de demo als leerling, ouder, docent of directie en bekijk welke informatie iedere rol nodig heeft.",
                to: "/#doelgroepen",
                label: "Ontdek de schoolrollen",
              },
              {
                title: "Invoering en afspraken bespreken",
                description:
                  "Bespreek inrichting, gegevensoverdracht, training en ondersteuning. Vraag ook naar hosting, bewaartermijnen en de verwerkersovereenkomst.",
                to: "/contact",
                label: "Bespreek jullie situatie",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/70 bg-background p-5 shadow-[var(--shadow-soft)]"
              >
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <a
                  href={item.to}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  {item.label} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="waarde" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Waardepropositie
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Gebouwd voor de praktijk op school
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                t: "Rooster & planning",
                d: "Actueel rooster, management-agenda en wijzigingsinzicht in één flow.",
              },
              {
                icon: MessageSquare,
                t: "Communicatie per rol",
                d: "Leerling, ouder, docent en management zien alleen relevante berichten.",
              },
              {
                icon: ShieldCheck,
                t: "Een overzicht per schoolrol",
                d: "Verken de omgeving vanuit leerling, ouder, docent of directie en bekijk hoe het overzicht per rol verschilt.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="doelgroepen"
        className="scroll-mt-20 border-y border-border/60 bg-muted/35 py-20"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Per doelgroep
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Iedereen het juiste overzicht
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                r: "directie",
                icon: Building2,
                d: "Schoolbrede inzichten, rapportages en bestuurlijke voortgang.",
              },
              {
                r: "docent",
                icon: Users,
                d: "Klassenbeheer, opdrachten, cijfers en communicatie zonder ruis.",
              },
              {
                r: "ouder",
                icon: Users,
                d: "Voortgang van kind, gesprekken en schoolberichten op één plek.",
              },
              {
                r: "leerling",
                icon: GraduationCap,
                d: "Rooster, taken en berichten overzichtelijk en snel.",
              },
            ].map(({ r, icon: Icon, d }) => (
              <a
                key={r}
                href={`${DOMAIN_ORIGINS.demo}/app?role=${r}`}
                className="group rounded-2xl border border-border/80 bg-background p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-primary/60"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-base font-semibold">{roleLabels[r as Role]}</div>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open demo <ArrowRight className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="implementatie" className="scroll-mt-20 border-b border-border/60 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Invoering op school
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Van kennismaking naar een ingerichte schoolomgeving
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Dit bespreken we samen voordat jullie starten. De planning en ondersteuning stemmen we
              af op de situatie van jullie school.
            </p>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Kennismaking & demo",
                description:
                  "Bekijk de schoolrollen en bespreek welke processen, gebruikers en onderdelen jullie nodig hebben.",
              },
              {
                title: "Afspraken vastleggen",
                description:
                  "Bespreek privacy, hosting, bewaartermijnen, toegangsrechten en wie het aanspreekpunt is voor ondersteuning.",
              },
              {
                title: "Inrichten & controleren",
                description:
                  "Bepaal welke schoolgegevens worden overgezet en controleer samen accounts, klassen en het rooster.",
              },
              {
                title: "Voorbereiden & starten",
                description:
                  "Maak afspraken over uitleg voor het team, de controle vóór ingebruikname en ondersteuning na de start.",
              },
            ].map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border/80 bg-card p-5">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Bespreek de invoering voor jullie school <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section id="demo" className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-[var(--shadow-elegant)] md:p-10">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Volgende stap
                </div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  Vraag een vrijblijvende offerte aan
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Ontvang een voorstel dat past bij jullie school én toegang tot onze interactieve
                  demo-omgeving. Verken Schoolpulse met realistische voorbeeldgegevens.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Offerte aanvragen <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-5 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    Contact opnemen
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Vrijblijvend voorstel voor jullie school",
                  "Toegang tot de interactieve demo-omgeving",
                  "Reactie binnen één werkdag",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-xl border border-border/70 bg-background p-3 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-6 w-6" />
            <span className="text-sm text-muted-foreground">© 2026 Schoolpulse</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:justify-end">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              to="/voorwaarden"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Voorwaarden
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
