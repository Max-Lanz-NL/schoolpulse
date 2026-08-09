import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/notificaties")({ component: ProductionOnlyRoute });

function ProductionOnlyRoute() {
  return (
    <p className="p-8 text-sm text-muted-foreground">
      Notificaties zijn beschikbaar in de productieomgeving.
    </p>
  );
}
