export type ClientErrorDetail = {
  error: unknown;
  context: Record<string, unknown>;
  occurredAt: string;
};

/**
 * Vendor-neutraal foutsignaal. Een toekomstige monitoringprovider kan luisteren
 * naar `schoolpulse:error` zonder dat de applicatie aan die provider vastzit.
 */
export function reportClientError(error: unknown, context: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ClientErrorDetail>("schoolpulse:error", {
      detail: { error, context, occurredAt: new Date().toISOString() },
    }),
  );
}
