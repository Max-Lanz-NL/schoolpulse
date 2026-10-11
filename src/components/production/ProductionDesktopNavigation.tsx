import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";

type NavigationModule = {
  path: string;
  label: string;
  icon: LucideIcon;
  section?: "primary" | "management" | "hidden";
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
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Modules
        </div>
        {modules.map((module, index) => {
          const Icon = module.icon;
          const previous = modules[index - 1];
          const sectionLabel =
            index > 0 && previous?.section !== module.section
              ? module.section === "management"
                ? "Beheer"
                : module.section === "hidden"
                  ? "Overige onderdelen"
                  : null
              : null;
          return (
            <div key={module.path}>
              {sectionLabel ? (
                <div className="mb-2 mt-5 border-t border-sidebar-border px-3 pt-4 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {sectionLabel}
                </div>
              ) : null}
              <Link
                to={module.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === module.path ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"}`}
              >
                <Icon className="h-4 w-4" /> {module.label}
              </Link>
            </div>
          );
        })}
      </nav>
    </>
  );
}
