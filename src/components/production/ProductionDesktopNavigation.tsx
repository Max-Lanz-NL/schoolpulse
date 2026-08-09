import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";

type NavigationModule = {
  path: string;
  label: string;
  icon: LucideIcon;
};

export function ProductionDesktopNavigation({
  modules,
  pathname,
}: {
  modules: readonly NavigationModule[];
  pathname: string;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
        <div>
          <div className="text-sm font-bold text-white">Schoolpulse</div>
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
            Productieomgeving 1.0
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 pt-5" aria-label="Productienavigatie">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.path}
              to={module.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${pathname === module.path ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}
            >
              <Icon className="h-4 w-4" /> {module.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
