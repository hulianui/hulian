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

/** Hide fenced code while preserving offsets for path:line:column diagnostics. */
export function maskMarkdownFences(source) {
  const lines = source.match(/.*(?:\n|$)/g)?.filter(Boolean) ?? [];
  let fence = null;
  return lines
    .map((line) => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
      if (fence) {
        const closes = marker?.[0] === fence[0] && marker.length >= fence.length;
        if (closes) fence = null;
        return spacesPreservingNewlines(line);
      }
      if (marker) {
        fence = marker;
        return spacesPreservingNewlines(line);
      }
      return line;
    })
    .join("");
}

/** Hide fenced and inline code while preserving offsets for link diagnostics. */
export function maskMarkdownCode(source) {
  const lines =
    maskMarkdownFences(source)
      .match(/.*(?:\n|$)/g)
      ?.filter(Boolean) ?? [];
  return lines
    .map((line) => {
      let output = "";
      for (let index = 0; index < line.length; ) {
        if (line[index] !== "`") {
          output += line[index++];
          continue;
        }
        let endOfRun = index;
        while (line[endOfRun] === "`") endOfRun += 1;
        const delimiter = line.slice(index, endOfRun);
        const close = line.indexOf(delimiter, endOfRun);
        if (close < 0) {
          output += delimiter;
          index = endOfRun;
          continue;
        }
        const end = close + delimiter.length;
        output += spacesPreservingNewlines(line.slice(index, end));
        index = end;
      }
      return output;
    })
    .join("");
}

function maskProperNouns(source) {
  return source.replace(
    /<([A-Za-z][\w:-]*)\b[^>]*\bdata-i18n-allow-cjk(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>[\s\S]*?<\/\1\s*>/gi,
    spacesPreservingNewlines,
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

export function checkComponentDocTranslations({
  uiSrc = DEFAULT_UI_SRC,
  manifest,
  categories,
} = {}) {
  const allEntries = manifest ?? parseManifestEntries(readFileSync(DEFAULT_MANIFEST, "utf8"));
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
  const all = argv.includes("--all");
  const categoryFlag = argv.find((value) => value.startsWith("--categories="));
  const unknown = argv.filter((value) => value !== "--all" && !value.startsWith("--categories="));
  if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(", ")}`);
  if (all && categoryFlag) throw new Error("Use either --all or --categories, not both");
  if (!all && !categoryFlag) throw new Error("Pass --all or --categories=layout,forms");
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
