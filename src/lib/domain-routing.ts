import { DOMAIN_ORIGINS } from "./domains";

const marketingHosts = new Set(["schoolpulse.nl", "www.schoolpulse.nl"]);
const appHosts = new Set(["app.schoolpulse.nl", "demo.schoolpulse.nl", "test.schoolpulse.nl"]);
const apiHost = "api.schoolpulse.nl";
const docsHost = "docs.schoolpulse.nl";

const marketingPages = new Set(["/", "/contact", "/privacy", "/voorwaarden"]);
const marketingPrefixPages = ["/features/"];
const appPrefix = "/app";

function isInternalAssetPath(pathname: string): boolean {
  if (pathname.startsWith("/_")) return true;
  if (pathname.startsWith("/assets/")) return true;
  if (pathname.startsWith("/images/")) return true;
  if (pathname === "/favicon.ico" || pathname === "/favicon.png") return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  return false;
}

function isMarketingPath(pathname: string): boolean {
  if (marketingPages.has(pathname)) return true;
  return marketingPrefixPages.some((prefix) => pathname.startsWith(prefix));
}

function isAppPath(pathname: string): boolean {
  return pathname === appPrefix || pathname.startsWith(`${appPrefix}/`);
}

function normalizeHost(rawHost: string | null): string {
  if (!rawHost) return "";
  const firstHost = rawHost.split(",")[0]?.trim() ?? "";
  return firstHost.toLowerCase().replace(/:\d+$/, "");
}

function getHostname(request: Request): string {
  const forwardedHost = normalizeHost(request.headers.get("x-forwarded-host"));
  if (forwardedHost) return forwardedHost;

  const host = normalizeHost(request.headers.get("host"));
  if (host) return host;

  try {
    return new URL(request.url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isLocalOrPreviewHost(hostname: string): boolean {
  if (!hostname) return true;
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.endsWith(".vercel.app")) return true;
  return false;
}

function redirect(url: string, status = 307): Response {
  return new Response(null, { status, headers: { location: url } });
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function docsPathFromPathname(pathname: string): string {
  if (pathname === "/docs") return "/";
  if (pathname.startsWith("/docs/")) {
    const stripped = pathname.slice("/docs".length);
    return stripped || "/";
  }
  return pathname;
}

function toOriginUrl(origin: string, pathname: string, search: string): string {
  return `${origin}${pathname}${search}`;
}

function apiDomainResponse(pathname: string): Response {
  if (pathname === "/" || pathname === "/api") {
    return jsonResponse({
      service: "schoolpulse-api",
      status: "ready",
      basePath: "/api",
      health: "/health",
    });
  }

  if (pathname === "/health" || pathname === "/api/health") {
    return jsonResponse({ status: "ok", service: "schoolpulse-api" });
  }

  if (pathname.startsWith("/api/")) {
    return jsonResponse(
      {
        error: "Not Implemented",
        message: "Deze API-route is nog niet beschikbaar.",
      },
      501,
    );
  }

  return jsonResponse(
    {
      error: "Not Found",
      message: "Gebruik het /api pad op api.schoolpulse.nl.",
    },
    404,
  );
}

function docsDomainResponse(pathname: string): Response {
  if (pathname !== "/" && pathname !== "/index.html") {
    return htmlResponse(
      `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Schoolpulse Docs</title></head><body style="font-family: Inter, system-ui, sans-serif; margin: 40px; line-height: 1.5;"><h1>Documentatiepad niet gevonden</h1><p>De documentatie-home staat op <a href="${DOMAIN_ORIGINS.docs}/">${DOMAIN_ORIGINS.docs}</a>.</p></body></html>`,
      404,
    );
  }

  return htmlResponse(
    `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Schoolpulse Docs</title></head><body style="font-family: Inter, system-ui, sans-serif; margin: 40px; line-height: 1.5;"><h1>Schoolpulse documentatie</h1><p>Dit domein is gereserveerd voor productdocumentatie.</p><p>App: <a href="${DOMAIN_ORIGINS.app}/app">${DOMAIN_ORIGINS.app}/app</a><br/>API: <a href="${DOMAIN_ORIGINS.api}/api">${DOMAIN_ORIGINS.api}/api</a></p></body></html>`,
  );
}

export function handleDomainRouting(request: Request): Response | null {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const search = url.search;
  const hostname = getHostname(request);

  if (isLocalOrPreviewHost(hostname) || isInternalAssetPath(pathname)) {
    return null;
  }

  if (hostname === "www.schoolpulse.nl") {
    return redirect(toOriginUrl(DOMAIN_ORIGINS.marketing, pathname, search), 308);
  }

  if (marketingHosts.has(hostname)) {
    if (isAppPath(pathname)) {
      return redirect(toOriginUrl(DOMAIN_ORIGINS.app, pathname, search));
    }
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return redirect(toOriginUrl(DOMAIN_ORIGINS.api, pathname, search));
    }
    if (pathname === "/docs" || pathname.startsWith("/docs/")) {
      return redirect(toOriginUrl(DOMAIN_ORIGINS.docs, docsPathFromPathname(pathname), search));
    }
    return null;
  }

  if (appHosts.has(hostname)) {
    const appOrigin =
      hostname === "demo.schoolpulse.nl"
        ? DOMAIN_ORIGINS.demo
        : hostname === "test.schoolpulse.nl"
          ? DOMAIN_ORIGINS.test
          : DOMAIN_ORIGINS.app;

    if (pathname === "/") {
      return redirect(toOriginUrl(appOrigin, appPrefix, search));
    }
    if (isAppPath(pathname)) {
      return null;
    }
    if (isMarketingPath(pathname)) {
      return redirect(toOriginUrl(DOMAIN_ORIGINS.marketing, pathname, search));
    }
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return redirect(toOriginUrl(DOMAIN_ORIGINS.api, pathname, search));
    }
    if (pathname === "/docs" || pathname.startsWith("/docs/")) {
      return redirect(toOriginUrl(DOMAIN_ORIGINS.docs, docsPathFromPathname(pathname), search));
    }
    return redirect(toOriginUrl(appOrigin, appPrefix, ""));
  }

  if (hostname === apiHost) {
    return apiDomainResponse(pathname);
  }

  if (hostname === docsHost) {
    if (pathname === "/docs" || pathname.startsWith("/docs/")) {
      return redirect(toOriginUrl(DOMAIN_ORIGINS.docs, docsPathFromPathname(pathname), search), 308);
    }
    return docsDomainResponse(pathname);
  }

  return null;
}
