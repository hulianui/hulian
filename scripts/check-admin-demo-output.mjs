import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { NESTED_BASE_PATH, basePathForLocale } from "./docs-locale-layout.mjs";

// 语言前缀取自 SSOT：英文挂根路径时 EN 是空串。不写 "/en" 字面量。
const EN = basePathForLocale("en");

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

export const ADMIN_DEMO_BREADCRUMB_COUNTS = {
  "billing": 0,
  "billing/invoices": 0,
  "billing/payment": 0,
  "billing/plans": 0,
  "billing/settings": 0,
  "billing/login": 0,
  "crm": 0,
  "crm/customers": 1,
  "crm/customers/C1001": 2,
  "crm/opportunities": 1,
  "crm/orders": 1,
  "crm/settings": 1,
  "crm/login": 0,
  "customer-service": 0,
  "customer-service/analytics": 1,
  "customer-service/knowledge": 1,
  "customer-service/tickets": 1,
  "customer-service/tickets/T-2059": 2,
  "customer-service/settings": 1,
  "customer-service/login": 0,
  "projects": 0,
  "projects/checkout": 1,
  "projects/checkout/co1": 2,
  "projects/invoices": 1,
  "projects/photos": 1,
  "projects/quotes": 1,
  "projects/quotes/q1": 2,
  "projects/tracking": 1,
  "projects/tracking/p1": 2,
  "hanhub": 0,
  "hanhub/billing": 0,
  "hanhub/health": 0,
  "hanhub/keys": 0,
  "hanhub/logs": 0,
  "hanhub/models": 0,
  "hanhub/playground": 0,
  "hanhub/settings": 0,
  "hanhub/login": 0,
  "hanship": 0,
  "hanship/deployments": 0,
  "hanship/deployments/d-console-1": 2,
  "hanship/domains": 0,
  "hanship/env": 0,
  "hanship/projects/console": 1,
  "hanship/settings": 0,
  "hanship/login": 0,
  "hanreview": 0,
  "hanreview/findings": 1,
  "hanreview/gates": 1,
  "hanreview/reviews": 1,
  "hanreview/reviews/rev-001": 2,
  "hanreview/routing": 1,
  "hanreview/settings": 1,
  "hanreview/login": 0,
  "hanhelm": 0,
  "hanhelm/agents": 0,
  "hanhelm/alerts": 0,
  "hanhelm/queue": 0,
  "hanhelm/queue/task-bulk-classify": 0,
  "hanhelm/routing": 0,
  "hanhelm/settings": 0,
  "hanhelm/login": 0,
};

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

export async function firstFile(candidates) {
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch (error) {
      if (error?.code !== "ENOENT" && error?.code !== "ENOTDIR") throw error;
    }
  }
  return null;
}

async function serveStaticRequest(root, request, response) {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  const file = await firstFile(staticCandidates(root, pathname));
  if (!file || !resolve(file).startsWith(root)) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
  response.end(await readFile(file));
}

