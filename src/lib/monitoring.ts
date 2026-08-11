export type OperationalEvent =
  | "frontend_runtime_error"
  | "server_runtime_error"
  | "auth_failure_spike"
  | "database_failure"
  | "readiness_failure"
  | "deployment_failure"
  | "infected_detected"
  | "scan_failed"
  | "scanner_unavailable"
  | "signature_stale";

type MonitoringConfig = {
  endpoint?: string;
  token?: string;
  environment?: string;
  release?: string;
};

export type MonitoringDelivery = "delivered" | "not_configured" | "failed";

function serverConfig(): MonitoringConfig {
  return {
    endpoint: process.env.SCHOOLPULSE_MONITORING_ENDPOINT,
    token: process.env.SCHOOLPULSE_MONITORING_TOKEN,
    environment: process.env.SCHOOLPULSE_ENVIRONMENT,
    release: process.env.SCHOOLPULSE_RELEASE,
  };
}

/** Sends only a fixed event name and deployment metadata; never error payloads. */
export async function reportOperationalEvent(
  event: OperationalEvent,
  config: MonitoringConfig = serverConfig(),
  fetcher: typeof fetch = fetch,
): Promise<MonitoringDelivery> {
  if (!config.endpoint || !config.token) return "not_configured";
  try {
    const response = await fetcher(config.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        event,
        service: "schoolpulse-web",
        environment: config.environment ?? "unknown",
        release: config.release ?? "unknown",
        occurred_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(2_000),
    });
    return response.ok ? "delivered" : "failed";
  } catch {
    return "failed";
  }
}
