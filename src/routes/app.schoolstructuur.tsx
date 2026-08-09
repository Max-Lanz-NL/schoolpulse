import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/schoolstructuur")({ component: ProductionOnlyRoute });

function ProductionOnlyRoute() {
  return (
    <p className="p-8 text-sm text-muted-foreground">
      Schoolstructuur is beschikbaar in de productieomgeving.
    </p>
  );
}
