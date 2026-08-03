import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { checkBilingualLinks } from "./check-bilingual-links.mjs";
import { NESTED_BASE_PATH, ROOT_LOCALE, localeRoutePath } from "./docs-locale-layout.mjs";

const ORIGIN = "https://hulianui.haloritual.com";
const NESTED_DIR = NESTED_BASE_PATH.slice(1);

// 路径一律从 SSOT 派生：哪个语种落在根、哪个带前缀由 docs-locale-layout.mjs 说了算，
// 翻转语言布局时这个文件不需要再改一遍字面量。
const zh = (bare) => localeRoutePath(bare, "zh-CN");
const en = (bare) => localeRoutePath(bare, "en");

function temporaryTree(t) {
  const root = mkdtempSync(join(tmpdir(), "hulian-bilingual-links-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, relativePath, content = "") {
  const file = join(root, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  return file;
}

/** 裸路由在成品树里的文件相对路径。 */
function localeFile(route, locale) {
  const name = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  return locale === ROOT_LOCALE ? name : join(NESTED_DIR, name);
}

function document(body, head = "") {
  return `<!doctype html><html><head><title>Fixture</title><meta name="description" content="Fixture description">${head}</head><body>${body}</body></html>`;
}

function seoHead(route, locale) {
  const bare = route.endsWith("/index") ? route.slice(0, -"/index".length) || "/" : route;
  return `<link rel="canonical" href="${localeRoutePath(bare, locale)}">
    <link rel="alternate" hreflang="zh-CN" href="${zh(bare)}">
    <link rel="alternate" hreflang="en" href="${en(bare)}">
    <link rel="alternate" hreflang="x-default" href="${localeRoutePath(bare, ROOT_LOCALE)}">`;
}

function writePair(
  root,
  route,
  { zh: zhBody = "", en: enBody = "", zhHead = "", enHead = "", seo = true } = {},
) {
  write(
    root,
    localeFile(route, "zh-CN"),
    document(zhBody, zhHead || (seo ? seoHead(route, "zh-CN") : "")),
  );
  write(root, localeFile(route, "en"), document(enBody, enHead || (seo ? seoHead(route, "en") : "")));
}

test("route parity is derived from every physical route including 404 and _not-found", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/404");
  writePair(root, "/_not-found");
  write(
    root,
    localeFile("/only-chinese", "zh-CN"),
    document("Chinese", seoHead("/only-chinese", "zh-CN")),
  );
  write(
    root,
    localeFile("/only-english", "en"),
    document("English", seoHead("/only-english", "en")),
  );
  write(root, localeFile("/google-verification", "zh-CN"), "google-site-verification: token");
  write(root, localeFile("/google-verification", "en"), "google-site-verification: token");

  const result = await checkBilingualLinks(root);

  assert.equal(result.counts.chineseRoutes, 4);
  assert.equal(result.counts.englishRoutes, 4);
  assert.deepEqual(
    result.findings
      .filter(({ kind }) => kind === "missing-language-pair")
      .map(({ kind, route, target }) => [kind, route, target]),
    [
      ["missing-language-pair", en("/only-english"), zh("/only-english")],
      ["missing-language-pair", zh("/only-chinese"), en("/only-chinese")],
    ],
  );
});

test("every physical route requires a non-empty title and meta description", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  write(
    root,
    localeFile("/broken", "zh-CN"),
    `<!doctype html><html><head><title></title><meta name="description" content="">${seoHead(
      "/broken",
      "zh-CN",
    )}</head><body>Broken</body></html>`,
  );
  write(root, localeFile("/broken", "en"), document("English", seoHead("/broken", "en")));

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route }) => [kind, route]),
    [
      ["missing-document-title", zh("/broken")],
      ["missing-meta-description", zh("/broken")],
    ],
  );
});

test("crawler resolves root, relative, html, index, query, hash, encoded paths, and assets", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/guide/index");
  writePair(root, "/guide/next");
  writePair(root, "/café");
  write(root, "assets/logo.svg", "<svg></svg>");
  write(root, join(NESTED_DIR, "assets/logo.svg"), "<svg></svg>");
  write(root, "registry.json", "{}");
  write(root, join(NESTED_DIR, "registry.json"), "{}");

  write(
    root,
    localeFile("/guide/index", "zh-CN"),
    document(
      `<main id="api">
      <a href="${zh("/guide/index.html")}?tab=all#api">Root HTML</a>
      <a href="next.html">Relative HTML</a>
      <a href="${zh("/caf%C3%A9")}">Encoded route</a>
      <a href="${zh("/registry.json")}?raw=1">JSON</a>
      <a href="${zh("/assets/logo.svg")}">Asset</a>
      <a href="#api">Local fragment</a>
      <a href="mailto:test@example.com">Mail</a>
      <a href="tel:+10000000000">Phone</a>
      <a href="data:text/plain,hello">Data</a>
      <a href="https://example.com/path">External</a>
    </main>`,
      seoHead("/guide", "zh-CN"),
    ),
  );
  write(
    root,
    localeFile("/guide/index", "en"),
    document(
      `<main id="api">
      <a href="${en("/guide/index.html")}?tab=all#api">Root HTML</a>
      <a href="next.html">Relative HTML</a>
      <a href="${en("/caf%C3%A9")}">Encoded route</a>
      <a href="${en("/registry.json")}?raw=1">JSON</a>
      <a href="${en("/assets/logo.svg")}">Asset</a>
      <a href="#api">Local fragment</a>
    </main>`,
      seoHead("/guide", "en"),
    ),
  );

  const result = await checkBilingualLinks(root);

  assert.equal(result.findings.length, 0);
  assert.equal(result.counts.chineseRoutes, 4);
  assert.equal(result.counts.englishRoutes, 4);
  assert.equal(result.counts.links, 48);
});

