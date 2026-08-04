#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import {
  NESTED_BASE_PATH,
  NESTED_LOCALE,
  ROOT_LOCALE,
  basePathForLocale,
  localeFromPathname,
  localeRoutePath,
  stripLocalePrefix,
} from "./docs-locale-layout.mjs";

const nestedSegment = NESTED_BASE_PATH.slice(1);
const duplicateNestedPrefix = new RegExp(`(?:^|/)${nestedSegment}/${nestedSegment}(?:/|$)`);

const INTERNAL_HOSTS = new Set([
  "hulian.local",
  "hulianui.haloritual.com",
  "hulianui-zh.haloritual.com",
]);
const IGNORED_SCHEMES = new Set(["mailto:", "tel:", "data:"]);

function slash(path) {
  return path.split(sep).join("/");
}

function normalizeRoutePath(pathname) {
  let path = pathname.replace(/\/+/g, "/");
  if (path !== "/" && path.endsWith("/")) path = path.slice(0, -1);
  if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length) || "/";
  else if (path.endsWith(".html")) path = path.slice(0, -".html".length) || "/";
  return path || "/";
}

function decodePathname(pathname) {
  try {
    return pathname
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/");
  } catch {
    return null;
  }
}

function routeFromRelativeHtml(relativePath, locale) {
  const path = slash(relativePath);
  let bare;
  let documentPath;
  if (path === "index.html") {
    bare = "/";
    documentPath = "/";
  } else if (path.endsWith("/index.html")) {
    bare = `/${path.slice(0, -"/index.html".length)}`;
    documentPath = `${bare}/`;
  } else {
    bare = `/${path.slice(0, -".html".length)}`;
    documentPath = bare;
  }
  const prefix = basePathForLocale(locale);
  return {
    bare: normalizeRoutePath(bare),
    route: prefix + (bare === "/" ? "" : normalizeRoutePath(bare)) || "/",
    documentPath: prefix + (documentPath === "/" ? "/" : documentPath),
  };
}

async function physicalFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) files.push(join(entry.parentPath, entry.name));
  }
  return files.sort();
}

function isRouteHtml(file) {
  if (!file.endsWith(".html")) return false;
  return /<html(?:\s|>)/i.test(readFileSync(file, "utf8"));
}

function selectorFor($, element) {
  const parts = [];
  let current = element;
  while (current?.type === "tag") {
    let part = current.name;
    const id = $(current).attr("id");
    if (id) {
      part += `#${id}`;
    } else {
      const siblings = $(current).parent().children(current.name).toArray();
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
    }
    parts.unshift(part);
    if (current.name === "html") break;
    current = current.parent;
  }
  return parts.join(" > ") || "document";
}

function localeFromPath(pathname) {
  return localeFromPathname(pathname);
}

function barePath(pathname) {
  return stripLocalePrefix(pathname) || "/";
}

function hrefLocale(hreflang) {
  const value = hreflang?.toLowerCase();
  if (value === "en") return "en";
  if (value === "zh-cn" || value === "zh") return "zh-CN";
  return null;
}

function targetDisplay(target) {
  return `${target.route}${target.search}${target.hash}`;
}

function makeFinding(document, kind, selector, rawHref, target, detail) {
  return {
    kind,
    file: document.fileRelative,
    route: document.route,
    selector,
    href: rawHref,
    target,
    detail,
  };
}

