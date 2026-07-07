import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { roleLabels, roleUsers, meldingen, docentMeldingen, teamleiderMeldingen, directieMeldingen, berichten as leerlingBerichten, docentBerichten, ouderBerichten, teamleiderBerichten, directieBerichten, type Role } from "@/lib/demo-data";
import {
  LayoutDashboard, Calendar, BarChart3, MessageSquare, FileCheck,
  FolderOpen, CalendarCheck, Bell, Search, Settings, LogOut,
  ChevronDown, User, Shield, HelpCircle, Moon, Sun, X, GraduationCap, Users, Building2,
  BookOpen, UserCheck, AlertCircle, CalendarDays, Briefcase, RefreshCw, Upload,
  CalendarRange, ClipboardCheck, PenLine, ClipboardList, Type, UserCog,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DemoGate } from "./DemoGate";
import logo from "@/assets/schoolpulse-logo.png";
import { toast } from "sonner";

const berichtenBadge = (role: Role): number => {
  const map = { leerling: leerlingBerichten, docent: docentBerichten, ouder: ouderBerichten, teamleider: teamleiderBerichten, directie: directieBerichten };
  return map[role].filter((b) => b.ongelezen).length;
};

const getModules = (role: Role) => {
  const badge = berichtenBadge(role) || undefined;
  const base = [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/app/rooster", label: "Rooster", icon: Calendar },
    { to: "/app/cijfers", label: "Cijfers", icon: BarChart3 },
    { to: "/app/berichten", label: "Berichten", icon: MessageSquare, badge },
    { to: "/app/opdrachten", label: "Opdrachten", icon: FileCheck },
    { to: "/app/documenten", label: "Bestanden", icon: FolderOpen },
    { to: "/app/activiteiten", label: "Activiteiten", icon: CalendarCheck },
  ];
  if (role === "leerling") return [...base,
    { to: "/app/huiswerk", label: "Huiswerk", icon: BookOpen },
    { to: "/app/aanwezigheid", label: "Aanwezigheid", icon: UserCheck },
    { to: "/app/studieplanner", label: "Studieplanner", icon: CalendarRange },
  ];
  if (role === "ouder") return [...base,
    { to: "/app/agenda", label: "Agenda", icon: CalendarDays },
    { to: "/app/aanwezigheid", label: "Aanwezigheid", icon: UserCheck },
    { to: "/app/absentie", label: "Absentie melden", icon: AlertCircle },
    { to: "/app/gesprekken", label: "Gesprekken", icon: CalendarDays },
    { to: "/app/toestemming", label: "Toestemming", icon: ClipboardCheck },
  ];
  if (role === "docent") return [...base,
    { to: "/app/leerlingen", label: "Leerlingen", icon: GraduationCap },
    { to: "/app/gesprekken", label: "Gesprekken", icon: CalendarDays },
    { to: "/app/toetsen", label: "Toetsen", icon: PenLine },
  ];
  if (role === "teamleider") return [...base,
    { to: "/app/leerlingen", label: "Leerlingen", icon: GraduationCap },
    { to: "/app/personeel", label: "Personeel", icon: Briefcase },
    { to: "/app/vervanging", label: "Vervanging", icon: RefreshCw },
    { to: "/app/gesprekken", label: "Gesprekken", icon: CalendarDays },
    { to: "/app/rapporten", label: "Rapporten", icon: ClipboardList },
  ];
  if (role === "directie") return [...base,
    { to: "/app/personeel", label: "Personeel", icon: Briefcase },
    { to: "/app/gebruikersbeheer", label: "Gebruikersbeheer", icon: UserCog },
    { to: "/app/import", label: "Data import", icon: Upload },
    { to: "/app/rapporten", label: "Rapporten", icon: ClipboardList },
    { to: "/app/avg", label: "AVG & Privacy", icon: Shield },
  ];
  return base;
};

