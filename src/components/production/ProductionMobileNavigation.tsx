import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { ProductionModule } from "@/domains/shared/production-modules";

const icons = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  results: BarChart3,
  learning: BookOpen,
  attendance: CheckCircle2,
  people: Users,
  settings: Settings,
};

export function ProductionMobileNavigation({
  modules,
  pathname,
}: {
  modules: ProductionModule[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const primary = modules.filter((module) => module.navigation === "primary");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-30 rounded-lg border border-border bg-background p-2 shadow-sm md:hidden"
        aria-label="Navigatie openen"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/45"
            onClick={() => setOpen(false)}
            aria-label="Navigatie sluiten"
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col bg-sidebar p-4 text-sidebar-foreground shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-sidebar-border pb-4">
              <div>
                <div className="font-bold text-white">Schoolpulse</div>
                <div className="text-xs opacity-60">Productieomgeving 1.0</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-sidebar-accent"
                aria-label="Navigatie sluiten"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {modules.map((module) => {
                const Icon = icons[module.icon];
                return (
                  <Link
                    key={module.path}
                    to={module.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${pathname === module.path ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {module.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Snelle navigatie"
      >
        {primary.slice(0, 5).map((module) => {
          const Icon = icons[module.icon];
          return (
            <Link
              key={module.path}
              to={module.path}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2 text-[10px] ${pathname === module.path ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{module.label.replace("Huiswerk & ", "")}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
