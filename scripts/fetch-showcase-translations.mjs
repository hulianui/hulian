import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-api";

export const CJK =
  /[\p{Script=Han}\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/u;

const TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const DEFAULT_INVENTORY = "/tmp/showcase-cjk-inventory.json";
const DEFAULT_OUTPUT = "apps/www/i18n/showcase-copy.en.json";
const DEFAULT_CACHE = "/tmp/hulian-showcase-translation-cache.json";
const DEFAULT_RAW_CACHE = "/tmp/hulian-showcase-translation-raw-cache.json";
const MARKER = /⟦HL(\d{6})⟧/gu;
const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_SHOWCASE_ROOT = join(REPO_ROOT, "packages/ui/src");
const MANUAL_COPY = new Map([
  [" 号店", " Store"],
  ["号店", "Store"],
  ["瑚琏 Hulian", "Hulian"],
  ["主题", "Theme"],
  ["操作", "Actions"],
  ["数量", "Quantity"],
  ["收藏", "Favorite"],
  ["可关闭", "Dismissible"],
  ["斜体", "Italic"],
  ["网格密度", "Grid density"],
  ["操作成功", "Action completed"],
  ["吸取式聚合", "Composable building blocks"],
  ["统一为一套瑚琏 API", "Unified behind a single Hulian API"],
  [
    "卡片不指定 bgColor / textColor 时吃瑚琏 token，自动随明暗主题。",
    "Without bgColor or textColor, the card uses Hulian tokens and adapts to the active theme.",
  ],
  [
    "默认吃瑚琏 chart token 渐变，自动适配明暗主题。",
    "Uses the Hulian chart-token gradient by default and adapts to the active theme.",
  ],
  ["企业级 · 高质量 · 原生适配", "Enterprise-grade · High quality · Native-ready"],
  ["default（深色底·默认参数）", "default (dark background · default settings)"],
  [
    "支持，明暗双主题 0 闪烁，SSR 注入变量先于绘制。",
    "Yes. Light and dark themes render without a flash because SSR injects variables before first paint.",
  ],
]);

// These are code-bearing fragments whose spelling is part of the public API. The
// visible Chinese around them is still translated. Keeping protection here (and
// testing it separately) avoids silently changing props, URLs or placeholders.
const PROTECTED_TOKEN = new RegExp(
  [
    String.raw`https?:\/\/[^\s"'<>()[\]，。！？；：、（）【】]+`,
    String.raw`mailto:[^\s"'<>]+`,
    String.raw`\$\{[^{}]+\}`,
    String.raw`\{\{[^{}]+\}\}`,
    String.raw`%[sdif]`,
    String.raw`@[a-zA-Z0-9_.~/-]+`,
    String.raw`--[a-zA-Z0-9_-]+`,
    String.raw`[A-Za-z_$][A-Za-z0-9_$]*(?:[./:#-][A-Za-z0-9_$@~-]+)*`,
  ].join("|"),
  "gu",
);

export function showcaseAstValues(sourceRoot = DEFAULT_SHOWCASE_ROOT) {
  const values = new Set();
  const files = readdirSync(sourceRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".showcase.tsx"))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const root = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (
        (ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node) ||
          ts.isTemplateHead(node) ||
          ts.isTemplateMiddle(node) ||
          ts.isTemplateTail(node) ||
          ts.isJsxText(node)) &&
        CJK.test(node.text)
      ) {
        for (const line of node.text.split(/\r?\n/u)) {
          if (!CJK.test(line)) continue;
          const key = line.trim().replace(/\s+/gu, " ");
          if (key) values.add(key);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(root);
  }
  return values;
}