async function buildInventory(root) {
  const files = await physicalFiles(root);
  const documents = [];
  const physicalPaths = new Set();
  for (const file of files) {
    const fileRelative = slash(relative(root, file));
    const publicPath = `/${fileRelative}`;
    physicalPaths.add(publicPath);
    if (!isRouteHtml(file) || fileRelative.startsWith("_next/")) continue;
    // 嵌套语言在产物里带目录前缀，根语言直接铺在根。目录角色由 SSOT 决定。
    const nestedDirectory = `${NESTED_BASE_PATH.slice(1)}/`;
    const locale = fileRelative.startsWith(nestedDirectory) ? NESTED_LOCALE : ROOT_LOCALE;
    const localeRelative =
      locale === NESTED_LOCALE ? fileRelative.slice(nestedDirectory.length) : fileRelative;
    if (locale === ROOT_LOCALE && localeRelative.startsWith(nestedDirectory)) continue;
    const route = routeFromRelativeHtml(localeRelative, locale);
    documents.push({ file, fileRelative, locale, ...route });
  }
  documents.sort(
    (a, b) => a.route.localeCompare(b.route) || a.fileRelative.localeCompare(b.fileRelative),
  );
  return { files, documents, physicalPaths };
}

function buildRouteMaps(documents) {
  const localized = new Map();
  const byLocaleAndBare = new Map();
  for (const document of documents) {
    const key = `${document.locale}:${document.bare}`;
    if (!byLocaleAndBare.has(key)) byLocaleAndBare.set(key, []);
    byLocaleAndBare.get(key).push(document);
    if (!localized.has(document.route)) localized.set(document.route, document);
  }
  return { localized, byLocaleAndBare };
}

function resolveInternalHref(rawHref, document, localizedRoutes, physicalPaths) {
  const trimmed = rawHref.trim();
  if (/^javascript:/i.test(trimmed)) return { kind: "javascript" };
  const scheme = trimmed.match(/^[a-z][a-z\d+.-]*:/i)?.[0].toLowerCase();
  if (scheme && IGNORED_SCHEMES.has(scheme)) return { kind: "ignored" };

  let url;
  try {
    url = new URL(trimmed, `https://hulian.local${document.documentPath}`);
  } catch {
    return { kind: "malformed" };
  }
  if (!INTERNAL_HOSTS.has(url.hostname)) return { kind: "external" };
  const decodedPathname = decodePathname(url.pathname);
  if (decodedPathname === null) return { kind: "malformed" };
  const normalizedRoute = normalizeRoutePath(decodedPathname);
  const routeDocument = localizedRoutes.get(normalizedRoute);
  const exactPhysical = physicalPaths.has(decodedPathname);
  return {
    kind: "internal",
    url,
    pathname: decodedPathname,
    route: routeDocument?.route ?? normalizedRoute,
    routeDocument,
    exists: Boolean(routeDocument || exactPhysical),
    search: url.search,
    hash: url.hash,
  };
}

/**
 * 这条 link 是不是「连接提示」而非导航链接。
 *
 * 只认 href 语义为 origin 的两种 rel。preload / stylesheet / icon 之类同样不是导航，
 * 但它们指向具体文件、落在语言前缀下，照常校验反而能挡住真实的跨语言资源引用。
 */
export function isResourceHint($, element) {
  if (element.name !== "link") return false;
  const relations = new Set(($(element).attr("rel") ?? "").toLowerCase().split(/\s+/));
  return relations.has("preconnect") || relations.has("dns-prefetch");
}

function isExactCrossLanguageException($, element, document, target) {
  if (!target.routeDocument || target.routeDocument.bare !== document.bare) return false;
  const tag = element.name;
  const hreflang = $(element).attr("hreflang");
  const targetLocale = localeFromPath(target.routeDocument.route);
  if (tag === "a") return hrefLocale(hreflang) === targetLocale;
  if (tag !== "link") return false;
  const relations = new Set(($(element).attr("rel") ?? "").toLowerCase().split(/\s+/));
  return (
    relations.has("alternate") &&
    (hrefLocale(hreflang) === targetLocale || hreflang === "x-default")
  );
}

function fragmentExists(document, fragment, cache) {
  let ids = cache.get(document.file);
  if (!ids) {
    const $ = cheerio.load(readFileSync(document.file, "utf8"));
    ids = new Set(
      $("[id]")
        .toArray()
        .map((element) => $(element).attr("id")),
    );
    cache.set(document.file, ids);
  }
  try {
    return ids.has(decodeURIComponent(fragment.slice(1)));
  } catch {
    return false;
  }
}

