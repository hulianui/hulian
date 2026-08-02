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

export const TASK11_ACCESSIBLE_ATTRIBUTES = ["aria-label", "title", "alt", "placeholder"];
export const TASK11_INTERACTION_CHECKS = [
  "english-navigation",
  "workflow-notifications",
  "knowledge-retry",
  "learn-retry-mentions",
  "scheduler-retry-detail-submit",
  "dashboard-error-recovery",
];
export const TASK11_FAILURE_MARKERS = [
  "Failed to load knowledge base",
  "Course failed to load",
  "Live data source error",
  "Retry",
];
export const TASK11_ROUTE_EXPECTED_PRECONDITIONS = {
  knowledge: ["Failed to load knowledge base", "Retry"],
  learn: ["Course failed to load", "Retry"],
  scheduler: ["Retry"],
};

export function collectCjkLines(text) {
  return text
    .split("\n")
    .filter((line) => /\p{Script=Han}/u.test(line))
    .slice(0, 8);
}

export function collectUnexpectedFailureMarkers(text, allowedMarkers = []) {
  const allowed = new Set(allowedMarkers);
  return TASK11_FAILURE_MARKERS.filter(
    (marker) => text.includes(marker) && !allowed.has(marker),
  );
}

function assertEnglishText(text, context) {
  const cjkLines = collectCjkLines(text);
  if (cjkLines.length) {
    throw new Error(`${context} contains visible CJK text:\n${cjkLines.join("\n")}`);
  }
}

async function assertEnglishPage(page, context) {
  const surfaces = await page.evaluate((attributes) => {
    const values = [document.body.innerText];
    for (const attribute of attributes) {
      for (const element of document.querySelectorAll(`[${attribute}]`)) {
        const value = element.getAttribute(attribute);
        if (value) values.push(`${attribute}: ${value}`);
      }
    }
    return values.join("\n");
  }, TASK11_ACCESSIBLE_ATTRIBUTES);
  assertEnglishText(surfaces, context);
}

async function assertNoUnexpectedApplicationFailure(page, context, allowedMarkers = []) {
  const visibleText = await page.locator("body").innerText();
  const failures = collectUnexpectedFailureMarkers(visibleText, allowedMarkers);
  if (failures.length) {
    throw new Error(`${context} rendered unexpected application failure UI: ${failures.join(", ")}`);
  }
}

async function assertDashboardCharts(page, context) {
  const chartPaths = page.locator(
    ".recharts-line path[d], .recharts-area path[d], .recharts-bar-rectangle path[d], .recharts-pie-sector path[d]",
  );
  await chartPaths.first().waitFor({ state: "attached", timeout: 10_000 });
  const chartPathCount = await chartPaths.count();
  if (chartPathCount < 4) {
    throw new Error(`${context} rendered ${chartPathCount} chart paths; expected at least 4`);
  }
  for (let index = 0; index < chartPathCount; index += 1) {
    if (!(await chartPaths.nth(index).getAttribute("d"))?.trim()) {
      throw new Error(`${context} chart path ${index + 1} is empty`);
    }
  }
  return chartPathCount;
}

