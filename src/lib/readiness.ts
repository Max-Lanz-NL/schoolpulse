export type ReadinessStatus = "healthy" | "degraded" | "unhealthy";

type DependencyName = "database_api" | "auth";

type DependencyResult = {
  name: DependencyName;
  status: "healthy" | "unhealthy";
};

export type ReadinessResult = {
  status: ReadinessStatus;
  service: "schoolpulse-web";
  dependencies: DependencyResult[];
};

type ReadinessConfig = {
  supabaseUrl?: string;
  publishableKey?: string;
  timeoutMs?: number;
};

function dependency(name: DependencyName, healthy: boolean): DependencyResult {
  return { name, status: healthy ? "healthy" : "unhealthy" };
}

async function probe(
  url: string,
  publishableKey: string,
  fetcher: typeof fetch,
  timeoutMs: number,
): Promise<boolean> {
  try {
    const response = await fetcher(url, {
      method: "GET",
      headers: { apikey: publishableKey },
      signal: AbortSignal.timeout(timeoutMs),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkReadiness(
  config: ReadinessConfig,
  fetcher: typeof fetch = fetch,
): Promise<ReadinessResult> {
  const baseUrl = config.supabaseUrl?.replace(/\/$/, "");
  const publishableKey = config.publishableKey;
  if (!baseUrl || !publishableKey) {
    return {
      status: "unhealthy",
      service: "schoolpulse-web",
      dependencies: [dependency("database_api", false), dependency("auth", false)],
    };
  }

  const timeoutMs = config.timeoutMs ?? 3_000;
  const [databaseApi, auth] = await Promise.all([
    probe(`${baseUrl}/rest/v1/`, publishableKey, fetcher, timeoutMs),
    probe(`${baseUrl}/auth/v1/health`, publishableKey, fetcher, timeoutMs),
  ]);
  const healthyCount = Number(databaseApi) + Number(auth);
  const status: ReadinessStatus =
    healthyCount === 2 ? "healthy" : healthyCount === 0 ? "unhealthy" : "degraded";

  return {
    status,
    service: "schoolpulse-web",
    dependencies: [dependency("database_api", databaseApi), dependency("auth", auth)],
  };
}

export async function readinessResponse(fetcher: typeof fetch = fetch): Promise<Response> {
  const result = await checkReadiness(
    {
      supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
      publishableKey:
        process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    fetcher,
  );

  return new Response(JSON.stringify(result), {
    status: result.status === "healthy" ? 200 : 503,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}
