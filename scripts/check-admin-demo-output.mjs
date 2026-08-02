import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const ADMIN_DEMO_ROUTES = [
  "billing", "billing/invoices", "billing/payment", "billing/plans", "billing/settings", "billing/login",
  "crm", "crm/customers", "crm/customers/C1001", "crm/opportunities", "crm/orders", "crm/settings", "crm/login",
  "customer-service", "customer-service/analytics", "customer-service/knowledge", "customer-service/tickets", "customer-service/tickets/T-2059", "customer-service/settings", "customer-service/login",
  "projects", "projects/checkout", "projects/checkout/co1", "projects/invoices", "projects/photos", "projects/quotes", "projects/quotes/q1", "projects/tracking", "projects/tracking/p1",
  "hanhub", "hanhub/billing", "hanhub/health", "hanhub/keys", "hanhub/logs", "hanhub/models", "hanhub/playground", "hanhub/settings", "hanhub/login",
  "hanship", "hanship/deployments", "hanship/deployments/d-console-1", "hanship/domains", "hanship/env", "hanship/projects/console", "hanship/settings", "hanship/login",
  "hanreview", "hanreview/findings", "hanreview/gates", "hanreview/reviews", "hanreview/reviews/rev-001", "hanreview/routing", "hanreview/settings", "hanreview/login",
  "hanhelm", "hanhelm/agents", "hanhelm/alerts", "hanhelm/queue", "hanhelm/queue/task-bulk-classify", "hanhelm/routing", "hanhelm/settings", "hanhelm/login",
];

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

export function staticCandidates(outputRoot, pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, "");
  const direct = join(outputRoot, clean);
  if (extname(direct)) return [direct];
  return [direct, `${direct}.html`, join(direct, "index.html")];
}

async function firstFile(candidates) {
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Try the next static-export shape.
    }
  }
  return null;
}

export async function startStaticExportServer(outputRoot) {
  const root = resolve(outputRoot);
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const file = await firstFile(staticCandidates(root, pathname));
    if (!file || !resolve(file).startsWith(root)) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    response.end(await readFile(file));
  });
  await new Promise((accept) => server.listen(0, "127.0.0.1", accept));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Static server did not expose a TCP port");
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

function assertEnglishText(text, context) {
  if (/[\u3400-\u9fff]/u.test(text)) throw new Error(`${context} contains visible CJK text`);
}

export async function scanAdminDemoOutput(outputRoot = "apps/www/out") {
  const { chromium } = await import("playwright");
  const { server, origin } = await startStaticExportServer(outputRoot);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  let breadcrumbClicks = 0;

  try {
    for (const route of ADMIN_DEMO_ROUTES) {
      const path = `/en/demos/${route}`;
      const response = await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`${path} returned ${response?.status() ?? "no response"}`);
      await page.locator("main").first().waitFor({ state: "visible" });
      if ((await page.locator("html").getAttribute("lang")) !== "en") throw new Error(`${path} is not marked as English`);
      assertEnglishText(await page.locator("body").innerText(), path);

      const breadcrumb = page.locator('nav[aria-label="breadcrumb"] a');
      const breadcrumbCount = await breadcrumb.count();
      for (let index = 0; index < breadcrumbCount; index += 1) {
        await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
        const link = page.locator('nav[aria-label="breadcrumb"] a').nth(index);
        await link.click();
        await page.waitForLoadState("networkidle");
        const clickedPath = new URL(page.url()).pathname;
        if (!clickedPath.startsWith("/en/")) throw new Error(`${path} breadcrumb escaped English: ${clickedPath}`);
        if ((await page.locator("html").getAttribute("lang")) !== "en") throw new Error(`${clickedPath} lost English document state`);
        assertEnglishText(await page.locator("body").innerText(), `${path} breadcrumb destination`);
        breadcrumbClicks += 1;
      }
    }

    await page.goto(`${origin}/en/demos/customer-service/analytics`, { waitUntil: "networkidle" });
    const graphPaths = page.locator('.recharts-area path[d], path.recharts-area-curve[d], path.recharts-area-area[d]');
    const graphPathCount = await graphPaths.count();
    if (graphPathCount < 2) throw new Error("Customer-service analytics did not render both chart series");
    for (let index = 0; index < Math.min(2, graphPathCount); index += 1) {
      if (!(await graphPaths.nth(index).getAttribute("d"))?.trim()) throw new Error("Customer-service analytics rendered an empty graph path");
    }

    await page.goto(`${origin}/en/demos/crm/opportunities`, { waitUntil: "networkidle" });
    await page.getByText("All owners", { exact: true }).first().click();
    for (const owner of ["Lin Wanqing", "Zhou Mingyuan", "Gao Min", "Chen Ce", "Su Xiao"]) {
      await page.getByText(owner, { exact: true }).last().waitFor({ state: "visible" });
    }
    await page.keyboard.press("Escape");

    if (breadcrumbClicks === 0) throw new Error("No English breadcrumb links were exercised");
    if (browserErrors.length) throw new Error(`Browser page errors:\n${browserErrors.join("\n")}`);
    return { routes: ADMIN_DEMO_ROUTES.length, breadcrumbClicks, graphPaths: graphPathCount };
  } finally {
    await browser.close();
    await new Promise((accept, reject) => server.close((error) => error ? reject(error) : accept()));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const outputRoot = process.argv[2] ?? "apps/www/out";
  const result = await scanAdminDemoOutput(outputRoot);
  console.log(`Admin demo browser scan passed: ${result.routes} routes, ${result.breadcrumbClicks} breadcrumb clicks, ${result.graphPaths} chart paths.`);
}
