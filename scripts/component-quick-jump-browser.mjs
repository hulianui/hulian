#!/usr/bin/env node

import { pathToFileURL } from "node:url";

import { expandBilingualRoutes } from "./a11y.mjs";
import { localeRoutePath } from "./docs-locale-layout.mjs";
import { gotoAndSettle, startStaticServer } from "./static-server.mjs";

export const QUICK_JUMP_QUERIES = ["Button", "按钮", "button"];
export const QUICK_JUMP_VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1280, height: 900 },
];

const QUICK_JUMP_ROUTES = expandBilingualRoutes(["/components"]);

function quickJumpCaseLabel(testCase) {
  return `[${testCase.locale}] ${testCase.viewport.name} ${JSON.stringify(testCase.query)}`;
}

export async function withQuickJumpCaseContext(testCase, action) {
  try {
    return await action();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${quickJumpCaseLabel(testCase)}: ${detail}`, { cause: error });
  }
}

export function buildQuickJumpCases() {
  return QUICK_JUMP_VIEWPORTS.flatMap((viewport) =>
    QUICK_JUMP_ROUTES.flatMap(({ route: sourceRoute, locale }) =>
      QUICK_JUMP_QUERIES.map((query) => ({
        viewport,
        locale,
        query,
        sourceRoute,
        targetRoute: localeRoutePath("/components/button", locale),
      })),
    ),
  );
}

export function checkQuickJumpSnapshot(snapshot) {
  const failures = [];
  const label = `[${snapshot.locale}] ${snapshot.viewport} ${JSON.stringify(snapshot.query)}`;
  if (snapshot.pathname !== snapshot.targetRoute) {
    failures.push(
      `${label}: lost same-language route (landed ${snapshot.pathname}; expected ${snapshot.targetRoute})`,
    );
  }
  if (snapshot.documentLang !== snapshot.locale) {
    failures.push(
      `${label}: document lang is ${JSON.stringify(snapshot.documentLang)}; expected ${snapshot.locale}`,
    );
  }
  if (snapshot.heading !== "Button") {
    failures.push(`${label}: detail heading is ${JSON.stringify(snapshot.heading)}; expected "Button"`);
  }
  if (!snapshot.focusVisible) {
    failures.push(`${label}: focus indicator is not visible before Enter navigation`);
  }
  return failures;
}

export function checkLanguageSwitchSnapshot(snapshot) {
  const failures = [];
  const label = `[${snapshot.sourceLocale}→${snapshot.targetLocale}]`;
  const before = new URL(snapshot.beforeUrl, "https://hulianui.local");
  const after = new URL(snapshot.afterUrl, "https://hulianui.local");
  const expectedRoute = expandBilingualRoutes([before.pathname]).find(
    ({ locale }) => locale === snapshot.targetLocale,
  ).route;

  if (after.pathname !== expectedRoute) {
    failures.push(`${label}: path became ${after.pathname}; expected ${expectedRoute}`);
  }
  if (after.search !== before.search) {
    failures.push(`${label}: query changed from ${before.search || "<empty>"} to ${after.search || "<empty>"}`);
  }
  if (after.hash !== before.hash) {
    failures.push(`${label}: hash changed from ${before.hash || "<empty>"} to ${after.hash || "<empty>"}`);
  }
  if (snapshot.documentLang !== snapshot.targetLocale) {
    failures.push(
      `${label}: document lang is ${JSON.stringify(snapshot.documentLang)}; expected ${snapshot.targetLocale}`,
    );
  }
  return failures;
}

async function hasVisibleFocusIndicator(locator) {
  return locator.evaluate((input) => {
    let element = input;
    for (let depth = 0; element && depth < 4; depth += 1, element = element.parentElement) {
      const style = getComputedStyle(element);
      const outlineVisible =
        style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth || "0") > 0;
      const shadowVisible = style.boxShadow !== "none" && style.boxShadow !== "";
      if (outlineVisible || shadowVisible) return true;
    }
    return false;
  });
}

async function runQuickJumpCase(page, baseUrl, testCase, reportPhase) {
  await gotoAndSettle(page, `${baseUrl}${testCase.sourceRoute}`);
  reportPhase("source-ready");
  const input = page.locator('main input[role="combobox"]').first();
  await input.fill(testCase.query);
  await input.focus();
  const focusVisible = await hasVisibleFocusIndicator(input);
  reportPhase(`input-ready focus-visible=${focusVisible}`);
  await input.press("Enter");
  reportPhase(`enter-pressed current=${new URL(page.url()).pathname}`);
  await page.waitForURL((url) => url.pathname === testCase.targetRoute, { timeout: 15000 });
  reportPhase(`target-url current=${new URL(page.url()).pathname}`);
  await page.waitForSelector("h1", { state: "visible", timeout: 15000 });
  reportPhase("detail-ready");

  return {
    ...testCase,
    viewport: testCase.viewport.name,
    pathname: new URL(page.url()).pathname,
    documentLang: await page.locator("html").getAttribute("lang"),
    heading: (await page.locator("h1").first().textContent())?.trim(),
    focusVisible,
  };
}

async function runLanguageSwitchCase(page, baseUrl, viewport, sourceLocale) {
  const targetLocale = sourceLocale === "en" ? "zh-CN" : "en";
  const sourceRoute = localeRoutePath("/components/button", sourceLocale);
  const beforeUrl = `${sourceRoute}?from=quick-jump#api`;
  await gotoAndSettle(page, `${baseUrl}${beforeUrl}`);
  const switcher = page.locator(`a[hreflang="${targetLocale}"]`).first();
  await switcher.click();
  const expectedRoute = localeRoutePath("/components/button", targetLocale);
  await page.waitForURL(
    (url) =>
      url.pathname === expectedRoute &&
      url.search === "?from=quick-jump" &&
      url.hash === "#api",
    { timeout: 15000 },
  );

  return {
    viewport: viewport.name,
    sourceLocale,
    targetLocale,
    beforeUrl,
    afterUrl: `${new URL(page.url()).pathname}${new URL(page.url()).search}${new URL(page.url()).hash}`,
    documentLang: await page.locator("html").getAttribute("lang"),
  };
}

export async function runComponentQuickJumpBrowser() {
  const { chromium } = await import("playwright");
  const staticServer = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of QUICK_JUMP_VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      try {
        for (const testCase of buildQuickJumpCases().filter(
          (candidate) => candidate.viewport.name === viewport.name,
        )) {
          const page = await context.newPage();
          try {
            const label = quickJumpCaseLabel(testCase);
            console.log(`[quick-jump] ${label} · START`);
            const snapshot = await withQuickJumpCaseContext(testCase, () =>
              runQuickJumpCase(page, staticServer.baseUrl, testCase, (phase) => {
                console.log(`[quick-jump] ${label} · ${phase}`);
              }),
            );
            results.push({ kind: "quick-jump", snapshot, failures: checkQuickJumpSnapshot(snapshot) });
          } finally {
            await page.close();
          }
        }

        for (const sourceLocale of ["zh-CN", "en"]) {
          const page = await context.newPage();
          try {
            const snapshot = await runLanguageSwitchCase(
              page,
              staticServer.baseUrl,
              viewport,
              sourceLocale,
            );
            results.push({
              kind: "language-switch",
              snapshot,
              failures: checkLanguageSwitchSnapshot(snapshot),
            });
          } finally {
            await page.close();
          }
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await staticServer.close();
  }

  const failures = results.flatMap((result) => result.failures);
  for (const result of results) {
    const label =
      result.kind === "quick-jump"
        ? `[${result.snapshot.locale}] ${result.snapshot.viewport} ${JSON.stringify(result.snapshot.query)}`
        : `[${result.snapshot.sourceLocale}→${result.snapshot.targetLocale}] ${result.snapshot.viewport}`;
    console.log(`[quick-jump] ${label} · ${result.failures.length === 0 ? "OK" : "FAIL"}`);
    for (const failure of result.failures) console.log(`    ${failure}`);
  }
  if (failures.length > 0) {
    throw new Error(`组件快速直达浏览器门禁失败 ${failures.length}/${results.length} 项\n${failures.join("\n")}`);
  }
  console.log(`[quick-jump] PASS ${results.length}/${results.length} checks`);
  return results;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runComponentQuickJumpBrowser().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
