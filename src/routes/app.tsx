import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DemoGate } from "@/components/DemoGate";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <DemoGate>
      <Outlet />
    </DemoGate>
  );
}
