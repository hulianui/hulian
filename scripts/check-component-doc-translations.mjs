#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_UI_SRC = join(ROOT, "packages", "ui", "src");
const DEFAULT_MANIFEST = join(ROOT, "apps", "www", "lib", "manifest.ts");
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]+/gu;

export function parseManifestEntries(source) {
  return [
    ...source.matchAll(
      /\{\s*slug:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"[\s\S]*?status:\s*"[^"]+"\s*,?\s*\}/g,
    ),
  ].map((match) => ({ slug: match[1], category: match[2] }));
}

function locations(uiSrc, slug) {
  return [
    {
      chinese: join(uiSrc, slug, `${slug}.md`),
      english: join(uiSrc, slug, `${slug}.en.md`),
    },
    {
      chinese: join(uiSrc, "_mui", `${slug}.md`),
      english: join(uiSrc, "_mui", `${slug}.en.md`),
    },
  ];
}

function frontmatterSlug(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
  return block?.match(/^slug:\s*([^\s#]+)\s*$/m)?.[1] ?? null;
}

function spacesPreservingNewlines(value) {
  return value.replace(/[^\n]/g, " ");
}

function backtickRun(source, index) {
  if (source[index] !== "`") return 0;
  let end = index;
  while (source[end] === "`") end += 1;
  return end - index;
}

function hasClosingBacktickRun(source, index, length) {
  for (let cursor = index; cursor < source.length; ) {
    const next = source.indexOf("`", cursor);
    if (next < 0) return false;
    const run = backtickRun(source, next);
    if (run === length) return true;
    cursor = next + run;
  }
  return false;
}

/**
 * Map Markdown while tracking fenced blocks and exact-length inline backtick
 * delimiters. Inline code spans may cross newlines; a single backtick inside a
 * double-backtick span is content and cannot close it.
 */
export function mapMarkdownCode(
  source,
  { outside = (value) => value, inline = (value) => value, fenced = (value) => value } = {},
) {
  const lines = source.match(/.*(?:\n|$)/g)?.filter(Boolean) ?? [];
  let fence = null;
  let inlineTicks = 0;
  let globalOffset = 0;
  return lines
    .map((line) => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
      if (!inlineTicks && fence) {
        const closes = marker?.[0] === fence[0] && marker.length >= fence.length;
        if (closes) fence = null;
        globalOffset += line.length;
        return fenced(line);
      }
      if (!inlineTicks && marker) {
        fence = marker;
        globalOffset += line.length;
        return fenced(line);
      }

      let output = "";
      let cursor = 0;
      while (cursor < line.length) {
        if (inlineTicks) {
          let close = line.indexOf("`", cursor);
          while (close >= 0 && backtickRun(line, close) !== inlineTicks) {
            close += backtickRun(line, close);
            close = line.indexOf("`", close);
          }
          if (close < 0) {
            output += inline(line.slice(cursor));
            cursor = line.length;
            continue;
          }
          const end = close + inlineTicks;
          output += inline(line.slice(cursor, end));
          cursor = end;
          inlineTicks = 0;
          continue;
        }

        const opening = line.indexOf("`", cursor);
        if (opening < 0) {
          output += outside(line.slice(cursor));
          cursor = line.length;
          continue;
        }
        const length = backtickRun(line, opening);
        const end = opening + length;
        if (!hasClosingBacktickRun(source, globalOffset + end, length)) {
          output += outside(line.slice(cursor, end));
          cursor = end;
          continue;
        }
        output += outside(line.slice(cursor, opening));
        output += inline(line.slice(opening, end));
        cursor = end;
        inlineTicks = length;
      }
      globalOffset += line.length;
      return output;
    })
    .join("");
}

/** Hide fenced code while preserving offsets for path:line:column diagnostics. */
export function maskMarkdownFences(source) {
  return mapMarkdownCode(source, { fenced: spacesPreservingNewlines });
}

/** Hide fenced and inline code while preserving offsets for link diagnostics. */
export function maskMarkdownCode(source) {
  return mapMarkdownCode(source, {
    inline: spacesPreservingNewlines,
    fenced: spacesPreservingNewlines,
  });
}

function hasHtmlAttribute(attributes, expected) {
  for (let index = 0; index < attributes.length; ) {
    while (/\s|\//.test(attributes[index] ?? "")) index += 1;
    const start = index;
    while (/[A-Za-z0-9_:.-]/.test(attributes[index] ?? "")) index += 1;
    if (index === start) {
      index += 1;
      continue;
    }
    const name = attributes.slice(start, index).toLowerCase();
    while (/\s/.test(attributes[index] ?? "")) index += 1;
    if (attributes[index] === "=") {
      index += 1;
      while (/\s/.test(attributes[index] ?? "")) index += 1;
      const quote = attributes[index];
      if (quote === '"' || quote === "'") {
        index += 1;
        while (index < attributes.length && attributes[index] !== quote) index += 1;
        if (attributes[index] === quote) index += 1;
      } else {
        while (index < attributes.length && !/\s/.test(attributes[index])) index += 1;
      }
    }
    if (name === expected) return true;
  }
  return false;
}

function maskProperNouns(source) {
  return source.replace(
    /<([A-Za-z][\w:-]*)([^>]*)>[\s\S]*?<\/\1\s*>/gi,
    (match, _tag, attributes) =>
      hasHtmlAttribute(attributes, "data-i18n-allow-cjk") ? spacesPreservingNewlines(match) : match,
  );
}

function positionAt(source, index) {
  const before = source.slice(0, index);
  const line = before.split("\n").length;
  const lastBreak = before.lastIndexOf("\n");
  return { line, column: index - lastBreak };
}

function diagnostic(path, source, index, code, message) {
  return { path, ...positionAt(source, index), code, message };
}

function selectedEntries(manifest, categories) {
  if (!categories || categories.length === 0) return manifest;
  const available = new Set(manifest.map((entry) => entry.category));
  const unknown = categories.filter((category) => !available.has(category));
  if (unknown.length) throw new Error(`Unknown component categories: ${unknown.join(", ")}`);
  const wanted = new Set(categories);
  return manifest.filter((entry) => wanted.has(entry.category));
}

function docMetadata(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
  if (!block) return null;
  const field = (name) => block.match(new RegExp(`^${name}:\\s*([^\\n#]*)`, "m"))?.[1].trim();
  const slug = field("slug");
  if (!slug) return null;
  return {
    slug,
    category: field("category") || "uncatalogued",
    status: field("status") || "scaffold",
  };
}

/** Discover every enriched Chinese document consumed by the public registry. */
export function discoverComponentDocs(uiSrc = DEFAULT_UI_SRC) {
  const entries = [];
  for (const directory of readdirSync(uiSrc).sort()) {
    const path = join(uiSrc, directory);
    if (!statSync(path).isDirectory()) continue;
    const documents =
      directory === "_mui"
        ? readdirSync(path)
            .filter((file) => file.endsWith(".md") && !file.endsWith(".en.md"))
            .map((file) => join(path, file))
        : [join(path, `${directory}.md`)].filter(existsSync);
    for (const document of documents) {
      const metadata = docMetadata(readFileSync(document, "utf8"));
      if (metadata?.status === "enriched") entries.push(metadata);
    }
  }
  return entries;
}

export function checkComponentDocTranslations({
  uiSrc = DEFAULT_UI_SRC,
  manifest,
  categories,
} = {}) {
  const manifestEntries = manifest ?? parseManifestEntries(readFileSync(DEFAULT_MANIFEST, "utf8"));
  const bySlug = new Map(manifestEntries.map((entry) => [entry.slug, entry]));
  for (const entry of discoverComponentDocs(uiSrc)) {
    if (!bySlug.has(entry.slug)) bySlug.set(entry.slug, entry);
  }
  const allEntries = [...bySlug.values()];
  const entries = selectedEntries(allEntries, categories);
  const knownSlugs = new Set(allEntries.map((entry) => entry.slug));
  const diagnostics = [];

  for (const { slug } of entries) {
    const pairs = locations(uiSrc, slug);
    const existingChinese = pairs.filter((pair) => existsSync(pair.chinese));
    if (existingChinese.length === 0) {
      diagnostics.push({
        path: pairs[0].chinese,
        line: 1,
        column: 1,
        code: "missing-chinese",
        message: `Missing Chinese component document for ${slug}`,
      });
      continue;
    }
    if (existingChinese.length > 1) {
      diagnostics.push({
        path: existingChinese[1].chinese,
        line: 1,
        column: 1,
        code: "duplicate-chinese",
        message: `Duplicate Chinese component document for ${slug}`,
      });
    }

    const pair = existingChinese[0];
    if (!existsSync(pair.english)) {
      diagnostics.push({
        path: pair.english,
        line: 1,
        column: 1,
        code: "missing-english",
        message: `Missing English component document for ${slug}`,
      });
      continue;
    }

    const chinese = readFileSync(pair.chinese, "utf8");
    const english = readFileSync(pair.english, "utf8");
    const chineseSlug = frontmatterSlug(chinese);
    const englishSlug = frontmatterSlug(english);
    if (englishSlug !== chineseSlug) {
      const offset = Math.max(0, english.indexOf(`slug: ${englishSlug ?? ""}`));
      diagnostics.push(
        diagnostic(
          pair.english,
          english,
          offset,
          "frontmatter-slug",
          `English frontmatter slug ${englishSlug ?? "<missing>"} differs from Chinese ${
            chineseSlug ?? "<missing>"
          }`,
        ),
      );
    }

    const visible = maskProperNouns(maskMarkdownFences(english));
    for (const cjk of visible.matchAll(CJK)) {
      diagnostics.push(
        diagnostic(
          pair.english,
          english,
          cjk.index,
          "cjk",
          `Unapproved CJK text ${JSON.stringify(
            cjk[0],
          )}; use English or an exact data-i18n-allow-cjk marker`,
        ),
      );
    }

    const linkSource = maskMarkdownCode(english);
    for (const match of linkSource.matchAll(/\]\(\.\.\/(?:_mui\/)?([\w-]+?)(?:\/[\w-]+)?\.md\)/g)) {
      if (knownSlugs.has(match[1])) continue;
      diagnostics.push(
        diagnostic(
          pair.english,
          english,
          match.index,
          "broken-related",
          `Broken related-component slug ${match[1]}`,
        ),
      );
    }
  }

  if (!categories || categories.length === 0) {
    for (const directory of readdirSync(uiSrc)) {
      const path = join(uiSrc, directory);
      if (!statSync(path).isDirectory()) continue;
      const files = readdirSync(path);
      for (const file of files.filter((name) => name.endsWith(".en.md"))) {
        const chinese = join(path, file.replace(/\.en\.md$/, ".md"));
        if (!existsSync(chinese)) {
          diagnostics.push({
            path: join(path, file),
            line: 1,
            column: 1,
            code: "orphan-english",
            message: "English component document has no Chinese source",
          });
        }
      }
    }
  }

  return diagnostics.sort(
    (a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.column - b.column,
  );
}

export function formatDiagnostics(diagnostics, root = ROOT) {
  return diagnostics
    .map(
      (item) =>
        `${relative(root, item.path) || item.path}:${item.line}:${item.column} [${item.code}] ${
          item.message
        }`,
    )
    .join("\n");
}

function parseArguments(argv) {
  const normalized = argv.filter((value) => value !== "--");
  const all = normalized.includes("--all");
  const categoryFlag = normalized.find((value) => value.startsWith("--categories="));
  const unknown = normalized.filter(
    (value) => value !== "--all" && !value.startsWith("--categories="),
  );
  if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(", ")}`);
  if (all && categoryFlag) throw new Error("Use either --all or --categories, not both");
  if (!all && !categoryFlag) return undefined;
  return categoryFlag
    ? categoryFlag
        .slice("--categories=".length)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;
}

function main() {
  const categories = parseArguments(process.argv.slice(2));
  const diagnostics = checkComponentDocTranslations({ categories });
  if (diagnostics.length) {
    console.error(formatDiagnostics(diagnostics));
    console.error(`\n[docs:i18n] ${diagnostics.length} issue(s)`);
    process.exitCode = 1;
    return;
  }
  console.log("[docs:i18n] component Markdown coverage complete");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
