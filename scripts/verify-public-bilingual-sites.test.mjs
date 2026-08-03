import assert from "node:assert/strict";
import test from "node:test";

import {
  PUBLIC_SITES,
  validateLanguageBehaviorSnapshot,
  verifyPublicBilingualSites,
} from "./verify-public-bilingual-sites.mjs";

import {
  ROOT_LOCALE,
  localeCanonicalPath,
  localeFromPathname,
  stripLocalePrefix,
} from "./docs-locale-layout.mjs";

const MAIN = "https://hulianui.haloritual.com";
const MIRROR = "https://hulianui-zh.haloritual.com";

// 语言前缀一律从 SSOT 派生，fixture 不再假设哪个语种落在根。
const p = (path, locale) => localeCanonicalPath(path, locale);
const at = (path, locale) => `${MAIN}${p(path, locale)}`;

function page(path, locale) {
  const canonical = at(path, locale);
  return `<!doctype html>
    <html lang="${locale}">
      <head>
        <title>${locale === "en" ? "Button · Hulian UI" : "Button 按钮 · 瑚琏 Hulian"}</title>
        <meta name="description" content="${
          locale === "en" ? "English component documentation" : "中文组件文档"
        }">
        <link rel="canonical" href="${canonical}">
        <link rel="alternate" hreflang="zh-CN" href="${at(path, "zh-CN")}">
        <link rel="alternate" hreflang="en" href="${at(path, "en")}">
        <link rel="alternate" hreflang="x-default" href="${at(path, ROOT_LOCALE)}">
      </head>
      <body><h1>${
        locale === "en" ? "Button component documentation" : "Button 按钮组件文档"
      }</h1></body>
    </html>`;
}

function artifacts() {
  const protocol = {
    name: "button",
    type: "registry:ui",
    registryDependencies: ["https://hulianui.haloritual.com/r/config.json"],
    files: [{ path: "button.tsx", type: "registry:ui" }],
  };
  const zhRegistry = JSON.stringify({
    version: "0.16.0",
    description: "中文组件注册表",
    items: [{ ...protocol, title: "Button", description: "按钮" }],
  });
  const enRegistry = JSON.stringify({
    version: "0.16.0",
    description: "English component registry",
    items: [{ ...protocol, title: "Button", description: "Button control" }],
  });
  return {
    zh: {
      registry: zhRegistry,
      llms: "# 瑚琏 Hulian\n\n按钮组件",
      home: page("/", "zh-CN"),
      component: page("/components/button", "zh-CN"),
    },
    en: {
      registry: enRegistry,
      llms: "# Hulian UI\n\nButton component",
      home: page("/", "en"),
      component: page("/components/button", "en"),
    },
    asset: "<svg><title>Hulian</title></svg>",
  };
}

