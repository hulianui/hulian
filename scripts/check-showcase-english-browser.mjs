#!/usr/bin/env node

import { readdirSync } from "node:fs";
import { relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { gotoAndSettle, OUT_DIR, startStaticServer } from "./static-server.mjs";
import { basePathForLocale } from "./docs-locale-layout.mjs";

// 英文站在产物树里的前缀由 SSOT 决定：作根语言时是空串，产物就直接落在 out 根。
const EN = basePathForLocale("en");

const CJK_RE = /[\p{Script=Han}\u3000-\u303f\uff00-\uffef]/u;
const COMPONENT_OUT_DIR = `${OUT_DIR}${EN}/components`;
const INTERACTION_ROUTES = ["dialog", "toast", "table", "form"];

export function findCjkLeaks(entries) {
  return entries.filter(({ value }) => CJK_RE.test(String(value ?? "")));
}

export function componentRouteFromHtmlPath(file) {
  const normalized = file.split(sep).join("/");
  if (!normalized.endsWith(".html") || normalized === "index.html") return null;
  return `${EN}/components/${normalized.slice(0, -".html".length)}`;
}

export function isIgnorableRequestFailure({ errorText, resourceType, isNavigationRequest }) {
  return (
    errorText === "net::ERR_ABORTED" &&
    resourceType !== "document" &&
    isNavigationRequest !== true
  );
}

function walkHtmlFiles(directory, root = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return walkHtmlFiles(absolute, root);
    return entry.isFile() && entry.name.endsWith(".html") ? [relative(root, absolute)] : [];
  });
}

export function discoverEnglishComponentRoutes(directory = COMPONENT_OUT_DIR) {
  return walkHtmlFiles(directory).map(componentRouteFromHtmlPath).filter(Boolean).sort();
}

export function validateShowcaseRouteResult(result) {
  const problems = [];
  if (!result.status || result.status >= 400) problems.push(`status:${result.status ?? "none"}`);
  problems.push(...(result.failed ?? []));
  for (const leak of result.leaks ?? []) {
    problems.push(`${leak.kind} ${leak.locator}: ${JSON.stringify(leak.value)}`);
  }
  if (problems.length > 0) {
    throw new Error(`[showcase-en] ${result.route} (${result.phase}):\n${problems.join("\n")}`);
  }
  return result;
}

async function waitForHydrationAndQuiet(page) {
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("article *")).some((element) =>
        Object.keys(element).some(
          (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactProps$"),
        ),
      ),
    null,
    { timeout: 15_000 },
  );
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let timer;
        const finish = () => {
          observer.disconnect();
          resolve(undefined);
        };
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(finish, 180);
        });
        observer.observe(document.body, { childList: true, characterData: true, subtree: true });
        timer = setTimeout(finish, 180);
        setTimeout(finish, 2_000);
      }),
  );
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

async function collectDocumentEntries(page) {
  return page.evaluate(() => {
    const entries = [];
    const describe = (element) => {
      if (!element) return "document";
      const id = element.id ? `#${element.id}` : "";
      const role = element.getAttribute("role");
      return `${element.tagName.toLowerCase()}${id}${role ? `[role=${JSON.stringify(role)}]` : ""}`;
    };
    const hidden = (element) => {
      for (let node = element; node; node = node.parentElement) {
        if (node.hidden || node.getAttribute("aria-hidden") === "true") return true;
        const style = getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return true;
      }
      return element.getClientRects().length === 0;
    };

    entries.push({ kind: "title", locator: "document", value: document.title });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, noscript")) continue;
      const value = node.nodeValue?.replace(/\s+/g, " ").trim();
      if (!value) continue;
      const code = Boolean(parent.closest("code, pre"));
      entries.push({
        kind: code ? "code" : hidden(parent) ? "hidden-text" : "visible-text",
        locator: describe(parent),
        value,
      });
    }

    for (const element of document.querySelectorAll("*")) {
      for (const attribute of element.attributes) {
        const name = attribute.name.toLowerCase();
        if (
          name === "title" ||
          name === "alt" ||
          name === "placeholder" ||
          name.startsWith("aria-")
        ) {
          entries.push({ kind: name, locator: describe(element), value: attribute.value });
        }
      }
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        entries.push({ kind: "control-value", locator: describe(element), value: element.value });
      }
    }
    return entries;
  });
}

async function scanPage(page, route, phase, status, failed) {
  await waitForHydrationAndQuiet(page);
  return {
    route,
    phase,
    status,
    failed: [...failed],
    leaks: findCjkLeaks(await collectDocumentEntries(page)),
  };
}

async function openRoute(context, staticServer, route) {
  const page = await context.newPage();
  const failed = [];
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(staticServer.baseUrl)) {
      const errorText = request.failure()?.errorText ?? "unknown";
      if (
        isIgnorableRequestFailure({
          errorText,
          resourceType: request.resourceType(),
          isNavigationRequest: request.isNavigationRequest(),
        })
      ) {
        return;
      }
      failed.push(`request:${errorText}:${request.url()}`);
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith(staticServer.baseUrl) && response.status() >= 400) {
      failed.push(`http:${response.status()}:${response.url()}`);
    }
  });
  page.on("pageerror", (error) => failed.push(`pageerror:${error.message}`));
  const response = await gotoAndSettle(page, `${staticServer.baseUrl}${route}`, {
    anchor: "article h1",
    settleMs: 0,
  });
  return { page, failed, status: response.status() };
}

