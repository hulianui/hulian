import { pathToFileURL } from "node:url";
import { startStaticExportServer } from "./check-admin-demo-output.mjs";

export const TASK11_DEMO_ROUTES = [
  "ai-chat",
  "ai-workflow",
  "ai-workflow/gallery",
  "ai-workflow/profile",
  "ai-workflow/templates",
  "ai-workflow/login",
  "knowledge",
  "learn",
  "learn/courses/react-foundations",
  "scheduler",
  "dashboard",
];

export const TASK11_ROUTE_MARKERS = {
  "ai-chat": "Hulian Assistant",
  "ai-workflow": "Node library",
  "ai-workflow/gallery": "Artifact gallery",
  "ai-workflow/profile": "Manage your account information",
  "ai-workflow/templates": "Template library",
  "ai-workflow/login": "Hulian Flow Studio",
  knowledge: "HanVault",
  learn: "Course catalog",
  "learn/courses/react-foundations": "Modern React Engineering in Practice",
  scheduler: "Hulian Clinic Scheduler",
  dashboard: "Hulian Global Traffic Command Center",
};

function assertEnglishText(text, context) {
  const cjkLines = text
    .split("\n")
    .filter((line) => /\p{Script=Han}/u.test(line))
    .slice(0, 8);
  if (cjkLines.length) {
    throw new Error(`${context} contains visible CJK text:\n${cjkLines.join("\n")}`);
  }
}

export async function scanTask11DemoOutput(outputRoot = "apps/www/out") {
  const { chromium } = await import("playwright");
  const { server, origin } = await startStaticExportServer(outputRoot);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  try {
    for (const route of TASK11_DEMO_ROUTES) {
      const path = `/en/demos/${route}`;
      const response = await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
      if (!response?.ok())
        throw new Error(`${path} returned ${response?.status() ?? "no response"}`);
      if ((await page.locator("html").getAttribute("lang")) !== "en") {
        throw new Error(`${path} is not marked as English`);
      }
      await page.getByText(TASK11_ROUTE_MARKERS[route], { exact: false }).first().waitFor({
        state: "visible",
        timeout: 10_000,
      });
      assertEnglishText(await page.locator("body").innerText(), path);
    }

    await page.goto(`${origin}/en/demos/ai-chat`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Write a quick sort for me" }).click();
    await page.getByText("function quickSort(arr)", { exact: false }).waitFor({
      state: "visible",
      timeout: 15_000,
    });
    assertEnglishText(await page.locator("body").innerText(), "/en/demos/ai-chat after response");

    await page.goto(`${origin}/en/demos/ai-workflow/templates`, { waitUntil: "networkidle" });
    await page.getByText("Text to image", { exact: true }).first().waitFor({ state: "visible" });

    await page.goto(`${origin}/en/demos/scheduler`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "New appointment" }).click();
    await page.getByText("Initial visit", { exact: true }).waitFor({ state: "visible" });
    await page.getByText("Clinic Room 1", { exact: true }).waitFor({ state: "visible" });
    assertEnglishText(
      await page.locator("body").innerText(),
      "/en/demos/scheduler appointment dialog",
    );

    await page.goto(`${origin}/en/demos/dashboard`, { waitUntil: "networkidle" });
    await page.getByText("Global QPS", { exact: false }).waitFor({ state: "visible" });
    const chartPaths = page.locator(
      ".recharts-line path[d], .recharts-area path[d], .recharts-bar-rectangle path[d], .recharts-pie-sector path[d]",
    );
    await chartPaths.first().waitFor({ state: "attached" });
    const chartPathCount = await chartPaths.count();
    if (chartPathCount < 4) {
      throw new Error(`Dashboard rendered ${chartPathCount} chart paths; expected at least 4`);
    }
    for (let index = 0; index < chartPathCount; index += 1) {
      if (!(await chartPaths.nth(index).getAttribute("d"))?.trim()) {
        throw new Error(`Dashboard chart path ${index + 1} is empty`);
      }
    }

    if (browserErrors.length) throw new Error(`Browser page errors:\n${browserErrors.join("\n")}`);
    return { routes: TASK11_DEMO_ROUTES.length, chartPaths: chartPathCount };
  } finally {
    await browser.close();
    await new Promise((accept, reject) =>
      server.close((error) => (error ? reject(error) : accept())),
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const outputRoot = process.argv[2] ?? "apps/www/out";
  const result = await scanTask11DemoOutput(outputRoot);
  console.log(
    `Task 11 demo browser scan passed: ${result.routes} routes, ${result.chartPaths} chart paths.`,
  );
}
