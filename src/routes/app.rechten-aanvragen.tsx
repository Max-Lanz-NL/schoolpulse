import { createFileRoute } from "@tanstack/react-router";
import { ShieldQuestion } from "lucide-react";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/app/rechten-aanvragen")({
  component: PermissionRequestRoute,
});

function PermissionRequestRoute() {
  return (
    <AppShell
      title="Rechten aanvragen"
      subtitle="Vraag veilig wijzigingen in rollen en toegang aan"
    >
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <ShieldQuestion className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-lg font-bold">Beschikbaar in de productieomgeving</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Directieleden kunnen in de productieomgeving stap voor stap een wijziging in rollen,
          rangen of rechten aanvragen. Een aanvraag past nooit automatisch permissies aan.
        </p>
      </div>
    </AppShell>
  );
}
