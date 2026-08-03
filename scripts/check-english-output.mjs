#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const RESIDUE =
  /[\p{Script=Han}\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/u;
const HUMAN_ATTRIBUTES = ["title", "alt", "placeholder", "aria-label", "aria-description"];
const HIDDEN_SELECTOR = "[hidden], template, noscript, input[type='hidden']";

function slash(path) {
  return path.split(sep).join("/");
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value) {
  const normalized = normalizeText(value);
  return normalized.length <= 180 ? normalized : `${normalized.slice(0, 177)}...`;
}

function routeFromRelativeHtml(relativePath) {
  let route = slash(relativePath);
  if (route === "index.html") return "/";
  if (route.endsWith("/index.html")) route = route.slice(0, -"/index.html".length);
  else route = route.slice(0, -".html".length);
  return `/${route}`.replace(/\/+/g, "/");
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

function hasEnglishExplanation(value) {
  const withoutResidue = String(value ?? "").replace(
    /[\p{Script=Han}\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/gu,
    " ",
  );
  return /\b[A-Za-z][A-Za-z'-]{1,}\b/.test(withoutResidue);
}

function directText(element) {
  return (element.children ?? [])
    .filter((child) => child.type === "text")
    .map((child) => child.data ?? "")
    .join(" ");
}

function allowNodeHasExplanation($, element) {
  if (hasEnglishExplanation(directText(element))) return true;
  const previous = $(element).prev()[0];
  const next = $(element).next()[0];
  const previousText = previous ? $(previous).text() : element.prev?.data;
  const nextText = next ? $(next).text() : element.next?.data;
  return hasEnglishExplanation(previousText) || hasEnglishExplanation(nextText);
}

function isHidden($, element) {
  return $(element).closest(HIDDEN_SELECTOR).length > 0;
}

function isDirectlyAllowed($, element) {
  return $(element).is("[data-i18n-allow-cjk]");
}

function exposeNextStreamedContent($) {
  $("script:not([src])").each((_, script) => {
    const source = $(script).text();
    for (const match of source.matchAll(/\$RC\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g)) {
      const [, placeholderId, segmentId] = match;
      if (!$(`#${placeholderId.replace(/([:.])/g, "\\$1")}`).length) continue;
      $(`#${segmentId.replace(/([:.])/g, "\\$1")}`).removeAttr("hidden");
    }
  });
}

function finding(root, file, route, kind, location, rawValue) {
  return {
    kind,
    file: slash(relative(root, file)),
    route,
    selector: location.split("@")[0],
    location,
    excerpt: excerpt(rawValue),
  };
}

function scanJsonValue(value, visit, path = "$") {
  if (typeof value === "string") {
    visit(path, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanJsonValue(item, visit, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    scanJsonValue(child, visit, `${path}.${key}`);
  }
}

function decodeSvgDataUri(uri) {
  if (!/^data:image\/svg\+xml(?:[;,]|$)/i.test(uri)) return null;
  const comma = uri.indexOf(",");
  if (comma < 0) return null;
  const metadata = uri.slice(0, comma);
  const payload = uri.slice(comma + 1);
  try {
    return /;base64(?:;|$)/i.test(metadata)
      ? Buffer.from(payload, "base64").toString("utf8")
      : decodeURIComponent(payload);
  } catch {
    return null;
  }
}

function scanSvgDataUri($, element, root, file, route, findings) {
  const source = $(element).attr("src");
  if (!source || isDirectlyAllowed($, element)) return;
  const svg = decodeSvgDataUri(source);
  if (svg === null) return;
  const svgDocument = cheerio.load(svg, { xmlMode: true });
  let textIndex = 0;
  for (const textNode of svgDocument("text, title, desc").toArray()) {
    textIndex += 1;
    const value = svgDocument(textNode).text();
    if (!RESIDUE.test(value)) continue;
    findings.push(
      finding(
        root,
        file,
        route,
        "cjk",
        `${selectorFor($, element)}@src:svg/${textNode.name}()[${textIndex}]`,
        value,
      ),
    );
  }
}

export function scanEnglishHtml(file, options = {}) {
  const root = resolve(options.root ?? dirname(file));
  const route = options.route ?? routeFromRelativeHtml(relative(root, file));
  const source = readFileSync(file, "utf8");
  const $ = cheerio.load(source);
  const findings = [];
  exposeNextStreamedContent($);

  const addCjk = (location, value) => {
    if (RESIDUE.test(String(value ?? ""))) {
      findings.push(finding(root, file, route, "cjk", location, value));
    }
  };

  $("[data-i18n-allow-cjk]").each((_, element) => {
    if (!allowNodeHasExplanation($, element)) {
      findings.push(
        finding(
          root,
          file,
          route,
          "invalid-allow-cjk",
          `${selectorFor($, element)}@data-i18n-allow-cjk`,
          $(element).text(),
        ),
      );
    }
  });

  addCjk("title", $("head > title").first().text());
  $(
    "meta[name='description'], meta[name='keywords'], meta[name='application-name'], meta[name='author'], meta[property^='og:'], meta[name^='twitter:']",
  ).each((_, element) => {
    const key = $(element).attr("name")
      ? `name=\"${$(element).attr("name")}\"`
      : `property=\"${$(element).attr("property")}\"`;
    addCjk(`meta[${key}]@content`, $(element).attr("content"));
  });

  $("script[type='application/ld+json']").each((_, element) => {
    const location = "script[application/ld+json]";
    try {
      const data = JSON.parse($(element).text());
      scanJsonValue(data, (path, value) => addCjk(`${location}${path}`, value));
    } catch (error) {
      findings.push(
        finding(
          root,
          file,
          route,
          "invalid-json",
          location,
          error instanceof Error ? error.message : error,
        ),
      );
    }
  });

  const bodyElements = [...$("body").toArray(), ...$("body *").toArray()];
  for (const element of bodyElements) {
    $(element)
      .contents()
      .filter((_, node) => node.type === "text")
      .each((_, node) => {
        const parent = node.parent;
        if (!parent || isHidden($, parent) || ["script", "style"].includes(parent.name)) return;
        if (isDirectlyAllowed($, parent)) return;
        addCjk(`${selectorFor($, parent)}#text`, node.data);
      });
  }

  for (const attribute of HUMAN_ATTRIBUTES) {
    $(`body [${attribute}]`).each((_, element) => {
      if (isHidden($, element) || isDirectlyAllowed($, element)) return;
      addCjk(`${selectorFor($, element)}@${attribute}`, $(element).attr(attribute));
    });
  }
  $("body [src^='data:image/svg+xml']").each((_, element) => {
    if (!isHidden($, element)) scanSvgDataUri($, element, root, file, route, findings);
  });

  return findings;
}

async function physicalFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) files.push(join(entry.parentPath, entry.name));
  }
  return files.sort();
}

function isHumanTextEndpoint(file, englishRoot) {
  const path = slash(relative(englishRoot, file));
  return path === "llms.txt" || path === "llms-full.txt" || /^d\/[^/]+\.md$/.test(path);
}

function isHumanJsonEndpoint(file, englishRoot) {
  const path = slash(relative(englishRoot, file));
  return path === "registry.json" || path === "conventions.json" || /^r\/[^/]+\.json$/.test(path);
}

function scanHumanJson(file, root, route) {
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    return [
      finding(
        root,
        file,
        route,
        "invalid-json",
        "$",
        error instanceof Error ? error.message : error,
      ),
    ];
  }
  const findings = [];
  const isMachineString = (segments) => {
    if (segments[0] === "cssVars") return true;
    if (segments.includes("matcher")) return true;
    const fileIndex = segments.lastIndexOf("files");
    return (
      fileIndex >= 0 &&
      typeof segments[fileIndex + 1] === "number" &&
      segments[fileIndex + 2] === "content"
    );
  };
  const visit = (value, path = "$", segments = []) => {
    if (typeof value === "string") {
      if (!isMachineString(segments) && RESIDUE.test(value)) {
        findings.push(finding(root, file, route, "cjk", path, value));
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`, [...segments, index]));
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [childKey, child] of Object.entries(value)) {
      visit(child, `${path}.${childKey}`, [...segments, childKey]);
    }
  };
  visit(data);
  return findings;
}

function scanHumanText(file, root, route) {
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .flatMap((line, index) =>
      RESIDUE.test(line) ? [finding(root, file, route, "cjk", `line ${index + 1}`, line)] : [],
    );
}

export async function scanEnglishOutput(root) {
  const resolvedRoot = resolve(root);
  const englishRoot = basename(resolvedRoot) === "en" ? resolvedRoot : join(resolvedRoot, "en");
  const files = await physicalFiles(englishRoot);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const jsonFiles = files.filter((file) => isHumanJsonEndpoint(file, englishRoot));
  const textFiles = files.filter((file) => isHumanTextEndpoint(file, englishRoot));
  const findings = [];

  for (const file of htmlFiles) {
    findings.push(
      ...scanEnglishHtml(file, {
        root: resolvedRoot,
        route: routeFromRelativeHtml(relative(resolvedRoot, file)),
      }),
    );
  }
  for (const file of jsonFiles) {
    findings.push(...scanHumanJson(file, resolvedRoot, `/${slash(relative(resolvedRoot, file))}`));
  }
  for (const file of textFiles) {
    findings.push(...scanHumanText(file, resolvedRoot, `/${slash(relative(resolvedRoot, file))}`));
  }

  findings.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.location.localeCompare(b.location) ||
      a.excerpt.localeCompare(b.excerpt),
  );
  return {
    findings,
    counts: {
      html: htmlFiles.length,
      json: jsonFiles.length,
      text: textFiles.length,
      total: htmlFiles.length + jsonFiles.length + textFiles.length,
    },
  };
}

function printFinding(item) {
  return `[english-output] ${item.file} route=${item.route} location=${item.location} kind=${
    item.kind
  }: ${JSON.stringify(item.excerpt)}`;
}

const invoked = resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (invoked) {
  const root = resolve(process.argv[2] ?? "apps/www/out");
  try {
    const result = await scanEnglishOutput(root);
    if (result.findings.length > 0) {
      result.findings.forEach((item) => console.error(printFinding(item)));
      console.error(
        `[english-output] ${result.findings.length} finding(s) across ${result.counts.total} files (${result.counts.html} HTML, ${result.counts.json} JSON, ${result.counts.text} text)`,
      );
      process.exitCode = 1;
    } else {
      console.log(
        `[english-output] scanned ${result.counts.total} files (${result.counts.html} HTML, ${result.counts.json} JSON, ${result.counts.text} text): zero unapproved CJK residue`,
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  }
}
