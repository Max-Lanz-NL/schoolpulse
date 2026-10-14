import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Monitor, Smartphone } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { roleLabels, type Role } from "@/lib/demo-data";

export function DemoDevicePreview({ children }: { children: ReactNode }) {
  const [desktop, setDesktop] = useState(false);
  const [phone, setPhone] = useState(false);
  const [phoneUrl, setPhoneUrl] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });

  useEffect(() => {
    // A real iframe viewport triggers the same breakpoints as an actual phone.
    if (window.self !== window.top) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const syncRole = (event: StorageEvent) => {
      if (
        event.key === "schoolpulse.role" &&
        event.newValue &&
        Object.hasOwn(roleLabels, event.newValue)
      ) {
        setRole(event.newValue as Role);
      }
    };
    window.addEventListener("storage", syncRole);
    return () => window.removeEventListener("storage", syncRole);
  }, [setRole]);

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    if (!phone) return;
    let url = new URL(phoneUrl, window.location.origin);
    try {
      const current = frame.current?.contentWindow?.location.href;
      if (current) {
        const candidate = new URL(current);
        if (
          candidate.origin === window.location.origin &&
          /^\/app(?:\/|$)/.test(candidate.pathname)
        )
          url = candidate;
      }
    } catch {
      /* Use the last demo URL if the frame has followed an external link. */
    }
    url.searchParams.set("role", nextRole);
    setPhoneUrl(url.pathname + url.search + url.hash);
  }

  function showPhone() {
    if (phone) return;
    const url = new URL(location.href, window.location.origin);
    url.searchParams.set("role", role);
    setPhoneUrl(url.pathname + url.search + url.hash);
    setPhone(true);
  }

  function showComputer() {
    if (!phone) return;
    const savedRole = window.localStorage.getItem("schoolpulse.role");
    if (savedRole && Object.hasOwn(roleLabels, savedRole)) setRole(savedRole as Role);
    try {
      const url = new URL(frame.current?.contentWindow?.location.href ?? window.location.href);
      if (url.origin === window.location.origin && /^\/app(?:\/|$)/.test(url.pathname)) {
        if (savedRole && Object.hasOwn(roleLabels, savedRole))
          url.searchParams.set("role", savedRole);
        void navigate({ to: url.pathname + url.search + url.hash });
      }
    } catch {
      // Keep the desktop route if a visitor has followed an external demo link.
    }
    setPhone(false);
  }

  if (!desktop) return <>{children}</>;

  return (
    <>
      {phone ? (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-muted p-6 pb-24">
          <p className="text-sm font-medium text-muted-foreground">Telefoonweergave · 390 px</p>
          <div className="w-[406px] max-w-full overflow-hidden rounded-[2rem] border-8 border-sidebar bg-background shadow-2xl">
            <iframe
              ref={frame}
              src={phoneUrl}
              title="Schoolpulse demo op telefoon"
              className="block w-full border-0"
              style={{ height: "min(844px, calc(100dvh - 10rem))" }}
            />
          </div>
        </div>
      ) : (
        children
      )}
      <div
        role="group"
        aria-label="Demo schermformaat"
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-1 rounded-2xl border border-border bg-background p-1.5 shadow-lg"
      >
        <label className="mr-1 flex items-center gap-2 border-r border-border px-3 text-xs font-medium text-muted-foreground">
          Bekijk als
          <select
            aria-label="Schoolrol voor de demo"
            value={role}
            onChange={(event) => changeRole(event.target.value as Role)}
            className="min-h-11 rounded-lg bg-background px-2 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            {(Object.keys(roleLabels) as Role[]).map((item) => (
              <option key={item} value={item}>
                {roleLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-pressed={!phone}
          onClick={showComputer}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${!phone ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Monitor className="h-4 w-4" /> Computer
        </button>
        <button
          type="button"
          aria-pressed={phone}
          onClick={showPhone}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${phone ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Smartphone className="h-4 w-4" /> Telefoon
        </button>
      </div>
    </>
  );
}
