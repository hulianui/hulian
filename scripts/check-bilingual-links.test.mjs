import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { checkBilingualLinks } from "./check-bilingual-links.mjs";

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

function document(body, head = "") {
  return `<!doctype html><html><head><title>Fixture</title><meta name="description" content="Fixture description">${head}</head><body>${body}</body></html>`;
}

function writePair(root, route, { zh = "", en = "", zhHead = "", enHead = "" } = {}) {
  const relativePath = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  write(root, relativePath, document(zh, zhHead));
  write(root, join("en", relativePath), document(en, enHead));
}

test("route parity is derived from every physical route including 404 and _not-found", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/404");
  writePair(root, "/_not-found");
  write(root, "only-chinese.html", document("Chinese"));
  write(root, "en/only-english.html", document("English"));
  write(root, "google-verification.html", "google-site-verification: token");
  write(root, "en/google-verification.html", "google-site-verification: token");

  const result = await checkBilingualLinks(root);

  assert.equal(result.counts.chineseRoutes, 4);
  assert.equal(result.counts.englishRoutes, 4);
  assert.deepEqual(
    result.findings.map(({ kind, route, target }) => [kind, route, target]),
    [
      ["missing-language-pair", "/en/only-english", "/only-english"],
      ["missing-language-pair", "/only-chinese", "/en/only-chinese"],
    ],
  );
});

test("every physical route requires a non-empty title and meta description", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  write(
    root,
    "broken.html",
    '<!doctype html><html><head><title></title><meta name="description" content=""></head><body>Broken</body></html>',
  );
  write(root, "en/broken.html", document("English"));

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route }) => [kind, route]),
    [
      ["missing-document-title", "/broken"],
      ["missing-meta-description", "/broken"],
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
  write(root, "en/assets/logo.svg", "<svg></svg>");
  write(root, "registry.json", "{}");
  write(root, "en/registry.json", "{}");

  write(
    root,
    "guide/index.html",
    document(`<main id="api">
      <a href="/guide/index.html?tab=all#api">Root HTML</a>
      <a href="next.html">Relative HTML</a>
      <a href="/caf%C3%A9">Encoded route</a>
      <a href="/registry.json?raw=1">JSON</a>
      <a href="/assets/logo.svg">Asset</a>
      <a href="#api">Local fragment</a>
      <a href="mailto:test@example.com">Mail</a>
      <a href="tel:+10000000000">Phone</a>
      <a href="data:text/plain,hello">Data</a>
      <a href="https://example.com/path">External</a>
    </main>`),
  );
  write(
    root,
    "en/guide/index.html",
    document(`<main id="api">
      <a href="/en/guide/index.html?tab=all#api">Root HTML</a>
      <a href="next.html">Relative HTML</a>
      <a href="/en/caf%C3%A9">Encoded route</a>
      <a href="/en/registry.json?raw=1">JSON</a>
      <a href="/en/assets/logo.svg">Asset</a>
      <a href="#api">Local fragment</a>
    </main>`),
  );

  const result = await checkBilingualLinks(root);

  assert.equal(result.findings.length, 0);
  assert.equal(result.counts.chineseRoutes, 4);
  assert.equal(result.counts.englishRoutes, 4);
  assert.equal(result.counts.links, 16);
});

test("crawler reports missing targets, unsafe JavaScript, duplicate prefixes, and bad fragments", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/guide", {
    en: `<main id="valid">
      <a href="/en/missing">Missing</a>
      <a href="/en/en/guide">Double English</a>
      <a href="javascript:alert(1)">Unsafe</a>
      <a href="#absent">Bad fragment</a>
    </main>`,
  });

  const result = await checkBilingualLinks(root);
  const kinds = result.findings.map(({ kind }) => kind);

  assert.deepEqual(kinds, [
    "missing-target",
    "duplicate-english-prefix",
    "unsafe-javascript-url",
    "missing-fragment",
  ]);
  assert.ok(
    result.findings.every(
      ({ file, route, selector }) =>
        file === "en/guide.html" && route === "/en/guide" && selector.startsWith("html > body"),
    ),
  );
});

test("same-language navigation permits only exact language controls and exact SEO alternates", async (t) => {
  const root = temporaryTree(t);
  const alternateHead = (locale) => `<link rel="canonical" href="https://hulianui.haloritual.com/${
    locale === "en" ? "en/" : ""
  }guide">
    <link rel="alternate" hreflang="zh-CN" href="https://hulianui.haloritual.com/guide">
    <link rel="alternate" hreflang="en" href="https://hulianui.haloritual.com/en/guide">
    <link rel="alternate" hreflang="x-default" href="https://hulianui.haloritual.com/en/guide">`;
  writePair(root, "/");
  writePair(root, "/other");
  writePair(root, "/guide", {
    zhHead: alternateHead("zh-CN"),
    enHead: alternateHead("en"),
    zh: `<section id="api"></section><nav aria-label="Language">
      <a hreflang="zh-CN" href="/guide?q=x#api">Chinese</a>
      <a hreflang="en" href="/en/guide?q=x#api">English</a>
    </nav>
    <a href="/en/other">Wrong English route</a>`,
    en: `<section id="api"></section><nav aria-label="Language">
      <a hreflang="zh-CN" href="/guide?q=x#api">Chinese</a>
      <a hreflang="en" href="/en/guide?q=x#api">English</a>
    </nav>
    <a href="/other">Wrong Chinese route</a>
    <a hreflang="zh-CN" href="/other">Fake language control</a>`,
  });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route, target }) => [kind, route, target]),
    [
      ["cross-language-link", "/en/guide", "/other"],
      ["cross-language-link", "/en/guide", "/other"],
      ["cross-language-link", "/guide", "/en/other"],
    ],
  );
});

test("canonical pages require one exact canonical and complete exact hreflang links", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/other");
  writePair(root, "/guide", {
    enHead: `<link rel="canonical" href="/en/other">
      <link rel="alternate" hreflang="zh-CN" href="/guide">
      <link rel="alternate" hreflang="en" href="/en/other">`,
  });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route, target }) => [kind, route, target]),
    [
      ["invalid-canonical", "/en/guide", "/en/guide"],
      ["missing-seo-alternate", "/en/guide", "/en/guide"],
      ["invalid-seo-alternate", "/en/guide", "/en/guide"],
    ],
  );
});

test("paired language links must preserve explicitly represented query and fragment", async (t) => {
  const root = temporaryTree(t);
  writePair(root, "/");
  writePair(root, "/guide", {
    zh: `<nav>
      <a hreflang="zh-CN" href="/guide?q=x#api">Chinese</a>
      <a hreflang="en" href="/en/guide#api">English</a>
    </nav><section id="api"></section>`,
    en: `<nav>
      <a hreflang="zh-CN" href="/guide?q=x">Chinese</a>
      <a hreflang="en" href="/en/guide?q=x#api">English</a>
    </nav><section id="api"></section>`,
  });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route }) => [kind, route]),
    [
      ["language-pair-state-loss", "/en/guide"],
      ["language-pair-state-loss", "/guide"],
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
    zh: '<a href="/target.html#details">Valid</a>',
    en: '<a href="/en/target/index.html#missing">Invalid</a>',
  });

  const result = await checkBilingualLinks(root);

  assert.deepEqual(
    result.findings.map(({ kind, route, target }) => [kind, route, target]),
    [["missing-fragment", "/en/source", "/en/target#missing"]],
  );
});
