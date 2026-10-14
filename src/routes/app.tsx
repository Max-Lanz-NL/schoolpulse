import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DemoGate } from "@/components/DemoGate";
import { DemoDevicePreview } from "@/components/DemoDevicePreview";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <DemoGate>
      <DemoDevicePreview>
        <Outlet />
      </DemoDevicePreview>
    </DemoGate>
  );
}