export function inventoryValues(inventory, astValues = showcaseAstValues()) {
  const values = new Set();
  for (const kind of ["structured", "reactSource", "supportingSource"]) {
    const findings = inventory.findings?.[kind];
    if (!Array.isArray(findings)) continue;
    for (const finding of findings) {
      if (typeof finding?.value === "string" && CJK.test(finding.value)) values.add(finding.value);
    }
  }
  for (const value of astValues)
    if (typeof value === "string" && value.length > 0) values.add(value);
  return [...values].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function protectedTokens(value) {
  return [...value.matchAll(PROTECTED_TOKEN)]
    .map((match) => match[0])
    .filter((token) => !CJK.test(token));
}

export function protect(value) {
  const tokens = [];
  const text = value.replace(PROTECTED_TOKEN, (token) => {
    const id = `ZXQPH${String(tokens.length).padStart(4, "0")}QXZ`;
    tokens.push(token);
    return id;
  });
  return { text, tokens };
}

export function restore(value, tokens) {
  let restored = value;
  for (const [index, token] of tokens.entries()) {
    const marker = `ZXQPH${String(index).padStart(4, "0")}QXZ`;
    const occurrences = restored.split(marker).length - 1;
    if (occurrences !== 1) {
      throw new Error(`protected marker ${marker} occurred ${occurrences} times`);
    }
    restored = restored.replace(marker, token);
  }
  if (/ZXQPH\d{4}QXZ/u.test(restored)) throw new Error("translation returned an unknown marker");
  return restored;
}

function protectStable(value) {
  const markers = new Map();
  const text = value.replace(PROTECTED_TOKEN, (token) => {
    if (CJK.test(token)) return token;
    const marker = `ZXQS${Buffer.from(token).toString("base64url")}QXZ`;
    markers.set(marker, token);
    return marker;
  });
  return { text, markers };
}

function restoreStable(value, markers) {
  let restored = value;
  for (const [marker, token] of markers) {
    if (!restored.includes(marker)) {
      restored = `${restored} ${token}`;
      continue;
    }
    restored = restored.replaceAll(marker, token);
  }
  return restored;
}

function normalizeEnglish(value) {
  return value
    .replace(/Hu\s*Lian/giu, "Hulian")
    .replace(/Hulien/giu, "Hulian")
    .replace(/\bHulian\s+Hulian\b/giu, (text) =>
      text === text.toUpperCase() ? "HULIAN" : "Hulian",
    )
    .replace(/Hulian UI component library/giu, "Hulian component library")
    .replace(/(?:Absorption|Absorbent) polymerization design system/giu, "Composable design system")
    .replace(/Absorption polymerization/giu, "Composable building blocks")
    .replace(/documentation station/giu, "documentation site")
    .replace(/[“”]/gu, '"')
    .replace(/[‘’]/gu, "'")
    .replace(/，/gu, ", ")
    .replace(/。/gu, ".")
    .replace(/！/gu, "!")
    .replace(/？/gu, "?")
    .replace(/；/gu, "; ")
    .replace(/：/gu, ": ")
    .replace(/、/gu, ", ")
    .replace(/[（]/gu, "(")
    .replace(/[）]/gu, ")")
    .replace(/[【]/gu, "[")
    .replace(/[】]/gu, "]")
    .replace(/[《〈「『]/gu, '"')
    .replace(/[》〉」』]/gu, '"')
    .replace(/…/gu, "...")
    .replace(/\u3000/gu, " ")
    .replace(/ {2,}/gu, " ")
    .replace(/[ \t]+\n/gu, "\n")
    .trim();
}

function normalizeSourceEnglish(source, value) {
  let english = normalizeEnglish(value);
  if (source.includes("瑚琏")) {
    english = english
      .replace(/Hu\s+(?:Li|Jue)/giu, "Hulian")
      .replace(/\b(?:Hulu|Huli|corals?)\b/giu, "Hulian");
  }
  return english;
}

function preserveOuterWhitespace(source, english) {
  const leading = source.match(/^\s*/u)?.[0] ?? "";
  const trailing = source.match(/\s*$/u)?.[0] ?? "";
  return `${leading}${english.trim()}${trailing}`;
}

function restoreTokenSpellings(source, english) {
  let restored = english;
  for (const [token, expected] of new Map(
    protectedTokens(source).map((token) => [
      token,
      protectedTokens(source).filter((candidate) => candidate === token).length,
    ]),
  )) {
    const exactCount = restored.split(token).length - 1;
    if (exactCount >= expected) continue;
    if (token.length === 1) {
      restored = `${restored} ${Array.from({ length: expected - exactCount }, () => token).join(
        " ",
      )}`;
      continue;
    }
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const prefix = /^[A-Za-z0-9_$]/u.test(token) ? "(?<![A-Za-z0-9_$])" : "";
    const suffix = /[A-Za-z0-9_$]$/u.test(token) ? "(?![A-Za-z0-9_$])" : "";
    const candidate = new RegExp(`${prefix}${escaped}${suffix}`, "giu");
    if (candidate.test(restored)) restored = restored.replace(candidate, token);
    const missing = expected - (restored.split(token).length - 1);
    if (missing > 0)
      restored = `${restored} ${Array.from({ length: missing }, () => token).join(" ")}`;
  }
  return restored;
}

function batches(entries, maxCharacters = 2_800) {
  const result = [];
  let current = [];
  let length = 0;
  for (const entry of entries) {
    const lineLength = entry.text.length + 20;
    if (current.length > 0 && length + lineLength > maxCharacters) {
      result.push(current);
      current = [];
      length = 0;
    }
    current.push(entry);
    length += lineLength;
  }
  if (current.length > 0) result.push(current);
  return result;
}

function translatedText(payload) {
  if (!Array.isArray(payload?.[0])) throw new Error("unexpected translation response");
  return payload[0].map((part) => part?.[0] ?? "").join("");
}

export function parseBatchTranslation(text, entries) {
  const matches = [...text.matchAll(MARKER)];
  const translated = new Map();
  for (const [index, match] of matches.entries()) {
    const id = Number(match[1]);
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    if (translated.has(id)) throw new Error(`duplicate translation marker HL${match[1]}`);
    translated.set(id, text.slice(start, end).trim());
  }
  const expected = new Set(entries.map((entry) => entry.id));
  if (translated.size !== expected.size || [...translated.keys()].some((id) => !expected.has(id))) {
    throw new Error(
      `translation marker mismatch: expected ${expected.size}, received ${translated.size}`,
    );
  }
  return translated;
}

async function fetchWithRetry(batch, rawCache, persistRawCache, attempt = 1) {
  const query = batch
    .map((entry) => `⟦HL${String(entry.id).padStart(6, "0")}⟧ ${entry.text}`)
    .join("\n");
  const cacheKey = createHash("sha256").update(query).digest("hex");
  if (typeof rawCache[cacheKey] === "string") {
    return parseBatchTranslation(rawCache[cacheKey], batch);
  }
  const params = new URLSearchParams({ client: "gtx", sl: "zh-CN", tl: "en", dt: "t", q: query });
  try {
    const response = await fetch(`${TRANSLATE_ENDPOINT}?${params}`, {
      headers: { "user-agent": "Hulian-docs-offline-translation-builder/1.0" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = translatedText(await response.json());
    const parsed = parseBatchTranslation(text, batch);
    rawCache[cacheKey] = text;
    persistRawCache?.(rawCache);
    return parsed;
  } catch (error) {
    if (attempt >= 5) throw error;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500 * 2 ** (attempt - 1)));
    return fetchWithRetry(batch, rawCache, persistRawCache, attempt + 1);
  }
}

async function concurrentMap(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

export async function generateTranslations({
  inventory,
  existing = {},
  cache = {},
  rawCache = {},
  persistRawCache,
  onProgress,
}) {
  const sources = inventoryValues(inventory);
  const existingExact = existing.exact ?? existing;
  const cacheExact = cache.exact ?? cache;
  const result = {};
  const pending = [];
  for (const [id, source] of sources.entries()) {
    if (MANUAL_COPY.has(source)) {
      result[source] = MANUAL_COPY.get(source);
      continue;
    }
    const retained = existingExact[source] ?? cacheExact[source];
    if (typeof retained === "string" && retained.trim().length > 0 && !CJK.test(retained)) {
      result[source] = restoreTokenSpellings(source, normalizeSourceEnglish(source, retained));
      continue;
    }
    const secured = protect(source);
    pending.push({ id, source, ...secured });
  }

  async function translatePending(entries, phase) {
    const chunks = batches(entries);
    let completed = 0;
    const translations = await concurrentMap(chunks, 3, async (chunk) => {
      const translated = await fetchWithRetry(chunk, rawCache, persistRawCache);
      completed += 1;
      onProgress?.({ completed, total: chunks.length, strings: chunk.length, phase });
      return translated;
    });
    return new Map(translations.flatMap((translation) => [...translation]));
  }

  const byId = await translatePending(pending, "initial");
  const working = new Map();
  const markerFallback = [];
  for (const entry of pending) {
    const raw = byId.get(entry.id);
    if (raw === undefined)
      throw new Error(`missing translated value for ${JSON.stringify(entry.source)}`);
    if (raw.trim() === "") {
      markerFallback.push({
        id: entry.id,
        source: entry.source,
        text: entry.source.replace(/^(\s*)的/u, "$1"),
        tokens: [],
        stable: false,
      });
      continue;
    }
    try {
      working.set(entry.id, normalizeEnglish(restore(raw, entry.tokens)));
    } catch (error) {
      markerFallback.push({
        id: entry.id,
        source: entry.source,
        ...protectStable(entry.source),
        stable: true,
      });
    }
  }
  if (markerFallback.length > 0) {
    const translated = await translatePending(markerFallback, "marker-fallback");
    for (const entry of markerFallback) {
      const raw = translated.get(entry.id);
      working.set(
        entry.id,
        normalizeEnglish(entry.stable ? restoreStable(raw, entry.markers) : raw),
      );
    }
  }

  // The endpoint occasionally stops translating immediately after protected Markdown or
  // JSX. Translate only that residue again while protecting the English already produced.
  for (let pass = 1; pass <= 3; pass += 1) {
    const residue = pending
      .filter((entry) => CJK.test(working.get(entry.id) ?? ""))
      .map((entry) => ({
        id: entry.id,
        source: entry.source,
        text: working.get(entry.id),
        tokens: [],
      }));
    if (residue.length === 0) break;
    const translated = await translatePending(residue, `residue-${pass}`);
    for (const entry of residue) {
      working.set(entry.id, normalizeEnglish(translated.get(entry.id)));
    }
  }

  const fragments = [
    ...new Set(
      [...working.values()].flatMap((value) =>
        [...value.matchAll(/[\p{Script=Han}，。！？；：“”‘’（）【】《》〈〉「」『』…]+/gu)]
          .map((match) => match[0])
          .filter((fragment) => /\p{Script=Han}/u.test(fragment)),
      ),
    ),
  ].sort((a, b) => b.length - a.length);
  if (fragments.length > 0) {
    const entries = fragments.map((fragment, id) => ({ id, source: fragment, text: fragment }));
    const translated = await concurrentMap(entries, 3, async (entry, index) => {
      onProgress?.({
        completed: index + 1,
        total: entries.length,
        strings: 1,
        phase: "fragment-fallback",
      });
      return fetchWithRetry([entry], rawCache, persistRawCache);
    });
    const fragmentCopy = new Map(
      entries.map((entry, index) => [
        entry.source,
        normalizeEnglish(translated[index].get(entry.id)),
      ]),
    );
    for (const [id, value] of working) {
      let english = value;
      for (const [source, target] of fragmentCopy) english = english.replaceAll(source, target);
      working.set(id, normalizeEnglish(english));
    }
  }

  for (const entry of pending) {
    let english = preserveOuterWhitespace(
      entry.source,
      restoreTokenSpellings(
        entry.source,
        normalizeSourceEnglish(entry.source, working.get(entry.id)),
      ),
    );
    if ((!english || CJK.test(english)) && !/\p{Script=Han}/u.test(entry.source)) {
      english = preserveOuterWhitespace(entry.source, normalizeEnglish(entry.source));
    }
    if (!english.trim() || CJK.test(english)) {
      throw new Error(
        `invalid English for ${JSON.stringify(entry.source)}: ${JSON.stringify(english)}`,
      );
    }
    for (const token of protectedTokens(entry.source)) {
      if (!english.includes(token)) {
        throw new Error(
          `English lost protected token ${JSON.stringify(token)} for ${JSON.stringify(
            entry.source,
          )}: ${JSON.stringify(english)}`,
        );
      }
    }
    result[entry.source] = english;
  }
  return { exact: Object.fromEntries(sources.map((source) => [source, result[source]])) };
}

function readJsonIfPresent(file, fallback = {}) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function main() {
  const inventoryFile = resolve(process.argv[2] ?? DEFAULT_INVENTORY);
  const outputFile = resolve(process.argv[3] ?? DEFAULT_OUTPUT);
  const cacheFile = resolve(process.env.HULIAN_TRANSLATION_CACHE ?? DEFAULT_CACHE);
  const rawCacheFile = resolve(process.env.HULIAN_TRANSLATION_RAW_CACHE ?? DEFAULT_RAW_CACHE);
  const inventory = readJsonIfPresent(inventoryFile);
  const refresh = process.env.HULIAN_TRANSLATION_REFRESH === "1";
  const existing = refresh ? {} : readJsonIfPresent(outputFile);
  const cache = refresh ? {} : readJsonIfPresent(cacheFile);
  const rawCache = readJsonIfPresent(rawCacheFile);
  const copy = await generateTranslations({
    inventory,
    existing,
    cache,
    rawCache,
    persistRawCache: (next) => writeFileSync(rawCacheFile, `${JSON.stringify(next)}\n`),
    onProgress: ({ completed, total, phase }) =>
      console.log(`[showcase-copy] ${phase} batch ${completed}/${total}`),
  });
  const serialized = `${JSON.stringify(copy, null, 2)}\n`;
  writeFileSync(outputFile, serialized);
  writeFileSync(cacheFile, serialized);
  console.log(
    `[showcase-copy] wrote ${Object.keys(copy.exact).length} static translations to ${outputFile}`,
  );
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) await main();
