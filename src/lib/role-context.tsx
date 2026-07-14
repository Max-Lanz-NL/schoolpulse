import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./demo-data";

export type DemoUser = { name: string; email: string } | null;
const validRoles: Role[] = ["leerling", "docent", "ouder", "teamleider", "directie"];

function isRole(value: string | null): value is Role {
  return value !== null && validRoles.includes(value as Role);
}

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  demoUser: DemoUser;
  setDemoUser: (u: DemoUser) => void;
};
const RoleContext = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("leerling");
  const [demoUser, setDemoUserState] = useState<DemoUser>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("schoolpulse.role");
    if (isRole(saved)) {
      setRoleState(saved);
    }

    const roleFromQuery = new URL(window.location.href).searchParams.get("role");
    if (isRole(roleFromQuery)) {
      setRoleState(roleFromQuery);
      window.localStorage.setItem("schoolpulse.role", roleFromQuery);
    }

    const u = window.localStorage.getItem("schoolpulse.demoUser");
    if (u) {
      try {
        setDemoUserState(JSON.parse(u));
      } catch {
        /* noop */
      }
    }
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem("schoolpulse.role", r);
  };
  const setDemoUser = (u: DemoUser) => {
    setDemoUserState(u);
    if (typeof window !== "undefined") {
      if (u) window.localStorage.setItem("schoolpulse.demoUser", JSON.stringify(u));
      else window.localStorage.removeItem("schoolpulse.demoUser");
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, demoUser, setDemoUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
