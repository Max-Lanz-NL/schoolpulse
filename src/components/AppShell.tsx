import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { roleLabels, roleUsers, type Role } from "@/lib/demo-data";
import {
  LayoutDashboard, Calendar, BarChart3, MessageSquare, FileCheck,
  FolderOpen, CalendarCheck, Bell, Search, Settings, LogOut, Sparkles,
  ChevronDown,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const modules = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/rooster", label: "Rooster", icon: Calendar },
  { to: "/app/cijfers", label: "Cijfers", icon: BarChart3 },
  { to: "/app/berichten", label: "Berichten", icon: MessageSquare, badge: 2 },
  { to: "/app/opdrachten", label: "Opdrachten", icon: FileCheck },
  { to: "/app/documenten", label: "Documenten", icon: FolderOpen },
  { to: "/app/activiteiten", label: "Activiteiten", icon: CalendarCheck },
];

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const user = roleUsers[role];

  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">Schoolpulse</div>
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
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                {user.initials}
              </div>
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
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px] font-bold">{roleUsers[r].initials}</span>
                    {roleLabels[r]}
                  </button>
                ))}
                <div className="border-t border-border">
                  <button onClick={() => navigate({ to: "/" })} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                    <LogOut className="h-3.5 w-3.5" /> Terug naar site
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
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
          <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Zoek..." className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <span className="rounded border border-border px-1 text-[10px] text-muted-foreground">⌘K</span>
          </div>
          <button className="relative rounded-lg p-2 hover:bg-muted" aria-label="Notificaties">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          <button className="rounded-lg p-2 hover:bg-muted" aria-label="Instellingen">
            <Settings className="h-4 w-4" />
          </button>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