function fixtureFetch(
  expected,
  { staleOrigin, stalePath = "/registry.json", httpOrigin, networkOrigin, invalidJsonOrigin } = {},
) {
  return async (input) => {
    const url = new URL(input);
    if (url.origin === networkOrigin && url.pathname === "/registry.json") {
      throw new Error("fixture network outage");
    }
    if (url.origin === httpOrigin && url.pathname === "/registry.json") {
      return new Response("unavailable", { status: 503 });
    }
    const stale = url.origin === staleOrigin && url.pathname === stalePath;
    const headers = { "content-type": "text/html; charset=utf-8" };

    // 按 SSOT 剥掉语言前缀后再分流，fixture 不关心哪个语种当前落在根。
    const locale = localeFromPathname(url.pathname);
    const bare = stripLocalePrefix(url.pathname);
    const artifactKey = locale === "en" ? "en" : "zh";

    if (bare === "/") {
      return new Response(page("/", locale), { status: 200, headers });
    }
    if (bare === "/components/button") {
      return new Response(page("/components/button", locale), { status: 200, headers });
    }
    if (bare === "/registry.json") {
      const body =
        url.origin === invalidJsonOrigin && url.pathname === "/registry.json"
          ? "{broken"
          : stale
          ? JSON.stringify({ version: "0.15.0", description: "stale", items: [] })
          : expected[artifactKey].registry;
      return new Response(body, {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    if (bare === "/llms.txt") {
      return new Response(stale ? "stale llms" : expected[artifactKey].llms, {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    }
    if (url.pathname === "/logo.svg") {
      return new Response(stale ? "<svg>stale</svg>" : expected.asset, {
        status: 200,
        headers: { "content-type": "image/svg+xml" },
      });
    }
    return new Response("not found", { status: 404 });
  };
}

test("verifies both domains and both locale trees against the same build artifacts", async () => {
  const expected = artifacts();
  const result = await verifyPublicBilingualSites({
    sites: PUBLIC_SITES,
    expected,
    fetchImpl: fixtureFetch(expected),
  });

  assert.deepEqual(result.failures, []);
  for (const origin of [MAIN, MIRROR]) {
    assert.ok(
      result.evidence.some(
        (item) => item.origin === origin && item.path === p("/", "zh-CN") && item.lang === "zh-CN",
      ),
    );
    assert.ok(
      result.evidence.some(
        (item) => item.origin === origin && item.path === p("/", "en") && item.lang === "en",
      ),
    );
    assert.ok(
      result.evidence.some(
        (item) => item.origin === origin && item.path === p("/components/button", "en"),
      ),
    );
    assert.ok(
      result.evidence.some(
        (item) =>
          item.origin === origin && item.path === p("/registry.json", "en") && item.registryCount === 1,
      ),
    );
    assert.ok(result.evidence.some((item) => item.origin === origin && item.path === "/logo.svg"));
  }
});

test("reports either stale domain independently from the fresh peer", async () => {
  for (const [staleOrigin, freshOrigin] of [
    [MAIN, MIRROR],
    [MIRROR, MAIN],
  ]) {
    const expected = artifacts();
    const result = await verifyPublicBilingualSites({
      sites: PUBLIC_SITES,
      expected,
      fetchImpl: fixtureFetch(expected, { staleOrigin }),
    });

    assert.ok(
      result.failures.some(
        (failure) => failure.origin === staleOrigin && /stale|mismatch/i.test(failure.message),
      ),
    );
    assert.ok(!result.failures.some((failure) => failure.origin === freshOrigin));
  }
});

test("rejects a wrong canonical, hreflang, or exact component target", async () => {
  const expected = artifacts();
  const normalFetch = fixtureFetch(expected);
  const fetchImpl = async (input) => {
    const url = new URL(input);
    if (url.origin === MIRROR && url.pathname === p("/components/button", "en")) {
      return new Response(page("/components/input", "en"), {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    }
    return normalFetch(input);
  };
  const result = await verifyPublicBilingualSites({ sites: PUBLIC_SITES, expected, fetchImpl });

  assert.ok(
    result.failures.some(
      (failure) =>
        failure.origin === MIRROR &&
        failure.path === p("/components/button", "en") &&
        /canonical|hreflang/i.test(failure.message),
    ),
  );
});

test("rejects empty live title and description metadata", async () => {
  const expected = artifacts();
  const normalFetch = fixtureFetch(expected);
  const fetchImpl = async (input) => {
    const url = new URL(input);
    if (url.origin === MAIN && url.pathname === p("/", "en")) {
      return new Response(
        '<html lang="en"><head><title></title></head><body>Hulian</body></html>',
        {
          status: 200,
          headers: { "content-type": "text/html" },
        },
      );
    }
    return normalFetch(input);
  };
  const result = await verifyPublicBilingualSites({ sites: PUBLIC_SITES, expected, fetchImpl });

  assert.ok(
    result.failures.some(
      (failure) =>
        failure.origin === MAIN &&
        failure.path === p("/", "en") &&
        /title|description/i.test(failure.message),
    ),
  );
});

test("compares live page semantics to the merged build, not generic fallback chrome", async () => {
  const expected = artifacts();
  const normalFetch = fixtureFetch(expected);
  const fetchImpl = async (input) => {
    const url = new URL(input);
    if (url.origin === MIRROR && url.pathname === p("/components/button", "en")) {
      return new Response(
        `
        <html lang="en"><head>
          <title>Generic · Hulian UI</title>
          <meta name="description" content="Generic fallback page">
          <link rel="canonical" href="${at("/components/button", "en")}">
          <link rel="alternate" hreflang="zh-CN" href="${MAIN}/components/button">
          <link rel="alternate" hreflang="en" href="${at("/components/button", "en")}">
          <link rel="alternate" hreflang="x-default" href="${at("/components/button", "en")}">
        </head><body><nav>Button</nav><h1>Not Found</h1></body></html>`,
        {
          status: 200,
          headers: { "content-type": "text/html" },
        },
      );
    }
    return normalFetch(input);
  };
  const result = await verifyPublicBilingualSites({ sites: PUBLIC_SITES, expected, fetchImpl });

  assert.ok(
    result.failures.some(
      (failure) =>
        failure.origin === MIRROR &&
        failure.path === p("/components/button", "en") &&
        /title|description|heading/i.test(failure.message),
    ),
  );
});

test("isolates stale llms/assets plus HTTP, network, and invalid registry JSON failures", async () => {
  const scenarios = [
    { options: { staleOrigin: MAIN, stalePath: p("/llms.txt", "en") }, pattern: /stale|mismatch/i },
    { options: { staleOrigin: MIRROR, stalePath: "/logo.svg" }, pattern: /stale|mismatch/i },
    { options: { httpOrigin: MAIN }, pattern: /HTTP 503/i },
    { options: { networkOrigin: MIRROR }, pattern: /network outage/i },
    { options: { invalidJsonOrigin: MAIN }, pattern: /invalid registry JSON/i },
  ];
  for (const { options, pattern } of scenarios) {
    const expected = artifacts();
    const affectedOrigin =
      options.staleOrigin ??
      options.httpOrigin ??
      options.networkOrigin ??
      options.invalidJsonOrigin;
    const result = await verifyPublicBilingualSites({
      sites: PUBLIC_SITES,
      expected,
      fetchImpl: fixtureFetch(expected, options),
    });
    assert.ok(
      result.failures.some(
        (failure) => failure.origin === affectedOrigin && pattern.test(failure.message),
      ),
    );
  }
});

test("validates fresh-browser host defaults and persisted manual choices separately", () => {
  for (const site of PUBLIC_SITES) {
    const defaultPath = p("/components/button", site.defaultLocale);
    const choiceLocale = site.defaultLocale === "en" ? "zh-CN" : "en";
    const choicePath = p("/components/button", choiceLocale);
    const failures = validateLanguageBehaviorSnapshot({
      ...site,
      barePath: "/components/button",
      defaultUrl: `${defaultPath}?from=public#api`,
      defaultLang: site.defaultLocale,
      choiceLocale,
      choiceUrl: `${choicePath}?from=public#api`,
      storedLocale: choiceLocale,
      reloadUrl: `${choicePath}?from=public#api`,
      reloadLang: choiceLocale,
    });
    assert.deepEqual(failures, []);
  }

  assert.match(
    validateLanguageBehaviorSnapshot({
      ...PUBLIC_SITES[0],
      barePath: "/components/button",
      defaultUrl: "/components/button?from=public#api",
      defaultLang: "zh-CN",
      choiceLocale: "zh-CN",
      choiceUrl: "/components/button?from=public#api",
      storedLocale: "zh-CN",
      reloadUrl: "/components/button?from=public#api",
      reloadLang: "zh-CN",
    }).join("\n"),
    /default/i,
  );
});