function checkLanguagePairState($, document, records, findings) {
  const groups = new Map();
  for (const record of records) {
    if (!record.target?.routeDocument || !record.hreflang) continue;
    if (record.target.routeDocument.bare !== document.bare) continue;
    const locale = hrefLocale(record.hreflang);
    if (!locale) continue;
    const parent = record.element.parent;
    const groupKey = `${record.element.name}:${selectorFor($, parent)}`;
    if (!groups.has(groupKey)) groups.set(groupKey, new Map());
    groups.get(groupKey).set(locale, record);
  }
  for (const group of groups.values()) {
    const chinese = group.get("zh-CN");
    const english = group.get("en");
    if (!chinese || !english) continue;
    if (
      chinese.target.search !== english.target.search ||
      chinese.target.hash !== english.target.hash
    ) {
      findings.push(
        makeFinding(
          document,
          "language-pair-state-loss",
          english.selector,
          english.rawHref,
          targetDisplay(english.target),
          `zh-CN keeps ${chinese.target.search}${chinese.target.hash || ""} but en keeps ${
            english.target.search
          }${english.target.hash || ""}`,
        ),
      );
    }
  }
}

function relationSet($, element) {
  return new Set(($(element).attr("rel") ?? "").toLowerCase().split(/\s+/).filter(Boolean));
}

function isExactRouteTarget(target, expectedRoute) {
  return (
    target?.kind === "internal" &&
    target.routeDocument?.route === expectedRoute &&
    target.search === "" &&
    target.hash === ""
  );
}

function checkSeoAlternates($, document, localizedRoutes, physicalPaths, findings) {
  const canonical = $("link[href]")
    .toArray()
    .filter((element) => relationSet($, element).has("canonical"));
  if (canonical.length === 0) {
    findings.push(
      makeFinding(
        document,
        "missing-canonical",
        "html > head",
        "",
        document.route,
        "physical route is missing rel=canonical",
      ),
    );
  } else {
    const canonicalElement = canonical[0];
    const canonicalHref = $(canonicalElement).attr("href");
    const canonicalTarget = resolveInternalHref(
      canonicalHref,
      document,
      localizedRoutes,
      physicalPaths,
    );
    if (canonical.length !== 1 || !isExactRouteTarget(canonicalTarget, document.route)) {
      findings.push(
        makeFinding(
          document,
          "invalid-canonical",
          `${selectorFor($, canonicalElement)}@href`,
          canonicalHref,
          document.route,
          "canonical must appear once and point to the current physical route without query or hash",
        ),
      );
    }
  }

  const expected = new Map([
    ["zh-CN", localeRoutePath(document.bare, "zh-CN")],
    ["en", localeRoutePath(document.bare, "en")],
    ["x-default", localeRoutePath(document.bare, ROOT_LOCALE)],
  ]);
  const alternates = $("link[href]")
    .toArray()
    .filter((element) => relationSet($, element).has("alternate"));

  for (const [hreflang, expectedRoute] of expected) {
    const matching = alternates.filter(
      (element) => ($(element).attr("hreflang") ?? "").toLowerCase() === hreflang.toLowerCase(),
    );
    if (matching.length === 0) {
      findings.push(
        makeFinding(
          document,
          "missing-seo-alternate",
          "html > head",
          "",
          expectedRoute,
          `physical route is missing rel=alternate hreflang=${hreflang}`,
        ),
      );
      continue;
    }
    const element = matching[0];
    const rawHref = $(element).attr("href");
    const target = resolveInternalHref(rawHref, document, localizedRoutes, physicalPaths);
    if (matching.length !== 1 || !isExactRouteTarget(target, expectedRoute)) {
      findings.push(
        makeFinding(
          document,
          "invalid-seo-alternate",
          `${selectorFor($, element)}@href`,
          rawHref,
          expectedRoute,
          `hreflang=${hreflang} must appear once and point to the exact paired route without query or hash`,
        ),
      );
    }
  }
}

