import assert from "node:assert/strict";
import test from "node:test";

import { reportOperationalEvent } from "../src/lib/monitoring.ts";

test("monitoring remains inactive without real provider credentials", async () => {
  assert.equal(await reportOperationalEvent("server_runtime_error", {}), "not_configured");
});

test("provider adapter delivers only allowlisted deployment metadata", async () => {
  let captured;
  const delivery = await reportOperationalEvent(
    "readiness_failure",
    {
      endpoint: "https://monitor.invalid/events",
      token: "secret-token",
      environment: "staging",
      release: "abc123",
    },
    async (_input, init) => {
      captured = JSON.parse(String(init?.body));
      return new Response(null, { status: 202 });
    },
  );
  assert.equal(delivery, "delivered");
  assert.deepEqual(Object.keys(captured).sort(), [
    "environment",
    "event",
    "occurred_at",
    "release",
    "service",
  ]);
  assert.equal(JSON.stringify(captured).includes("secret-token"), false);
});
