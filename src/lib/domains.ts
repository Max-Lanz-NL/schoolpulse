export const DOMAIN_ORIGINS = {
  marketing: "https://schoolpulse.nl",
  marketingWww: "https://www.schoolpulse.nl",
  app: "https://app.schoolpulse.nl",
  demo: "https://demo.schoolpulse.nl",
  test: "https://test.schoolpulse.nl",
  api: "https://api.schoolpulse.nl",
  docs: "https://docs.schoolpulse.nl",
} as const;

export const DEMO_APP_URL = `${DOMAIN_ORIGINS.demo}/app`;

type DemoUrlOptions = {
  role?: string;
};

export function buildDemoAppUrl(options: DemoUrlOptions = {}): string {
  const url = new URL(DEMO_APP_URL);
  if (options.role) {
    url.searchParams.set("role", options.role);
  }
  return url.toString();
}
