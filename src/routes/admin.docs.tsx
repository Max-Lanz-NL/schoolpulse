import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { getDocsSiteHtml } from "@/lib/docs-site";

export const Route = createFileRoute("/admin/docs")({
  component: AdminDocumentationPage,
});

function AdminDocumentationPage() {
  useEffect(() => {
    sessionStorage.setItem("schoolpulse-admin-return-to", "/admin/docs");
  }, []);

  return (
    <AdminGuard>
      {() => (
        <iframe
          title="SchoolPulse beheerhandleiding"
          srcDoc={getDocsSiteHtml("admin")}
          className="h-screen w-full border-0 bg-background"
        />
      )}
    </AdminGuard>
  );
}
