#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import { ROOT_LOCALE, localeCanonicalPath } from "./docs-locale-layout.mjs";

const AUTHORITATIVE_ORIGIN = "https://hulianui.haloritual.com";
const COMPONENT_SLUG = "button";

export const PUBLIC_SITES = [
  { origin: AUTHORITATIVE_ORIGIN, defaultLocale: "en" },
  { origin: "https://hulianui-zh.haloritual.com", defaultLocale: "zh-CN" },
];

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

// 前缀与首页尾斜杠一律由 SSOT 决定，别在这里拼字面量。
function localizedPath(barePath, locale) {
  return localeCanonicalPath(barePath, locale);
}

function canonicalFor(barePath, locale) {
  return `${AUTHORITATIVE_ORIGIN}${localizedPath(barePath, locale)}`;
}

function absoluteUrl(value) {
  try {
    return new URL(value, AUTHORITATIVE_ORIGIN).href;
  } catch {
    return value;
  }
}

function comparableText(value) {
  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
}

function addFailure(failures, origin, path, message) {
  failures.push({ origin, path, message });
}

function normalizedText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function htmlSemantics(html) {
  const $ = load(html);
  const alternates = new Map();
  $("link[rel='alternate'][hreflang]").each((_, element) => {
    const hreflang = $(element).attr("hreflang");
    const href = $(element).attr("href");
    if (hreflang && href) alternates.set(hreflang, absoluteUrl(href));
  });
  return {
    lang: $("html").attr("lang") ?? "",
    title: normalizedText($("title").first().text()),
    description: normalizedText($("meta[name='description']").attr("content") ?? ""),
    heading: normalizedText($("h1").first().text()),
    canonical: absoluteUrl($("link[rel='canonical']").attr("href") ?? ""),
    alternates,
  };
}

function inspectHtml({ html, expectedHtml, origin, path, locale, barePath, failures }) {
  const actual = htmlSemantics(html);
  const expectedPage = htmlSemantics(expectedHtml);
  const { lang, title, description, heading, canonical, alternates } = actual;
  const expectedCanonical = canonicalFor(barePath, locale);

  if (lang !== locale) {
    addFailure(
      failures,
      origin,
      path,
      `document language mismatch: received ${JSON.stringify(lang)}, expected ${locale}`,
    );
  }
  for (const [field, received, expectedValue] of [
    ["title", title, expectedPage.title],
    ["description", description, expectedPage.description],
    ["heading", heading, expectedPage.heading],
  ]) {
    if (!received || received !== expectedValue) {
      addFailure(
        failures,
        origin,
        path,
        `${field} mismatch: received ${JSON.stringify(received)}, expected ${JSON.stringify(
          expectedValue,
        )}`,
      );
    }
  }
  if (canonical !== expectedCanonical) {
    addFailure(
      failures,
      origin,
      path,
      `canonical mismatch: received ${JSON.stringify(canonical)}, expected ${expectedCanonical}`,
    );
  }

  const expectedAlternates = new Map([
    ["zh-CN", canonicalFor(barePath, "zh-CN")],
    ["en", canonicalFor(barePath, "en")],
    ["x-default", canonicalFor(barePath, ROOT_LOCALE)],
  ]);
  for (const [hreflang, expectedHref] of expectedAlternates) {
    if (alternates.get(hreflang) !== expectedHref) {
      addFailure(
        failures,
        origin,
        path,
        `hreflang ${hreflang} mismatch: received ${JSON.stringify(
          alternates.get(hreflang),
        )}, expected ${expectedHref}`,
      );
    }
  }

  return { lang, title, description, heading, canonical };
}

async function fetchBody(fetchImpl, url, timeoutMs) {
  const response = await fetchImpl(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": "hulian-public-bilingual-verifier/1.0" },
  });
  const body = Buffer.from(await response.arrayBuffer());
  return { response, body };
}