export async function startStaticExportServer(outputRoot) {
  const root = resolve(outputRoot);
  const server = createServer((request, response) => {
    void serveStaticRequest(root, request, response).catch((error) => {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(`Static export server error: ${error instanceof Error ? error.message : String(error)}`);
    });
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
      const path = `${EN}/demos/${route}`;
      const response = await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`${path} returned ${response?.status() ?? "no response"}`);
      // 显式给一个宽超时（#182）：连续跑多道浏览器门禁时，Chromium 实例连续启停会让首屏
      // 可见判定偶发擦线超时——页面本身没问题（重跑立刻可见）。默认 30s 在那种资源竞争下不够。
      await page.locator("main").first().waitFor({ state: "visible", timeout: 60_000 });
      if ((await page.locator("html").getAttribute("lang")) !== "en") throw new Error(`${path} is not marked as English`);
      assertEnglishText(await page.locator("body").innerText(), path);

      const breadcrumb = page.locator('nav[aria-label="breadcrumb"] a');
      const expectedBreadcrumbCount = ADMIN_DEMO_BREADCRUMB_COUNTS[route];
      if (expectedBreadcrumbCount > 0) {
        await breadcrumb.nth(expectedBreadcrumbCount - 1).waitFor({ state: "visible" });
      }
      const breadcrumbCount = await breadcrumb.count();
      if (breadcrumbCount !== expectedBreadcrumbCount) {
        throw new Error(`${path} rendered ${breadcrumbCount} breadcrumb links; expected ${expectedBreadcrumbCount}`);
      }
      for (let index = 0; index < breadcrumbCount; index += 1) {
        await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
        const link = page.locator('nav[aria-label="breadcrumb"] a').nth(index);
        await link.click();
        await page.waitForLoadState("networkidle");
        const clickedPath = new URL(page.url()).pathname;
        // 原本断言「路径以 /en/ 开头」。英文挂根路径后 `${EN}/` 退化成 `/`，对任何绝对
        // 路径都成立，这个检查会静默失效 —— 改成「没掉进另一个语种的子树」，该判据与
        // 谁挂根路径无关，恒有效。
        if (clickedPath.startsWith(`${NESTED_BASE_PATH}/`))
          throw new Error(`${path} breadcrumb escaped English: ${clickedPath}`);
        if ((await page.locator("html").getAttribute("lang")) !== "en") throw new Error(`${clickedPath} lost English document state`);
        assertEnglishText(await page.locator("body").innerText(), `${path} breadcrumb destination`);
        breadcrumbClicks += 1;
      }
    }

    await page.goto(`${origin}${EN}/demos/customer-service/analytics`, { waitUntil: "networkidle" });
    let graphPathCount = 0;
    for (const chartName of ["conversation-volume", "csat-trend"]) {
      const chart = page.locator(`[data-admin-demo-chart="${chartName}"]`);
      if (await chart.count() !== 1) throw new Error(`Customer-service analytics is missing the ${chartName} chart`);
      const graphPaths = chart.locator('.recharts-area path[d], path.recharts-area-curve[d], path.recharts-area-area[d]');
      const chartPathCount = await graphPaths.count();
      if (chartPathCount === 0) throw new Error(`Customer-service analytics ${chartName} chart has no graph path`);
      for (let index = 0; index < chartPathCount; index += 1) {
        if (!(await graphPaths.nth(index).getAttribute("d"))?.trim()) {
          throw new Error(`Customer-service analytics ${chartName} chart rendered an empty graph path`);
        }
      }
      graphPathCount += chartPathCount;
    }

    await page.goto(`${origin}${EN}/demos/crm/customers`, { waitUntil: "networkidle" });
    const retry = page.getByRole("button", { name: "Try again" });
    await page.waitForFunction(() => (
      document.querySelectorAll("tbody tr").length === 8
      || [...document.querySelectorAll("button")].some((button) => button.textContent?.trim() === "Try again")
    ));
    if (await retry.isVisible()) {
      await retry.click();
    }
    await page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 8);
    await page.getByRole("button", { name: "Expand" }).click();
    await page.getByRole("combobox", { name: "Owner" }).click();
    await page.getByRole("option", { name: "Zhou Mingyuan" }).click();
    await page.getByRole("button", { name: "Search", exact: true }).click();
    const customerRows = page.locator("tbody tr");
    await page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 5);
    if (await customerRows.count() !== 5) throw new Error("CRM owner filter did not return the expected 5 customers");
    const filteredCustomers = (await customerRows.allInnerTexts()).join("\n");
    for (const customer of ["Yunqi Technology", "Jinxiu Textile", "Intelligent Link Software", "Golden Harvest Bank", "Hongtu printing"]) {
      if (!filteredCustomers.includes(customer)) throw new Error(`CRM owner filter omitted ${customer}`);
    }
    if (filteredCustomers.includes("M&G Stationery")) throw new Error("CRM owner filter retained a customer owned by Lin Wanqing");

    await page.goto(`${origin}${EN}/demos/hanhelm`, { waitUntil: "networkidle" });
    const funnelContract = page.locator('[data-rsc-contract="funnel-render-stage"]');
    if (await funnelContract.count() !== 1) throw new Error("HanHelm is missing the Funnel Server Component contract fixture");
    if (!(await funnelContract.textContent())?.includes("1. Submitted")) {
      throw new Error("Funnel renderStage did not render through the Next Server Component build");
    }

    if (breadcrumbClicks !== 33) throw new Error(`Expected 33 English breadcrumb clicks, received ${breadcrumbClicks}`);
    if (browserErrors.length) throw new Error(`Browser page errors:\n${browserErrors.join("\n")}`);
    return { routes: ADMIN_DEMO_ROUTES.length, breadcrumbClicks, graphPaths: graphPathCount };
  } finally {
    await browser.close();
    await new Promise((accept, reject) => server.close((error) => error ? reject(error) : accept()));
  }
}

/**
 * 是不是「等超时」这一类失败（#182）。
 *
 * 只有这一类才允许重试：页面断言失败、CJK 泄漏、控制台报错都是真问题，重试等于把真回归洗成绿的
 * —— 而「红了就 rerun」正是真回归被漏掉的那条路径。
 */
export function isTimeoutFailure(error) {
  const name = String(error?.name ?? "");
  const message = String(error?.message ?? "");
  return name === "TimeoutError" || /Timeout .*exceeded/i.test(message);
}

/**
 * 跑一次；只在超时形态下重试一次，并把「重试过」如实回传。
 *
 * 关键是**不把 flaky 吞掉**：重试后通过要与一次通过区分开并打印出来，否则 flaky 率在 CI 历史里
 *完全不可见，而不可见的 flaky 迟早会训练出「红了就 rerun」的习惯。
 */
export async function scanAdminDemoOutputWithRetry(outputRoot = "apps/www/out", options = {}) {
  const attempts = options.attempts ?? 2;
  const run = options.run ?? scanAdminDemoOutput;
  const onRetry = options.onRetry ?? ((info) => console.warn(
    `[admin-demos] 第 ${info.attempt} 次因超时失败，重试一次：${info.reason}`,
  ));
  for (let attempt = 1; ; attempt += 1) {
    try {
      const result = await run(outputRoot);
      return { ...result, attempts: attempt };
    } catch (error) {
      if (attempt >= attempts || !isTimeoutFailure(error)) throw error;
      onRetry({ attempt, reason: String(error?.message ?? error).split("\n")[0] });
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const outputRoot = process.argv[2] ?? "apps/www/out";
  const result = await scanAdminDemoOutputWithRetry(outputRoot);
  const flaky = result.attempts > 1 ? ` ⚠️ 重试 ${result.attempts - 1} 次后才通过（flaky，不是一次通过）` : "";
  console.log(
    `Admin demo browser scan passed: ${result.routes} routes, ${result.breadcrumbClicks} breadcrumb clicks, ${result.graphPaths} chart paths.${flaky}`,
  );
}