function checkDocumentMetadata($, document, findings) {
  const title = $("head > title").first().text().trim();
  if (!title) {
    findings.push(
      makeFinding(
        document,
        "missing-document-title",
        "html > head > title",
        "",
        document.route,
        "physical route must render a non-empty document title",
      ),
    );
  }
  const description = $("head > meta[name='description']").first().attr("content")?.trim();
  if (!description) {
    findings.push(
      makeFinding(
        document,
        "missing-meta-description",
        "html > head > meta[name='description']",
        "",
        document.route,
        "physical route must render a non-empty meta description",
      ),
    );
  }
}

export async function checkBilingualLinks(root) {
  const resolvedRoot = resolve(root);
  const { documents, physicalPaths } = await buildInventory(resolvedRoot);
  const { localized, byLocaleAndBare } = buildRouteMaps(documents);
  const findings = [];

  for (const [key, duplicateDocuments] of byLocaleAndBare) {
    if (duplicateDocuments.length < 2) continue;
    for (const document of duplicateDocuments.slice(1)) {
      findings.push(
        makeFinding(
          document,
          "duplicate-route-output",
          "document",
          "",
          key,
          `multiple physical HTML files normalize to ${document.route}`,
        ),
      );
    }
  }

  const chineseRoutes = new Set(
    documents.filter(({ locale }) => locale === "zh-CN").map(({ bare }) => bare),
  );
  const englishRoutes = new Set(
    documents.filter(({ locale }) => locale === "en").map(({ bare }) => bare),
  );
  for (const route of [...chineseRoutes].filter((route) => !englishRoutes.has(route)).sort()) {
    const document = byLocaleAndBare.get(`zh-CN:${route}`)[0];
    findings.push(
      makeFinding(
        document,
        "missing-language-pair",
        "document",
        "",
        localeRoutePath(route, "en"),
        "Chinese route has no English physical HTML pair",
      ),
    );
  }
  for (const route of [...englishRoutes].filter((route) => !chineseRoutes.has(route)).sort()) {
    const document = byLocaleAndBare.get(`en:${route}`)[0];
    findings.push(
      makeFinding(
        document,
        "missing-language-pair",
        "document",
        "",
        localeRoutePath(route, "zh-CN"),
        "English route has no Chinese physical HTML pair",
      ),
    );
  }

  let linkCount = 0;
  const fragmentCache = new Map();
  for (const document of documents) {
    const $ = cheerio.load(readFileSync(document.file, "utf8"));
    const records = [];
    checkDocumentMetadata($, document, findings);
    $("a[href], area[href], link[href]").each((_, element) => {
      linkCount += 1;
      const rawHref = $(element).attr("href");
      // 资源提示（preconnect / dns-prefetch）的 href 是一个 **origin**，不是文档路由。
      // Next 为 CSS 里的 @font-face 注入 <link rel="preconnect" href="/" crossorigin>，
      // 拿「必须落在同语言配对路由」去校验它是范畴错误 —— 它压根不是导航链接，
      // 指向站点根正是它该有的样子。组件页引入 KaTeX 字体后才第一次触发：
      // 在那之前全站的资源类 link 都指向带语言前缀的具体文件，从没有指向根的。
      if (isResourceHint($, element)) return;
      const selector = `${selectorFor($, element)}@href`;
      const target = resolveInternalHref(rawHref, document, localized, physicalPaths);
      const record = {
        element,
        rawHref,
        selector,
        hreflang: $(element).attr("hreflang"),
        target: target.kind === "internal" ? target : null,
      };
      records.push(record);

      if (target.kind === "ignored" || target.kind === "external") return;
      if (target.kind === "javascript") {
        findings.push(
          makeFinding(
            document,
            "unsafe-javascript-url",
            selector,
            rawHref,
            rawHref,
            "javascript: URLs are forbidden",
          ),
        );
        return;
      }
      if (target.kind === "malformed") {
        findings.push(
          makeFinding(
            document,
            "malformed-url",
            selector,
            rawHref,
            rawHref,
            "URL cannot be decoded safely",
          ),
        );
        return;
      }
      // basePath 被重复拼接的痕迹。根语言 basePath 是空串不可能重复，只有嵌套语言会出现
      // 形如 /zh/zh 的路径，说明某处对已带前缀的路径又加了一次前缀。
      if (duplicateNestedPrefix.test(target.pathname)) {
        findings.push(
          makeFinding(
            document,
            "duplicate-locale-prefix",
            selector,
            rawHref,
            targetDisplay(target),
            `Path repeats the ${NESTED_BASE_PATH} prefix`,
          ),
        );
        return;
      }
      if (!target.exists) {
        findings.push(
          makeFinding(
            document,
            "missing-target",
            selector,
            rawHref,
            targetDisplay(target),
            "internal target has no physical route or file",
          ),
        );
        return;
      }

      if (target.routeDocument) {
        const targetLocale = target.routeDocument.locale;
        if (
          targetLocale !== document.locale &&
          !isExactCrossLanguageException($, element, document, target)
        ) {
          findings.push(
            makeFinding(
              document,
              "cross-language-link",
              selector,
              rawHref,
              targetDisplay(target),
              `${document.locale} page links to ${targetLocale} route outside its exact language pair`,
            ),
          );
          return;
        }
        if (target.hash && !fragmentExists(target.routeDocument, target.hash, fragmentCache)) {
          findings.push(
            makeFinding(
              document,
              "missing-fragment",
              selector,
              rawHref,
              targetDisplay(target),
              "fragment ID does not exist in target HTML",
            ),
          );
        }
      }
    });
    checkLanguagePairState($, document, records, findings);
    checkSeoAlternates($, document, localized, physicalPaths, findings);
  }

  const priority = new Map([
    ["missing-language-pair", 0],
    ["duplicate-route-output", 1],
    ["missing-target", 2],
    ["duplicate-locale-prefix", 3],
    ["unsafe-javascript-url", 4],
    ["malformed-url", 5],
    ["cross-language-link", 6],
    ["missing-fragment", 7],
    ["language-pair-state-loss", 8],
    ["missing-canonical", 9],
    ["invalid-canonical", 10],
    ["missing-seo-alternate", 11],
    ["invalid-seo-alternate", 12],
    ["missing-document-title", 13],
    ["missing-meta-description", 14],
  ]);
  findings.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      (priority.get(a.kind) ?? 99) - (priority.get(b.kind) ?? 99) ||
      a.selector.localeCompare(b.selector),
  );
  return {
    findings,
    counts: {
      chineseRoutes: chineseRoutes.size,
      englishRoutes: englishRoutes.size,
      links: linkCount,
      physicalFiles: physicalPaths.size,
    },
  };
}

function printFinding(item) {
  return `[bilingual-links] ${item.file} route=${item.route} selector=${item.selector} kind=${
    item.kind
  } target=${JSON.stringify(item.target)}: ${item.detail}`;
}

const invoked = resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (invoked) {
  const root = resolve(process.argv[2] ?? "apps/www/out");
  try {
    const result = await checkBilingualLinks(root);
    if (result.findings.length > 0) {
      result.findings.forEach((item) => console.error(printFinding(item)));
      console.error(
        `[bilingual-links] ${result.findings.length} finding(s) across ${result.counts.chineseRoutes} Chinese routes, ${result.counts.englishRoutes} English routes, and ${result.counts.links} links`,
      );
      process.exitCode = 1;
    } else {
      console.log(
        `[bilingual-links] verified ${result.counts.chineseRoutes} Chinese + ${result.counts.englishRoutes} English routes and ${result.counts.links} links (${result.counts.physicalFiles} physical files)`,
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  }
}