async function verifyHtmlEndpoint(context, spec) {
  const { origin, fetchImpl, timeoutMs, evidence, failures, expected } = context;
  const url = `${origin}${spec.path}`;
  try {
    const { response, body } = await fetchBody(fetchImpl, url, timeoutMs);
    if (!response.ok) {
      addFailure(failures, origin, spec.path, `HTTP ${response.status}`);
      return;
    }
    const details = inspectHtml({
      html: body.toString("utf8"),
      expectedHtml: spec.expected(expected),
      origin,
      path: spec.path,
      locale: spec.locale,
      barePath: spec.barePath,
      failures,
    });
    evidence.push({
      origin,
      path: spec.path,
      status: response.status,
      lang: details.lang,
      title: details.title,
      canonical: details.canonical,
      sha256: digest(body),
    });
  } catch (error) {
    addFailure(
      failures,
      origin,
      spec.path,
      `request failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

async function verifyArtifactEndpoint(context, spec) {
  const { origin, fetchImpl, timeoutMs, evidence, failures, expected } = context;
  const url = `${origin}${spec.path}`;
  try {
    const { response, body } = await fetchBody(fetchImpl, url, timeoutMs);
    if (!response.ok) {
      addFailure(failures, origin, spec.path, `HTTP ${response.status}`);
      return;
    }
    const expectedBody = Buffer.from(comparableText(spec.expected(expected)));
    if (!body.equals(expectedBody)) {
      addFailure(
        failures,
        origin,
        spec.path,
        `stale artifact or content mismatch: sha256 ${digest(body)} != expected ${digest(
          expectedBody,
        )}`,
      );
    }
    let registryCount;
    if (spec.kind === "registry") {
      try {
        const registry = JSON.parse(body.toString("utf8"));
        registryCount = Array.isArray(registry.items) ? registry.items.length : 0;
        if (
          !registry.items?.some((item) => item.name === COMPONENT_SLUG && item.title === "Button")
        ) {
          addFailure(
            failures,
            origin,
            spec.path,
            "registry lost the exact Button component target",
          );
        }
      } catch (error) {
        addFailure(
          failures,
          origin,
          spec.path,
          `invalid registry JSON: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
    evidence.push({
      origin,
      path: spec.path,
      status: response.status,
      registryCount,
      sha256: digest(body),
    });
  } catch (error) {
    addFailure(
      failures,
      origin,
      spec.path,
      `request failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function verifyPublicBilingualSites({
  sites = PUBLIC_SITES,
  expected,
  fetchImpl = globalThis.fetch,
  timeoutMs = 15_000,
} = {}) {
  if (
    !expected?.zh?.registry ||
    !expected?.en?.registry ||
    !expected?.zh?.llms ||
    !expected?.en?.llms ||
    !expected?.zh?.home ||
    !expected?.en?.home ||
    !expected?.zh?.component ||
    !expected?.en?.component ||
    !expected?.asset
  ) {
    throw new Error(
      "Expected merged build artifacts are required for public freshness verification",
    );
  }
  if (typeof fetchImpl !== "function") throw new Error("A fetch implementation is required");

  const evidence = [];
  const failures = [];
  // 路径一律由 localizedPath 生成：哪个语种落在根、哪个带前缀由 SSOT 说了算。
  const componentRoute = `/components/${COMPONENT_SLUG}`;
  const htmlSpecs = [
    {
      path: localizedPath("/", "zh-CN"),
      barePath: "/",
      locale: "zh-CN",
      expected: (value) => value.zh.home,
    },
    {
      path: localizedPath("/", "en"),
      barePath: "/",
      locale: "en",
      expected: (value) => value.en.home,
    },
    {
      path: localizedPath(componentRoute, "zh-CN"),
      barePath: componentRoute,
      locale: "zh-CN",
      expected: (value) => value.zh.component,
    },
    {
      path: localizedPath(componentRoute, "en"),
      barePath: componentRoute,
      locale: "en",
      expected: (value) => value.en.component,
    },
  ];
  const artifactSpecs = [
    {
      path: localizedPath("/registry.json", "zh-CN"),
      kind: "registry",
      expected: (value) => value.zh.registry,
    },
    {
      path: localizedPath("/registry.json", "en"),
      kind: "registry",
      expected: (value) => value.en.registry,
    },
    { path: localizedPath("/llms.txt", "zh-CN"), kind: "llms", expected: (value) => value.zh.llms },
    { path: localizedPath("/llms.txt", "en"), kind: "llms", expected: (value) => value.en.llms },
    { path: "/logo.svg", kind: "asset", expected: (value) => value.asset },
  ];

  await Promise.all(
    sites.flatMap((site) => {
      const context = { ...site, fetchImpl, timeoutMs, evidence, failures, expected };
      return [
        ...htmlSpecs.map((spec) => verifyHtmlEndpoint(context, spec)),
        ...artifactSpecs.map((spec) => verifyArtifactEndpoint(context, spec)),
      ];
    }),
  );

  evidence.sort((a, b) => a.origin.localeCompare(b.origin) || a.path.localeCompare(b.path));
  failures.sort((a, b) => a.origin.localeCompare(b.origin) || a.path.localeCompare(b.path));
  return { evidence, failures };
}

export function formatEvidence(item) {
  const details = [
    `status=${item.status}`,
    item.lang ? `lang=${item.lang}` : null,
    item.registryCount !== undefined ? `registry=${item.registryCount}` : null,
    item.canonical ? `canonical=${item.canonical}` : null,
    `sha256=${item.sha256.slice(0, 12)}`,
  ].filter(Boolean);
  return `[public] ${item.origin}${item.path} ${details.join(" ")}`;
}

function urlState(value) {
  const parsed = new URL(value, "https://hulian.local");
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function validateLanguageBehaviorSnapshot(snapshot) {
  const failures = [];
  const expectedDefault = `${localizedPath(
    snapshot.barePath,
    snapshot.defaultLocale,
  )}?from=public#api`;
  if (
    urlState(snapshot.defaultUrl) !== expectedDefault ||
    snapshot.defaultLang !== snapshot.defaultLocale
  ) {
    failures.push(
      `default locale mismatch for ${snapshot.origin}: url=${urlState(snapshot.defaultUrl)} lang=${
        snapshot.defaultLang
      }; expected ${expectedDefault} ${snapshot.defaultLocale}`,
    );
  }
  const expectedChoice = `${localizedPath(
    snapshot.barePath,
    snapshot.choiceLocale,
  )}?from=public#api`;
  if (urlState(snapshot.choiceUrl) !== expectedChoice) {
    failures.push(
      `manual choice URL mismatch for ${snapshot.origin}: ${urlState(
        snapshot.choiceUrl,
      )} != ${expectedChoice}`,
    );
  }
  if (snapshot.storedLocale !== snapshot.choiceLocale) {
    failures.push(
      `manual choice was not persisted for ${snapshot.origin}: ${snapshot.storedLocale} != ${snapshot.choiceLocale}`,
    );
  }
  if (
    urlState(snapshot.reloadUrl) !== expectedChoice ||
    snapshot.reloadLang !== snapshot.choiceLocale
  ) {
    failures.push(
      `persisted locale mismatch for ${snapshot.origin}: url=${urlState(snapshot.reloadUrl)} lang=${
        snapshot.reloadLang
      }; expected ${expectedChoice} ${snapshot.choiceLocale}`,
    );
  }
  return failures;
}

export async function verifyPublicLanguageBehavior({
  sites = PUBLIC_SITES,
  chromium: chromiumOverride,
  timeoutMs = 20_000,
} = {}) {
  const chromium = chromiumOverride ?? (await import("playwright")).chromium;
  const browser = await chromium.launch({ headless: true });
  const evidence = [];
  const failures = [];
  const barePath = `/components/${COMPONENT_SLUG}`;
  try {
    for (const site of sites) {
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        const withState = `${barePath}?from=public#api`;
        const expectedDefaultPath = localizedPath(barePath, site.defaultLocale);
        await page.goto(`${site.origin}${withState}`, { waitUntil: "domcontentloaded" });
        await page.waitForURL(
          (url) =>
            url.pathname === expectedDefaultPath &&
            url.search === "?from=public" &&
            url.hash === "#api",
          { timeout: timeoutMs },
        );
        await page.waitForSelector(`html[lang="${site.defaultLocale}"]`, { timeout: timeoutMs });
        const defaultUrl = urlState(page.url());
        const defaultLang = await page.locator("html").getAttribute("lang");

        const choiceLocale = site.defaultLocale === "en" ? "zh-CN" : "en";
        const expectedChoicePath = localizedPath(barePath, choiceLocale);
        await page.locator(`a[hreflang="${choiceLocale}"]`).first().click();
        await page.waitForURL(
          (url) =>
            url.pathname === expectedChoicePath &&
            url.search === "?from=public" &&
            url.hash === "#api",
          { timeout: timeoutMs },
        );
        const choiceUrl = urlState(page.url());
        const storedLocale = await page.evaluate(() => localStorage.getItem("hulian-docs-locale"));

        await page.goto(`${site.origin}${withState}`, { waitUntil: "domcontentloaded" });
        await page.waitForURL(
          (url) =>
            url.pathname === expectedChoicePath &&
            url.search === "?from=public" &&
            url.hash === "#api",
          { timeout: timeoutMs },
        );
        await page.waitForSelector(`html[lang="${choiceLocale}"]`, { timeout: timeoutMs });
        const snapshot = {
          ...site,
          barePath,
          defaultUrl,
          defaultLang,
          choiceLocale,
          choiceUrl,
          storedLocale,
          reloadUrl: urlState(page.url()),
          reloadLang: await page.locator("html").getAttribute("lang"),
        };
        evidence.push(snapshot);
        for (const message of validateLanguageBehaviorSnapshot(snapshot)) {
          addFailure(failures, site.origin, barePath, message);
        }
      } catch (error) {
        addFailure(
          failures,
          site.origin,
          barePath,
          `browser verification failed: ${error instanceof Error ? error.message : error}`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  return { evidence, failures };
}

export async function loadExpectedArtifacts(outputRoot = resolve("apps/www/out")) {
  const readText = (path) => readFile(resolve(outputRoot, path), "utf8");
  const [zhRegistry, enRegistry, zhLlms, enLlms, asset, zhHome, enHome, zhComponent, enComponent] =
    await Promise.all([
      readText("registry.json"),
      readText("en/registry.json"),
      readText("llms.txt"),
      readText("en/llms.txt"),
      readText("logo.svg"),
      readText("index.html"),
      readText("en/index.html"),
      readText(`components/${COMPONENT_SLUG}.html`),
      readText(`en/components/${COMPONENT_SLUG}.html`),
    ]);
  return {
    zh: { registry: zhRegistry, llms: zhLlms, home: zhHome, component: zhComponent },
    en: { registry: enRegistry, llms: enLlms, home: enHome, component: enComponent },
    asset,
  };
}

async function main() {
  const expected = await loadExpectedArtifacts(process.env.HULIAN_PUBLIC_EXPECTED_ROOT);
  const result = await verifyPublicBilingualSites({ expected });
  for (const item of result.evidence) console.log(formatEvidence(item));
  const browserResult = await verifyPublicLanguageBehavior();
  for (const item of browserResult.evidence) {
    console.log(
      `[public-browser] ${item.origin} default=${item.defaultLang}:${item.defaultUrl} choice=${item.choiceLocale}:${item.choiceUrl} persisted=${item.reloadLang}:${item.reloadUrl}`,
    );
  }
  const failures = [...result.failures, ...browserResult.failures];
  if (failures.length) {
    for (const failure of failures) {
      console.error(`[public] FAIL ${failure.origin}${failure.path}: ${failure.message}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(
    `[public] PASS ${PUBLIC_SITES.length} domains · ${result.evidence.length} endpoint checks · ${browserResult.evidence.length} browser origins`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
