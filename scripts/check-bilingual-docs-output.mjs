#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const requireFromWww = createRequire(
  new URL("../apps/www/package.json", import.meta.url),
);
const { JSDOM } = requireFromWww("jsdom");

const CJK = /[\p{Script=Han}，。！？；：、（）【】《》〈〉「」『』]/u;
const SCANNED_ATTRIBUTES = [
  "aria-label",
  "aria-description",
  "placeholder",
  "title",
  "alt",
];

function normalized(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isHidden(element) {
  if (!element) return true;
  return Boolean(
    element.closest(
      "[hidden], [inert], [aria-hidden='true'], script, style, template, noscript, input[type='hidden']",
    ),
  );
}

export function scanEnglishDocument(file) {
  const dom = new JSDOM(readFileSync(file, "utf8"));
  const { document, NodeFilter } = dom.window;
  const findings = [];

  const add = (field, rawValue) => {
    const value = normalized(rawValue ?? "");
    if (value && CJK.test(value)) findings.push({ file, field, value });
  };

  add("metadata:title", document.title);
  for (const meta of document.querySelectorAll(
    "meta[name='description'], meta[property^='og:'], meta[name^='twitter:']",
  )) {
    add(`metadata:${meta.getAttribute("name") ?? meta.getAttribute("property")}`, meta.content);
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!isHidden(node.parentElement)) add("visible:text", node.nodeValue);
  }

  for (const attribute of SCANNED_ATTRIBUTES) {
    for (const element of document.querySelectorAll(`[${attribute}]`)) {
      if (!isHidden(element)) add(`attribute:${attribute}`, element.getAttribute(attribute));
    }
  }

  dom.window.close();
  return findings;
}

const DOCS_ROUTE = /^\/(?:start|changelog|search|theme(?:\/|$)|blocks(?:\/|$)|pages(?:\/|$)|components(?:\/|$))/;

export function scanEnglishLinks(file) {
  const dom = new JSDOM(readFileSync(file, "utf8"));
  const { document } = dom.window;
  const findings = [];
  for (const element of document.querySelectorAll("[href], [src], [action]")) {
    for (const attribute of ["href", "src", "action"]) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      if (value.includes("/en/en")) {
        findings.push({ file, field: `duplicate-prefix:${attribute}`, value });
      }
      if (
        attribute === "href" &&
        DOCS_ROUTE.test(value) &&
        element.getAttribute("hreflang")?.toLowerCase() !== "zh-cn"
      ) {
        findings.push({ file, field: "cross-locale:href", value });
      }
    }
  }
  dom.window.close();
  return findings;
}

function htmlFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => join(dir, entry.name))
    .sort();
}

function metadataSlugs(file) {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(/^\s+slug:\s*["']([^"']+)["'],?$/gm)].map((match) => match[1]);
}

export function task9ExpectedRelativeRoutes() {
  const blockSlugs = metadataSlugs(
    new URL("../apps/www/app/blocks/_meta.ts", import.meta.url),
  );
  const pageSlugs = metadataSlugs(
    new URL("../apps/www/app/pages/_meta.ts", import.meta.url),
  );
  if (blockSlugs.length === 0 || pageSlugs.length === 0) {
    throw new Error("Task 9 route metadata did not contain block/page slugs");
  }
  const theme = [
    "theme.html",
    "theme/breakpoints.html",
    "theme/color.html",
    "theme/cursors.html",
    "theme/dark-mode.html",
    "theme/motion.html",
    "theme/radius.html",
    "theme/shadows.html",
    "theme/spacing.html",
    "theme/typography.html",
  ];
  return [
    "index.html",
    "start.html",
    "changelog.html",
    "search.html",
    "blocks.html",
    "pages.html",
    ...theme,
    ...blockSlugs.map((slug) => `blocks/${slug}.html`),
    ...blockSlugs.map((slug) => `preview/blocks/${slug}.html`),
    ...pageSlugs.map((slug) => `pages/${slug}.html`),
    ...pageSlugs.map((slug) => `preview/pages/${slug}.html`),
    "404.html",
  ];
}

export function task9EnglishRoutes(root) {
  const expected = task9ExpectedRelativeRoutes();
  for (const route of expected) {
    const file = join(root, route);
    if (!existsSync(file)) throw new Error(`Missing English output route: ${relative(root, file)}`);
  }

  const actualGalleryRoutes = [
    ...htmlFiles(join(root, "blocks")),
    ...htmlFiles(join(root, "preview", "blocks")),
    ...htmlFiles(join(root, "pages")),
    ...htmlFiles(join(root, "preview", "pages")),
  ]
    .map((file) => relative(root, file).replaceAll("\\", "/"))
    .sort();
  const expectedGalleryRoutes = expected
    .filter((route) => /^(?:blocks|pages|preview\/(?:blocks|pages))\//.test(route))
    .sort();
  if (JSON.stringify(actualGalleryRoutes) !== JSON.stringify(expectedGalleryRoutes)) {
    throw new Error("English block/page output differs from the metadata-derived route inventory");
  }
  if (expected.length !== 171) {
    throw new Error(`English Task 9 route inventory: expected 170 + 404, found ${expected.length}`);
  }
  return expected.map((route) => join(root, route));
}

export function scanTask9EnglishOutput(root) {
  return task9EnglishRoutes(root).flatMap((file) => [
    ...scanEnglishDocument(file),
    ...scanEnglishLinks(file),
  ]);
}

const invoked = resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (invoked) {
  const root = resolve(process.argv[2] ?? "apps/www/out/en");
  try {
    const files = task9EnglishRoutes(root);
    const findings = files.flatMap((file) => [
      ...scanEnglishDocument(file),
      ...scanEnglishLinks(file),
    ]);
    if (findings.length > 0) {
      for (const finding of findings) {
        console.error(
          `[docs-output] ${relative(root, finding.file)} ${finding.field}: ${JSON.stringify(finding.value)}`,
        );
      }
      console.error(`[docs-output] ${findings.length} content or locale-link finding(s) across ${files.length} routes`);
      process.exitCode = 1;
    } else {
      console.log(`[docs-output] ${files.length - 1} Task 9 routes + /en/404: no visible/metadata CJK, /en/en, or cross-locale docs links`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
