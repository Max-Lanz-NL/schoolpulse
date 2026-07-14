import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/begeleiding")({ component: ProductionOnlyRoute });

function ProductionOnlyRoute() {
  return (
    <p className="p-8 text-sm text-muted-foreground">
      Begeleiding is beschikbaar in de productieomgeving.
    </p>
  );
}