async function scanInitialRoute(context, staticServer, route) {
  const opened = await openRoute(context, staticServer, route);
  const results = [];
  try {
    results.push(await scanPage(opened.page, route, "hydrated", opened.status, opened.failed));
    const codeTab = opened.page.getByRole("tab", { name: "Code", exact: true }).first();
    if ((await codeTab.count()) > 0) {
      await codeTab.click();
      results.push(await scanPage(opened.page, route, "code-tab", opened.status, opened.failed));
    }
    return results;
  } finally {
    await opened.page.close();
  }
}

async function interactWithRepresentative(page, slug) {
  if (slug === "dialog") {
    const initiallyOpen = page.getByRole("dialog").last();
    if ((await initiallyOpen.count()) > 0 && (await initiallyOpen.isVisible())) {
      await initiallyOpen.getByRole("button").last().click();
      await initiallyOpen.waitFor({ state: "hidden" });
    }
    await page.locator("#ex-0 button").first().click();
    await page.getByRole("dialog").last().waitFor({ state: "visible" });
    return "dialog-open";
  }
  if (slug === "toast") {
    const before = await page.locator('[role="region"] > *').count();
    await page.locator("#ex-0 button").first().click();
    await page.waitForFunction(
      (previous) => document.querySelectorAll('[role="region"] > *').length > previous,
      before,
    );
    return "toast-shown";
  }
  if (slug === "table") {
    const input = page.locator('article input[type="text"]').first();
    await input.fill("user1");
    await page.waitForTimeout(250);
    return "table-filtered";
  }
  if (slug === "form") {
    const form = page.locator("article form").first();
    const inputs = form.locator("input");
    await inputs.nth(0).fill("reader@example.com");
    if ((await inputs.count()) > 1) await inputs.nth(1).fill("Reader");
    await form.getByRole("button", { name: /submit/i }).click();
    await page.waitForTimeout(250);
    return "form-submitted";
  }
  throw new Error(`unsupported showcase interaction: ${slug}`);
}

async function scanInteraction(context, staticServer, slug) {
  const route = `${EN}/components/${slug}`;
  const opened = await openRoute(context, staticServer, route);
  try {
    await waitForHydrationAndQuiet(opened.page);
    const phase = await interactWithRepresentative(opened.page, slug);
    return await scanPage(opened.page, route, phase, opened.status, opened.failed);
  } finally {
    await opened.page.close();
  }
}

export async function runShowcaseEnglishBrowser({
  routes = discoverEnglishComponentRoutes(),
} = {}) {
  const { chromium } = await import("playwright");
  const staticServer = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const results = [];
  try {
    let cursor = 0;
    const concurrency = Math.max(
      1,
      Math.min(8, Number(process.env.SHOWCASE_BROWSER_CONCURRENCY) || 4),
    );
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        while (cursor < routes.length) {
          const route = routes[cursor++];
          try {
            results.push(...(await scanInitialRoute(context, staticServer, route)));
          } catch (error) {
            results.push({
              route,
              phase: "load-or-hydration",
              status: null,
              failed: [error instanceof Error ? error.message : String(error)],
              leaks: [],
            });
          }
        }
      }),
    );
    for (const slug of INTERACTION_ROUTES) {
      try {
        results.push(await scanInteraction(context, staticServer, slug));
      } catch (error) {
        results.push({
          route: `${EN}/components/${slug}`,
          phase: "interaction",
          status: null,
          failed: [error instanceof Error ? error.message : String(error)],
          leaks: [],
        });
      }
    }
  } finally {
    await context.close();
    await browser.close();
    await staticServer.close();
  }

  const failures = [];
  for (const result of results.sort((a, b) =>
    `${a.route}:${a.phase}`.localeCompare(`${b.route}:${b.phase}`),
  )) {
    try {
      validateShowcaseRouteResult(result);
      console.log(`[showcase-en] ${result.route} · ${result.phase} · PASS`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      console.error(
        `[showcase-en] ${result.route} · ${result.phase} · FAIL (${result.failed.length} browser, ${result.leaks.length} CJK)`,
      );
    }
  }
  if (failures.length > 0) {
    const preview = failures.slice(0, 20).join("\n\n");
    throw new Error(
      `${failures.length}/${results.length} English showcase browser phases failed\n\n${preview}${
        failures.length > 20 ? `\n\n… ${failures.length - 20} more failures` : ""
      }`,
    );
  }
  console.log(
    `[showcase-en] PASS ${routes.length}/${routes.length} hydrated component routes + ${INTERACTION_ROUTES.length} dynamic interactions`,
  );
  return results;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runShowcaseEnglishBrowser().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
