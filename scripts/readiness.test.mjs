import assert from "node:assert/strict";
import test from "node:test";

import { checkReadiness } from "../src/lib/readiness.ts";

const config = {
  supabaseUrl: "https://example.supabase.co",
  publishableKey: "test-publishable-key",
};

test("readiness is healthy when database API and Auth respond", async () => {
  const result = await checkReadiness(config, async () => new Response("ok", { status: 200 }));
  assert.equal(result.status, "healthy");
  assert.deepEqual(
    result.dependencies.map(({ status }) => status),
    ["healthy", "healthy"],
  );
});

test("readiness is degraded when one critical dependency fails", async () => {
  const result = await checkReadiness(config, async (input) =>
    String(input).includes("/auth/")
      ? new Response("down", { status: 503 })
      : new Response("ok", { status: 200 }),
  );
  assert.equal(result.status, "degraded");
});

test("readiness is unhealthy and fail closed without configuration", async () => {
  const result = await checkReadiness({}, async () => new Response("ok", { status: 200 }));
  assert.equal(result.status, "unhealthy");
});

test("readiness output never contains configuration or credentials", async () => {
  const result = await checkReadiness(config, async () => new Response("ok", { status: 200 }));
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes(config.supabaseUrl), false);
  assert.equal(serialized.includes(config.publishableKey), false);
  assert.equal(serialized.includes("stack"), false);
});
