import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./demo-data";

type Ctx = { role: Role; setRole: (r: Role) => void };
const RoleContext = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("leerling");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("schoolpulse.role") : null;
    if (saved && ["leerling", "docent", "ouder", "teamleider", "directie"].includes(saved)) {
      setRoleState(saved as Role);
    }
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem("schoolpulse.role", r);
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