export async function scanTask11DemoOutput(outputRoot = "apps/www/out") {
  const { chromium } = await import("playwright");
  const { server, origin } = await startStaticExportServer(outputRoot);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  try {
    const routeLanguageErrors = [];
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
      try {
        await assertEnglishPage(page, path);
        await assertNoUnexpectedApplicationFailure(
          page,
          path,
          TASK11_ROUTE_EXPECTED_PRECONDITIONS[route] ?? [],
        );
      } catch (error) {
        routeLanguageErrors.push(error instanceof Error ? error.message : String(error));
      }
    }
    if (routeLanguageErrors.length) {
      throw new Error(`Task 11 route language scan failed:\n${routeLanguageErrors.join("\n\n")}`);
    }

    await page.goto(`${origin}/en/demos/ai-chat`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Write a quick sort for me" }).click();
    await page.getByText("function quickSort(arr)", { exact: false }).waitFor({
      state: "visible",
      timeout: 15_000,
    });
    await assertEnglishPage(page, "/en/demos/ai-chat after response");

    await page.goto(`${origin}/en/demos/ai-workflow`, { waitUntil: "networkidle" });
    const skipTour = page.getByRole("button", { name: "Skip" });
    try {
      await skipTour.waitFor({ state: "visible", timeout: 2_000 });
      await skipTour.click();
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("Timeout")) throw error;
    }
    await page.getByRole("button", { name: "Notifications" }).click();
    await page.getByText("2 minutes ago", { exact: true }).waitFor({ state: "visible" });
    await page.getByText("1 hour ago", { exact: true }).waitFor({ state: "visible" });
    await page.getByText("Yesterday", { exact: true }).waitFor({ state: "visible" });
    await assertEnglishPage(page, "/en/demos/ai-workflow notifications");
    await page.keyboard.press("Escape");

    await page.getByRole("link", { name: "Template library" }).click();
    await page.waitForURL((url) => url.pathname === "/en/demos/ai-workflow/templates");
    if ((await page.locator("html").getAttribute("lang")) !== "en") {
      throw new Error("English workflow navigation lost the document language");
    }
    await page.getByText(TASK11_ROUTE_MARKERS["ai-workflow/templates"], { exact: false }).first().waitFor({
      state: "visible",
    });
    await assertEnglishPage(page, "/en/demos/ai-workflow/templates after navigation");

    await page.getByText("Text to image", { exact: true }).first().waitFor({ state: "visible" });

    await page.goto(`${origin}/en/demos/knowledge`, { waitUntil: "networkidle" });
    await page
      .getByRole("alert")
      .filter({ hasText: "Failed to load knowledge base" })
      .waitFor({ state: "visible", timeout: 10_000 });
    await page.getByRole("button", { name: "Retry" }).click();
    await page.getByText("R&D Center", { exact: true }).first().waitFor({
      state: "visible",
      timeout: 10_000,
    });
    await assertEnglishPage(page, "/en/demos/knowledge after retry");
    await assertNoUnexpectedApplicationFailure(page, "/en/demos/knowledge after retry");

    await page.goto(`${origin}/en/demos/learn`, { waitUntil: "networkidle" });
    await page
      .getByRole("alert")
      .filter({ hasText: "Course failed to load" })
      .waitFor({ state: "visible", timeout: 10_000 });
    await page.getByRole("button", { name: "Retry" }).click();
    await page.getByText("Modern React Engineering in Practice", { exact: true }).first().waitFor({
      state: "visible",
      timeout: 10_000,
    });
    await assertEnglishPage(page, "/en/demos/learn after retry");
    await assertNoUnexpectedApplicationFailure(page, "/en/demos/learn after retry");

    await page.goto(`${origin}/en/demos/learn/courses/react-foundations`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("tab", { name: "Discussion" }).click();
    const discussion = page.getByRole("combobox", { name: "New discussion" });
    await discussion.fill("@");
    await page.getByRole("listbox", { name: "Mention suggestions" }).waitFor({ state: "visible" });
    await page.getByRole("option", { name: /Course assistant/ }).first().waitFor({ state: "visible" });
    await assertEnglishPage(page, "/en/demos/learn mention suggestions");

    await page.goto(`${origin}/en/demos/scheduler`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Retry" }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Retry" }).click();
    const seededEvent = page.locator('[role="button"][title*="Follow-up · Chen Xiaoming"]').first();
    await seededEvent.waitFor({ state: "visible", timeout: 10_000 });
    await assertEnglishPage(page, "/en/demos/scheduler after retry");
    await assertNoUnexpectedApplicationFailure(page, "/en/demos/scheduler after retry");
    await seededEvent.click();
    await page.getByText("Follow-up", { exact: true }).last().waitFor({ state: "visible" });
    await page.getByText("Type", { exact: true }).waitFor({ state: "visible" });
    await assertEnglishPage(page, "/en/demos/scheduler appointment detail");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "New appointment" }).click();
    await page.getByText("Initial visit", { exact: true }).waitFor({ state: "visible" });
    await page.getByText("Clinic Room 1", { exact: true }).waitFor({ state: "visible" });
    await page
      .getByRole("combobox")
      .filter({ hasText: "Search or select a patient" })
      .click();
    await page.getByPlaceholder("Search by patient name or phone...").fill("Chen Xiaoming");
    await page.getByRole("option", { name: /Chen Xiaoming/ }).click();
    await assertEnglishPage(page, "/en/demos/scheduler appointment dialog");
    await page.getByRole("button", { name: "Create appointment" }).click();
    await page.getByText("Appointment created", { exact: true }).waitFor({
      state: "visible",
      timeout: 10_000,
    });
    await page.locator('[role="button"][title*="Initial visit · Chen Xiaoming"]').first().waitFor({
      state: "visible",
      timeout: 10_000,
    });
    await assertEnglishPage(page, "/en/demos/scheduler after submit");

    await page.goto(`${origin}/en/demos/dashboard`, { waitUntil: "networkidle" });
    await page.getByText("Global QPS", { exact: false }).waitFor({ state: "visible" });
    await assertDashboardCharts(page, "Dashboard healthy state");
    await page.getByRole("combobox", { name: "Data source" }).click();
    await page.getByRole("option", { name: "Data source: Error" }).click();
    await page.getByText(/Data source switched: .*Error/, { exact: false }).first().waitFor({
      state: "visible",
    });
    await page
      .getByRole("alert")
      .filter({ hasText: "Live data source error" })
      .waitFor({
        state: "visible",
        timeout: 10_000,
      });
    await assertEnglishPage(page, "/en/demos/dashboard error state");

    await page.getByRole("combobox", { name: "Data source" }).click();
    await page.getByRole("option", { name: "Data source: Healthy" }).click();
    await page.getByText(/Data source switched: .*Healthy/, { exact: false }).first().waitFor({
      state: "visible",
    });
    await page.getByText("Global QPS", { exact: false }).waitFor({
      state: "visible",
      timeout: 10_000,
    });
    const chartPathCount = await assertDashboardCharts(page, "Dashboard recovered state");
    await assertEnglishPage(page, "/en/demos/dashboard recovered state");
    await assertNoUnexpectedApplicationFailure(page, "/en/demos/dashboard recovered state");

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