// Zoekindex — mapt trefwoorden aan modules
const searchIndex = [
  { label: "Dashboard", to: "/app", keys: ["home", "overzicht", "dashboard"] },
  { label: "Rooster", to: "/app/rooster", keys: ["rooster", "les", "uur", "week"] },
  { label: "Cijfers", to: "/app/cijfers", keys: ["cijfer", "gemiddelde", "toets", "resultaten"] },
  { label: "Berichten", to: "/app/berichten", keys: ["bericht", "chat", "mail"] },
  { label: "Opdrachten", to: "/app/opdrachten", keys: ["opdracht", "huiswerk", "inleveren", "taak"] },
  { label: "Bestanden", to: "/app/documenten", keys: ["bestand", "document", "map", "pdf"] },
  { label: "Activiteiten", to: "/app/activiteiten", keys: ["activiteit", "schoolreis", "poll", "aankondiging"] },
];

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <DemoGate>
      <AppShellInner title={title} subtitle={subtitle}>{children}</AppShellInner>
    </DemoGate>
  );
}

function AppShellInner({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const { role, setRole, setDemoUser } = useRole();
  const modules = getModules(role);
  const [open, setOpen] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sp-theme") === "dark";
  });
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">(() => {
    if (typeof window === "undefined") return "base";
    return (localStorage.getItem("sp-fontsize") as "sm" | "base" | "lg") ?? "base";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("sp-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const sizes: Record<string, string> = { sm: "14px", base: "16px", lg: "18px" };
    document.documentElement.style.fontSize = sizes[fontSize];
    localStorage.setItem("sp-fontsize", fontSize);
  }, [fontSize]);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const user = roleUsers[role];

  const notifRef = useRef<HTMLDivElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(t)) setSettingsOpen(false);
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));

  const results = searchQ.trim().length
    ? searchIndex.filter((s) => s.label.toLowerCase().includes(searchQ.toLowerCase()) || s.keys.some((k) => k.includes(searchQ.toLowerCase())))
    : [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Demo Banner */}
      {bannerOpen && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-2 bg-primary px-4 py-2 text-primary-foreground">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-semibold">Demo als: {roleLabels[role]}</span>
            <span className="hidden text-primary-foreground/60 sm:inline">·</span>
            <div className="hidden flex-wrap gap-1 sm:flex">
              {(Object.keys(roleLabels) as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${r === role ? "bg-primary-foreground text-primary" : "bg-primary-foreground/20 hover:bg-primary-foreground/30"}`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setBannerOpen(false)} className="shrink-0 rounded p-0.5 hover:bg-primary-foreground/20">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {/* Sidebar — altijd fixed, met eigen scroll */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
          <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold tracking-tight text-white">Schoolpulse</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Demo omgeving</div>
          </div>
        </div>

        <div className="px-3 pt-4">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">Modules</div>
          <nav className="space-y-0.5">
            {modules.map((m) => {
              const active = isActive(m.to, m.exact);
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                  }`}
                >
                  <m.icon className="h-4 w-4" />
                  <span className="flex-1">{m.label}</span>
                  {m.badge ? (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{m.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-sidebar-border p-3">
          <div className="relative">
            <button
              onClick={() => setRolePickerOpen((v) => !v)}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-sidebar-accent"
            >
              <img src={user.avatar} alt={user.name} className="h-9 w-9 shrink-0 rounded-full bg-sidebar-primary/40 object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                <div className="truncate text-[11px] text-sidebar-foreground/60">{roleLabels[role]}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
            </button>
            {rolePickerOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-sidebar-border bg-card text-card-foreground shadow-lg">
                <div className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Wissel rol</div>
                {(Object.keys(roleLabels) as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setRolePickerOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted ${r === role ? "font-semibold text-primary" : ""}`}
                  >
                    <img src={roleUsers[r].avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                    {roleLabels[r]}
                  </button>
                ))}
                <div className="border-t border-border">
                  <button
                    onClick={() => { setDemoUser(null); navigate({ to: "/" }); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Uitloggen & terug
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main — met marge voor sidebar */}
      <div className="flex min-h-screen min-w-0 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="mt-1 block h-0.5 w-5 bg-foreground" />
            <span className="mt-1 block h-0.5 w-5 bg-foreground" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold">{title}</div>
            {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
          </div>

          {/* Zoekbalk */}
          <div ref={searchRef} className="relative hidden md:block">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={searchQ}
                onChange={(e) => { setSearchQ(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Zoek in Schoolpulse..."
                className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {searchOpen && searchQ && (
              <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
                {results.length ? results.map((r) => (
                  <button
                    key={r.to}
                    onClick={() => { navigate({ to: r.to }); setSearchOpen(false); setSearchQ(""); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground" /> {r.label}
                  </button>
                )) : (
                  <div className="px-3 py-4 text-center text-xs text-muted-foreground">Geen resultaten voor "{searchQ}"</div>
                )}
              </div>
            )}
          </div>

          {/* Meldingen */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-lg p-2 hover:bg-muted"
              aria-label="Notificaties"
            >
              <Bell className="h-4 w-4" />
              {unread && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <div className="text-xs font-semibold">Meldingen</div>
                  <button
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => { setUnread(false); setNotifOpen(false); toast.success("Alle meldingen als gelezen gemarkeerd"); }}
                  >
                    Alles gelezen
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {(role === "directie" ? directieMeldingen : role === "teamleider" ? teamleiderMeldingen : role === "docent" ? docentMeldingen : meldingen).map((m) => (
                    <button
                      key={m.titel}
                      onClick={() => { navigate({ to: m.link }); setNotifOpen(false); }}
                      className={`flex w-full items-start gap-3 border-b border-border px-3 py-2.5 text-left hover:bg-muted ${!unread ? "opacity-60" : ""}`}
                    >
                      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-primary" : "bg-muted-foreground"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">{m.titel}</div>
                        <div className="text-[11px] text-muted-foreground">{m.tijd} geleden</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instellingen */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted"
              aria-label="Profiel"
            >
              <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
              <Settings className="hidden h-4 w-4 text-muted-foreground md:block" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
                <div className="flex items-center gap-3 border-b border-border p-3">
                  <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{user.sub}</div>
                  </div>
                </div>
                <div className="py-1">
                  {[
                    { icon: User, label: "Mijn profiel", msg: "Profielbeheer komt binnenkort beschikbaar" },
                    { icon: Shield, label: "Privacy & 2FA", msg: "Privacy- en 2FA-instellingen komen binnenkort" },
                    { icon: HelpCircle, label: "Help & support", msg: "Meer info op docs.schoolpulse.nl" },
                  ].map((it) => (
                    <button
                      key={it.label}
                      onClick={() => { toast(it.label, { description: it.msg }); setSettingsOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <it.icon className="h-4 w-4 text-muted-foreground" /> {it.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setDark((d) => !d); setSettingsOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    {dark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                    {dark ? "Lichte modus" : "Donkere modus"}
                  </button>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm">
                    <Type className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">Tekstgrootte</span>
                    <div className="flex gap-1">
                      {(["sm", "base", "lg"] as const).map((s, i) => (
                        <button
                          key={s}
                          onClick={() => setFontSize(s)}
                          className={`rounded px-2 py-0.5 text-[11px] font-semibold ${fontSize === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                        >
                          {["A-", "A", "A+"][i]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border">
                  <button
                    onClick={() => { setDemoUser(null); navigate({ to: "/" }); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" /> Uitloggen
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 pb-20 md:p-8 md:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-background md:hidden">
        {getModules(role).slice(0, 5).map((m) => {
          const active = isActive(m.to, m.exact);
          return (
            <Link
              key={m.to}
              to={m.to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <m.icon className="h-5 w-5" />
              {m.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