test("crawler reports missing targets, unsafe JavaScript, duplicate prefixes, and bad fragments", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/guide", {
    en: `<main id="valid">
      <a href="${en("/missing")}">Missing</a>
      <a href="${NESTED_BASE_PATH}${NESTED_BASE_PATH}/guide">Doubled locale prefix</a>
      <a href="javascript:alert(1)">Unsafe</a>
      <a href="#absent">Bad fragment</a>
    </main>`,
  });

  const result = await checkBilingualLinks(root);
  const kinds = result.findings.map(({ kind }) => kind);

  assert.deepEqual(kinds, [
    "missing-target",
    "duplicate-locale-prefix",
    "unsafe-javascript-url",
    "missing-fragment",
  ]);
  assert.ok(
    result.findings.every(
      ({ file, route, selector }) =>
        file === localeFile("/guide", "en") &&
        route === en("/guide") &&
        selector.startsWith("html > body"),
    ),
  );
});

test("same-language navigation permits only exact language controls and exact SEO alternates", async (t) => {
  const root = temporaryTree(t);
  const alternateHead = (locale) => `<link rel="canonical" href="${ORIGIN}${localeRoutePath(
    "/guide",
    locale,
  )}">
    <link rel="alternate" hreflang="zh-CN" href="${ORIGIN}${zh("/guide")}">
    <link rel="alternate" hreflang="en" href="${ORIGIN}${en("/guide")}">
    <link rel="alternate" hreflang="x-default" href="${ORIGIN}${localeRoutePath(
      "/guide",
      ROOT_LOCALE,
    )}">`;
  writePair(root, "/");
  writePair(root, "/other");
  writePair(root, "/guide", {
    zhHead: alternateHead("zh-CN"),
    enHead: alternateHead("en"),
    zh: `<section id="api"></section><nav aria-label="Language">
      <a hreflang="zh-CN" href="${zh("/guide")}?q=x#api">Chinese</a>
      <a hreflang="en" href="${en("/guide")}?q=x#api">English</a>
    </nav>
    <a href="${en("/other")}">Wrong English route</a>`,
    en: `<section id="api"></section><nav aria-label="Language">
      <a hreflang="zh-CN" href="${zh("/guide")}?q=x#api">Chinese</a>
      <a hreflang="en" href="${en("/guide")}?q=x#api">English</a>
    </nav>
    <a href="${zh("/other")}">Wrong Chinese route</a>
    <a hreflang="zh-CN" href="${zh("/other")}">Fake language control</a>`,
  });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route, target }) => [kind, route, target]),
    [
      ["cross-language-link", en("/guide"), zh("/other")],
      ["cross-language-link", en("/guide"), zh("/other")],
      ["cross-language-link", zh("/guide"), en("/other")],
    ],
  );
});

test("canonical pages require one exact canonical and complete exact hreflang links", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/other");
  writePair(root, "/guide", {
    enHead: `<link rel="canonical" href="${en("/other")}">
      <link rel="alternate" hreflang="zh-CN" href="${zh("/guide")}">
      <link rel="alternate" hreflang="en" href="${en("/other")}">`,
  });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route, target }) => [kind, route, target]),
    [
      ["invalid-canonical", en("/guide"), en("/guide")],
      ["missing-seo-alternate", en("/guide"), en("/guide")],
      ["invalid-seo-alternate", en("/guide"), en("/guide")],
    ],
  );
});

test("every physical route reports a missing canonical and checks hreflang independently", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/", { seo: false });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route, target }) => [kind, route, target]),
    [
      ["missing-canonical", en("/"), en("/")],
      ["missing-seo-alternate", en("/"), zh("/")],
      ["missing-seo-alternate", en("/"), en("/")],
      ["missing-seo-alternate", en("/"), en("/")],
      ["missing-canonical", zh("/"), zh("/")],
      ["missing-seo-alternate", zh("/"), zh("/")],
      ["missing-seo-alternate", zh("/"), en("/")],
      ["missing-seo-alternate", zh("/"), en("/")],
    ],
  );
});

test("paired language links must preserve explicitly represented query and fragment", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/guide", {
    zh: `<nav>
      <a hreflang="zh-CN" href="${zh("/guide")}?q=x#api">Chinese</a>
      <a hreflang="en" href="${en("/guide")}#api">English</a>
    </nav><section id="api"></section>`,
    en: `<nav>
      <a hreflang="zh-CN" href="${zh("/guide")}?q=x">Chinese</a>
      <a hreflang="en" href="${en("/guide")}?q=x#api">English</a>
    </nav><section id="api"></section>`,
  });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route }) => [kind, route]),
    [
      ["language-pair-state-loss", en("/guide")],
      ["language-pair-state-loss", zh("/guide")],
    ],
  );
});

test("fragment validation reads the normalized target HTML document", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/target", {
    zh: '<section id="details"></section>',
    en: '<section id="details"></section>',
  });
  writePair(root, "/source", {
    zh: `<a href="${zh("/target.html")}#details">Valid</a>`,
    en: `<a href="${en("/target/index.html")}#missing">Invalid</a>`,
  });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route, target }) => [kind, route, target]),
    [["missing-fragment", en("/source"), `${en("/target")}#missing`]],
  );
});
