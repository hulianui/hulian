#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "apps", "www", "out");

export const ROUTES = [
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
      `route load failed: ${result.route} (status ${result.status ?? "none"}; failed ${
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

function contentType(file) {
  return (
    {
      ".css": "text/css",
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript",
      ".json": "application/json",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".woff2": "font/woff2",
    }[extname(file)] ?? "application/octet-stream"
  );
}

function resolveStaticFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  const base = join(OUT_DIR, clean);
  const candidates = [base, `${base}.html`, join(base, "index.html")];
  for (const candidate of candidates) {
    if (
      !relative(OUT_DIR, candidate).startsWith("..") &&
      existsSync(candidate) &&
      statSync(candidate).isFile()
    ) {
      return candidate;
    }
  }
  return null;
}

async function startStaticServer() {
  if (!existsSync(join(OUT_DIR, "index.html"))) {
    throw new Error("apps/www/out 不存在，请先运行 pnpm --filter www build");
  }
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const file = resolveStaticFile(pathname);
    if (!file) {
      response.writeHead(404).end("not found");
      return;
    }
    response.setHeader("content-type", contentType(file));
    response.end(readFileSync(file));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      server.close();
      server.closeAllConnections();
    },
  };
}

export async function runA11y() {
  const [{ chromium }, { default: AxeBuilder }] = await Promise.all([
    import("playwright"),
    import("@axe-core/playwright"),
  ]);
  const staticServer = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];
  try {
    for (const route of ROUTES) {
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
        route,
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
    await browser.close();
    await staticServer.close();
  }

  let blockingCount = 0;
  for (const result of results) {
    const { blocking, reported } = validateRouteResult(result);
    blockingCount += blocking.length;
    console.log(
      `[a11y] ${result.route} · blocking ${blocking.length} · moderate/minor ${reported.length}`,
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
  console.log(`[a11y] PASS ${results.length}/${ROUTES.length} routes`);
  return results;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runA11y().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
