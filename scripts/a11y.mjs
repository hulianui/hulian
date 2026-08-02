#!/usr/bin/env node

import { pathToFileURL } from "node:url";

import { startStaticServer } from "./static-server.mjs";

const BASE_ROUTES = [
  "/",
  "/start",
  "/blocks",
  "/pages",
  "/theme",
  "/components/button",
  "/components/pro-table",
  "/components/dialog",
  "/pages/admin-list",
  "/pages/product-list",
];
export const DOCS_LOCALES = ["zh-CN", "en"];

function stripEnglishPrefix(route) {
  return route === "/en" ? "/" : route.startsWith("/en/") ? route.slice(3) : route;
}

function routeForLocale(route, locale) {
  const bare = stripEnglishPrefix(route);
  return locale === "en" ? `/en${bare === "/" ? "" : bare}` : bare;
}

export function expandBilingualRoutes(entries) {
  const expanded = [];
  const seen = new Set();
  for (const entry of entries) {
    const descriptor = typeof entry === "string" ? { route: entry } : entry;
    for (const locale of DOCS_LOCALES) {
      const localized = { ...descriptor, route: routeForLocale(descriptor.route, locale), locale };
      const key = `${locale}:${localized.route}`;
      if (seen.has(key)) continue;
      seen.add(key);
      expanded.push(localized);
    }
  }
  return expanded;
}

export function formatRouteLabel({ locale, route }) {
  return `[${locale ?? (route?.startsWith("/en") ? "en" : "zh-CN")}] ${route}`;
}

export const ROUTES = expandBilingualRoutes(BASE_ROUTES);
export const THEMES = ["light", "dark"];

export function classify(violations) {
  const blocking = violations.filter((violation) =>
    new Set(["critical", "serious"]).has(violation.impact),
  );
  const reported = violations.filter((violation) => !blocking.includes(violation));
  return { blocking, reported };
}

export function validateRouteResult(result) {
  if (result.loadFailed) {
    throw new Error(
      `${formatRouteLabel(result)} route load failed: ${result.route} (status ${result.status ?? "none"}; failed ${
        result.failed?.join(", ") || "none"
      })`,
    );
  }
  return classify(result.violations ?? []);
}

export function shouldIgnoreRequestFailure({ resourceType, errorText }) {
  return resourceType === "fetch" && errorText === "net::ERR_ABORTED";
}

export function shouldFailResponse({ url, status }, baseUrl) {
  return url.startsWith(`${baseUrl}/`) && status >= 400;
}

export async function runA11y() {
  const [{ chromium }, { default: AxeBuilder }] = await Promise.all([
    import("playwright"),
    import("@axe-core/playwright"),
  ]);
  const staticServer = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const theme of THEMES) {
      const context = await browser.newContext({ colorScheme: theme });
      await context.addInitScript((selectedTheme) => {
        window.localStorage.setItem("hulian-theme", selectedTheme);
        document.documentElement.setAttribute("data-theme", selectedTheme);
      }, theme);
      try {
        for (const { route, locale } of ROUTES) {
          const page = await context.newPage();
          const failed = [];
          page.on("requestfailed", (request) => {
            if (request.url().startsWith(staticServer.baseUrl)) {
              const failure = {
                resourceType: request.resourceType(),
                errorText: request.failure()?.errorText ?? "unknown",
              };
              if (shouldIgnoreRequestFailure(failure)) return;
              failed.push(`${failure.resourceType}:${failure.errorText}:${request.url()}`);
            }
          });
          page.on("response", (resource) => {
            const responseResult = { url: resource.url(), status: resource.status() };
            if (shouldFailResponse(responseResult, staticServer.baseUrl)) {
              failed.push(`http:${responseResult.status}:${responseResult.url}`);
            }
          });
          const response = await page.goto(`${staticServer.baseUrl}${route}`, {
            waitUntil: "networkidle",
          });
          const loadFailed = !response?.ok() || failed.length > 0;
          const analysis = loadFailed ? { violations: [] } : await new AxeBuilder({ page }).analyze();
          const result = {
            theme,
            route,
            locale,
            status: response?.status(),
            loadFailed,
            failed,
            violations: analysis.violations,
          };
          results.push(result);
          await page.close();
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await staticServer.close();
  }

  let blockingCount = 0;
  for (const result of results) {
    const { blocking, reported } = validateRouteResult(result);
    blockingCount += blocking.length;
    console.log(
      `[a11y] ${result.theme} ${formatRouteLabel(result)} · blocking ${blocking.length} · moderate/minor ${reported.length}`,
    );
    for (const violation of [...blocking, ...reported]) {
      console.log(`  [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}`);
      for (const node of violation.nodes.slice(0, 8)) {
        console.log(
          `    ${node.target.join(" ")} · ${node.failureSummary?.replace(/\s+/g, " ").trim()}`,
        );
      }
    }
  }
  if (blockingCount > 0) throw new Error(`axe 发现 ${blockingCount} 个 critical/serious 违规`);
  console.log(`[a11y] PASS ${results.length}/${THEMES.length * ROUTES.length} theme-routes`);
  return results;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runA11y().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
