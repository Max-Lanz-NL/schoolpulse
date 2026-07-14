type DomainKey = "marketing" | "marketingWww" | "app" | "admin" | "demo" | "test" | "api" | "docs";

const DEFAULT_ORIGINS: Record<DomainKey, string> = {
  marketing: "https://schoolpulse.nl",
  marketingWww: "https://www.schoolpulse.nl",
  app: "https://app.schoolpulse.nl",
  admin: "https://admin.schoolpulse.nl",
  demo: "https://demo.schoolpulse.nl",
  test: "https://test.schoolpulse.nl",
  api: "https://api.schoolpulse.nl",
  docs: "https://docs.schoolpulse.nl",
};

function origin(value: string | undefined, fallback: string): string {
  try {
    const parsed = new URL(value || fallback);
    return parsed.origin;
  } catch {
    return fallback;
  }
}

export const DOMAIN_ORIGINS = {
  marketing: origin(import.meta.env.VITE_MARKETING_ORIGIN, DEFAULT_ORIGINS.marketing),
  marketingWww: origin(import.meta.env.VITE_MARKETING_WWW_ORIGIN, DEFAULT_ORIGINS.marketingWww),
  app: origin(import.meta.env.VITE_APP_ORIGIN, DEFAULT_ORIGINS.app),
  admin: origin(import.meta.env.VITE_ADMIN_ORIGIN, DEFAULT_ORIGINS.admin),
  demo: origin(import.meta.env.VITE_DEMO_ORIGIN, DEFAULT_ORIGINS.demo),
  test: origin(import.meta.env.VITE_TEST_ORIGIN, DEFAULT_ORIGINS.test),
  api: origin(import.meta.env.VITE_API_ORIGIN, DEFAULT_ORIGINS.api),
  docs: origin(import.meta.env.VITE_DOCS_ORIGIN, DEFAULT_ORIGINS.docs),
} satisfies Record<DomainKey, string>;

export const DOMAIN_HOSTS = Object.fromEntries(
  Object.entries(DOMAIN_ORIGINS).map(([key, value]) => [key, new URL(value).hostname]),
) as Record<DomainKey, string>;

export const DEMO_APP_URL = `${DOMAIN_ORIGINS.demo}/app`;

type DemoUrlOptions = { role?: string };

export function buildDemoAppUrl(options: DemoUrlOptions = {}): string {
  const url = new URL(DEMO_APP_URL);
  if (options.role) url.searchParams.set("role", options.role);
  return url.toString();
}
