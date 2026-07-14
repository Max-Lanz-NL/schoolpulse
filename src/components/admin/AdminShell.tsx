import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import logo from "@/assets/schoolpulse-logo.png";
import { getAdminSupabaseClient, type Profile } from "@/lib/admin-client";

type NavItem = {
  to:
    | "/admin/dashboard"
    | "/admin/accounts"
    | "/admin/schools"
    | "/admin/structure"
    | "/admin/relations"
    | "/admin/roles";
  label: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/accounts", label: "Accounts", icon: Users },
  { to: "/admin/schools", label: "Scholen", icon: Building2 },
  { to: "/admin/structure", label: "Schoolstructuur", icon: GraduationCap },
  { to: "/admin/relations", label: "Inschrijvingen & koppelingen", icon: Network },
  { to: "/admin/roles", label: "Rollen & rangen", icon: ShieldCheck },
];

export function AdminShell({
  profile,
  title,
  subtitle,
  children,
}: {
  profile: Profile;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const logout = async () => {
    const supabase = getAdminSupabaseClient();
    await supabase.auth.signOut();
    window.location.assign("/admin/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
          <div>
            <div className="text-sm font-bold tracking-tight text-white">Schoolpulse Admin</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              platform beheer
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <div className="truncate text-sm font-semibold text-white">
              {profile.full_name ?? profile.email}
            </div>
            <div className="truncate text-[11px] text-sidebar-foreground/70">{profile.email}</div>
            <div className="mt-1 inline-flex rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
              {profile.role}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Uitloggen
          </button>
        </div>
      </aside>

      <main className="md:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-6 py-4 backdrop-blur">
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
