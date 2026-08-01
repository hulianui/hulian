#!/usr/bin/env node
// gen-llms-registry.mjs — assemble AI-first distribution artifacts from the
// per-component docs (packages/ui/src/<slug>/<slug>.md), written to apps/www/public/:
//
//   llms.txt        curated short index (component + one-liner, grouped by category)
//   llms-full.txt   self-contained full corpus (every enriched doc concatenated)
//   registry.json   machine-readable component catalog (name/import/exports/deps/doc)
//
// @hulianui/ui ships as an npm package (not shadcn-style source copy), so
// registry.json is a *catalog/index* for AI tooling & a future MCP server —
// it carries the import line + per-component npm deps (scanned from real
// source imports), not copy-paste file payloads.
//
// Uses the TypeScript compiler API to parse composite metadata. Run: node scripts/gen-llms-registry.mjs
// Re-run after enrichment; only `status: enriched` docs enter llms-full.txt.

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript-api";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_SRC = join(ROOT, "packages", "ui", "src");
const MANIFEST = join(ROOT, "apps", "www", "lib", "manifest.ts");
const PKG = JSON.parse(readFileSync(join(ROOT, "packages", "ui", "package.json"), "utf8"));
// 产物目录。默认写进仓库的 apps/www/public；HULIAN_REGISTRY_OUT 可改写到别处 ——
// 这是给「要一份带自定义 base 的 registry、但绝不能弄脏工作区」的场景用的
// （registry-pages-smoke 就是），配合 HULIAN_REGISTRY_BASE 一起用。
const OUT_DIR = process.env.HULIAN_REGISTRY_OUT || join(ROOT, "apps", "www", "public");

const REPO = "https://github.com/hulianui/hulian";
const DOC_BASE = `${REPO}/blob/master`; // + /packages/ui/src/<slug>/<slug>.md
const SITE = "https://hulianui.haloritual.com"; // 文档站；语料供站外 AI 消费，链接须绝对
// 把组件 md 里的相对链接转绝对，否则 AI 抓到 llms-full 后穿不透下一跳。
// 只处理 Markdown 正文：代码围栏和行内 code span 是示例数据，不是可导航链接；
// `//host/path` 是协议相对外链，也绝不能被误拼成本站 URL。
function backtickRun(markdown, index) {
  if (markdown[index] !== "`") return 0;
  let end = index;
  while (markdown[end] === "`") end += 1;
  return end - index;
}

function hasClosingBacktickRun(markdown, index, length) {
  for (let cursor = index; cursor < markdown.length; ) {
    const next = markdown.indexOf("`", cursor);
    if (next < 0) return false;
    const run = backtickRun(markdown, next);
    if (run === length) return true;
    cursor = next + run;
  }
  return false;
}

function rewriteOutsideCode(markdown, rewrite) {
  const lines = markdown.match(/.*(?:\n|$)/g)?.filter(Boolean) ?? [];
  let fence = null;
  let inlineTicks = 0;
  let globalOffset = 0;
  return lines
    .map((line) => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
      if (!inlineTicks && fence) {
        if (marker?.[0] === fence[0] && marker.length >= fence.length) fence = null;
        globalOffset += line.length;
        return line;
      }
      if (!inlineTicks && marker) {
        fence = marker;
        globalOffset += line.length;
        return line;
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
            output += line.slice(cursor);
            cursor = line.length;
            continue;
          }
          const end = close + inlineTicks;
          output += line.slice(cursor, end);
          cursor = end;
          inlineTicks = 0;
          continue;
        }

        const opening = line.indexOf("`", cursor);
        if (opening < 0) {
          output += rewrite(line.slice(cursor));
          cursor = line.length;
          continue;
        }
        const length = backtickRun(line, opening);
        const end = opening + length;
        if (!hasClosingBacktickRun(markdown, globalOffset + end, length)) {
          output += rewrite(line.slice(cursor, end));
          cursor = end;
          continue;
        }
        output += rewrite(line.slice(cursor, opening));
        output += line.slice(opening, end);
        cursor = end;
        inlineTicks = length;
      }
      globalOffset += line.length;
      return output;
    })
    .join("");
}

export const absolutize = (source) =>
  rewriteOutsideCode(source, (text) =>
    text
      .replace(/\]\(\.\.\/(?:_mui\/)?([\w-]+?)(?:\/[\w-]+)?\.md\)/g, `](${SITE}/components/$1)`)
      .replace(/\]\((\/(?!\/)[^)\s]+)\)/g, `](${SITE}$1)`),
  );
const TAGLINE = "颜值 + 好用的 React 设计系统（Base UI + Tailwind v4 + Motion）";

const PKG_DEPS = new Set([
  ...Object.keys(PKG.dependencies || {}),
  ...Object.keys(PKG.peerDependencies || {}),
]);
// universal framework peers — assumed everywhere, omitted from per-component deps to cut noise
const UNIVERSAL_PEERS = new Set(["react", "react-dom", "tailwindcss"]);

// 组件的对外入口未必是根 barrel：package.json 的 exports 里可以给某个目录单挂子路径。
// 这里从 exports 反推「目录 → 入口说明符」，而不是无条件拼根 barrel —— 0.15.0 之前日期族
// 挂在 ./date-pickers 上，而 registry 照根 barrel 拼 import，给出的是一条导不进来的路径。
// 当前没有任何子路径入口（这张表是空的），保留这段是为了下次再挂时不必重新想起这件事。
const SUBPATH_ENTRY = new Map();
for (const [key, value] of Object.entries(PKG.exports || {})) {
  if (key === "." || key.includes("*")) continue;
  const target = typeof value === "string" ? value : value?.default;
  const m = typeof target === "string" && target.match(/^\.\/src\/([^/]+)\/index\.ts$/);
  if (m) SUBPATH_ENTRY.set(m[1], PKG.name + key.slice(1));
}

// --------------------------------------------------------------- manifest --
// category order + labels only; component facts come from each .md frontmatter.

function parseCategories(src) {
  const cats = [];
  const block = src.slice(
    src.indexOf("export const CATEGORIES"),
    src.indexOf("export const manifest"),
  );
  const keys = [...src.matchAll(/^\s*\|\s*"([\w-]+)"/gm)].map((m) => m[1]);
  for (const key of keys) {
    const m = block.match(new RegExp(`key:\\s*"${key}",\\s*\\n\\s*label:\\s*"([^"]+)"`));
    if (m) cats.push({ key, label: m[1] });
  }
  return cats;
}

// ------------------------------------------------------------------- docs --

/**
 * frontmatter 的最小解析器。
 *
 * 为什么不能逐行 `^(\w+):\s*(.*)$`：数组值可以跨行 —— `exports:` 后面接一个换行的
 * `[ A, B, … ]` 块（prettier 会把长数组这么折），逐行读只会拿到 `[`，于是 exports 变空、
 * import 行退化成占位符「导入什么未知」。password-generator 就是这么把 19 个公开导出丢光的。
 * 这里按「值未闭合就继续吃下一行」处理，同时兼容 YAML 的 `- item` 列表写法。
 */
export function parseFrontmatter(block) {
  const fields = {};
  const lines = block.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const head = lines[index].match(/^(\w+):\s*(.*)$/);
    if (!head) continue;
    const key = head[1];
    let value = head[2].trim();
    if (value === "") {
      // `key:` 换行后可以跟 YAML 的 `- item` 列表，也可以跟一个折行的 `[ … ]`
      // （prettier 对长数组就是这么折的，password-generator 的 exports 正是这一形）。
      if (index + 1 < lines.length && /^\s*-\s+/.test(lines[index + 1])) {
        const items = [];
        while (index + 1 < lines.length && /^\s*-\s+/.test(lines[index + 1])) {
          items.push(lines[++index].replace(/^\s*-\s+/, "").trim());
        }
        fields[key] = `[${items.join(", ")}]`;
        continue;
      }
      if (index + 1 < lines.length && lines[index + 1].trim().startsWith("[")) {
        value = lines[++index].trim();
      }
    }
    if (value.startsWith("[")) {
      // 方括号数组：吃到方括号配平为止（值里不含引号/嵌套数组，计数即可）
      let depth = (value.match(/\[/g) || []).length - (value.match(/\]/g) || []).length;
      while (depth > 0 && index + 1 < lines.length) {
        const next = lines[++index];
        value += ` ${next.trim()}`;
        depth += (next.match(/\[/g) || []).length - (next.match(/\]/g) || []).length;
      }
      if (depth > 0) throw new Error(`frontmatter ${key} 的数组没有闭合`);
    }
    fields[key] = value.trim();
  }
  return fields;
}

const frontmatterList = (value) =>
  value && value.startsWith("[")
    ? value
        .slice(1, value.lastIndexOf("]"))
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

function parseDoc(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fm = parseFrontmatter(m[1]);
  return {
    slug: fm.slug,
    name: fm.name,
    category: fm.category || "uncatalogued",
    group: fm.group || "",
    tags: frontmatterList(fm.tags),
    exports: frontmatterList(fm.exports),
    status: fm.status || "scaffold",
    body: m[2].trim(),
  };
}

/**
 * 组件真正的公开导出，直接读 `src/<slug>/index.ts` 的 barrel。
 *
 * frontmatter 的 `exports:` 是人写的，只在 scaffold 时生成一次，之后组件加导出它不会跟着动 ——
 * 实测 theme 少了 useTheme、config 少了 zhCN/enUS、access 少了 AccessProvider/useAccess、
 * time-picker 少了 8 个纯函数。AI 按 catalog 搜 export 名时这些能力等于不存在。
 * 以 barrel 为真源后这类漂移不会再发生。
 *
 * 值与类型分开返回：import 行只拼值导出（那才是「怎么用这个组件」），
 * 类型另存 meta.types 供检索 —— 混在一起会让每条 import 行都拖着一串 XxxProps。
 */
export function barrelExports(dir) {
  const file = ["index.ts", "index.tsx"].map((name) => join(dir, name)).find((p) => existsSync(p));
  if (!file) return null;
  const sourceFile = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const values = [];
  const types = [];
  const push = (name, isType) => {
    const bucket = isType ? types : values;
    if (name && !bucket.includes(name)) bucket.push(name);
  };
  sourceFile.forEachChild((node) => {
    if (ts.isExportDeclaration(node)) {
      if (!node.exportClause || !ts.isNamedExports(node.exportClause)) return; // `export *` 无从枚举
      for (const element of node.exportClause.elements) {
        push(element.name.text, node.isTypeOnly || element.isTypeOnly);
      }
      return;
    }
    if (
      (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) &&
      node.name &&
      node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      push(node.name.text);
      return;
    }
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) push(declaration.name.text);
      }
      return;
    }
    if (
      (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
      node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      push(node.name.text, true);
    }
  });
  return values.length || types.length ? { values, types } : null;
}

/** find every component .md and its src dir (for dep scan + doc url). */
export function collectDocs(uiSrc = UI_SRC) {
  const out = [];
  const push = (mdPath, dir, urlRel) => {
    const parsed = parseDoc(readFileSync(mdPath, "utf8"));
    if (parsed && parsed.slug) out.push({ ...parsed, dir, docUrl: `${DOC_BASE}/${urlRel}` });
  };
  for (const d of readdirSync(uiSrc).sort()) {
    const p = join(uiSrc, d);
    if (!statSync(p).isDirectory()) continue;
    if (d === "_mui") {
      for (const f of readdirSync(p)) {
        if (f.endsWith(".md") && !f.endsWith(".en.md")) {
          const slug = f.replace(/\.md$/, "");
          push(join(p, f), p, `packages/ui/src/_mui/${f}`);
        }
      }
      continue;
    }
    const md = join(p, `${d}.md`);
    if (existsSync(md)) push(md, p, `packages/ui/src/${d}/${d}.md`);
  }
  return out;
}

/** per-component external npm deps, scanned from real imports in its source. */
function scanDeps(dir) {
  const deps = new Set();
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }
  for (const f of files) {
    if (!/\.(tsx?|ts)$/.test(f) || /\.(test|showcase)\.tsx?$/.test(f) || f.endsWith(".md"))
      continue;
    const src = readFileSync(join(dir, f), "utf8");
    for (const m of src.matchAll(/(?:from|import)\s+["']([^"'.][^"']*)["']/g)) {
      const spec = m[1];
      if (spec.startsWith("@hulianui")) continue;
      const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      if (PKG_DEPS.has(pkg) && !UNIVERSAL_PEERS.has(pkg)) deps.add(pkg);
    }
  }
  return [...deps].sort();
}

// ------------------------------------------------------ registry payloads --
//
// registry.json 此前只有目录元数据、没有 `files` —— 而 files 是 shadcn registry item
// 的**必填字段**，缺了它任何 shadcn 兼容工具（含 AI agent）一个都装不上。这里补齐，
// 并按「注入后能不能直接跑」分成三类：
//
//   registry:ui    组件。源码有内部相对 import（../lib/cn、../_icons…），注入时
//                  必须改写成目标项目里的路径，并把内部模块声明为 registryDependencies。
//   registry:lib   内部共享模块（lib / _icons / motion）。组件的依赖底座。
//   registry:block 区块 & 页面。区块只从 "@hulianui/ui" 根 barrel 导入；页面会声明
//                  它组合的区块并改写安装路径。这是「AI 搭积木」最有价值的粒度。

/** 注入到消费方项目里的落点前缀。shadcn 的 `@/` 别名由消费方 components.json 决定。 */
const TARGET_ROOT = "components/hulianui";

/**
 * 单件安装端点的基址。可用 HULIAN_REGISTRY_BASE 覆盖，便于起本地 server 做端到端验证
 * （registryDependencies 内联的是绝对 URL，不覆盖就会指回线上域名）。
 */
const REGISTRY_BASE = process.env.HULIAN_REGISTRY_BASE || `${SITE}/r`;

/** 组件目录里真正要发出去的文件（排掉测试 / showcase / 文档）。 */
function payloadFiles(dir) {
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }
  return files
    .filter((f) => /\.(tsx?)$/.test(f) && !/\.(test|browser\.test|showcase)\.tsx?$/.test(f))
    .sort();
}

/**
 * 把组件源码里的**上级相对 import** 改写成消费方项目里的绝对别名。
 * 同级 `./x` 保持不变 —— 同目录文件是一起注入的。
 *   `from "../lib/cn"`  → `from "@/components/hulianui/lib/cn"`
 *   `from "../_icons"`  → `from "@/components/hulianui/_icons"`
 */
function rewriteImports(code) {
  return code.replace(
    /((?:from|import)\s+["'])\.\.\/([^"']+)(["'])/g,
    (_, head, rest, tail) => `${head}@/${TARGET_ROOT}/${rest}${tail}`,
  );
}

/**
 * 组件依赖的**库内部**模块（`../X` 里的 X），即它的 registryDependencies。
 *
 * 必须输出**完整 URL**：shadcn CLI 把裸名（"button"）解析到**官方 shadcn registry**，
 * 写 "_icons" 只会让它去 ui.shadcn.com 找一个不存在的东西然后失败。
 */
function scanInternalDeps(dir, selfSlug) {
  const deps = new Set();
  for (const f of payloadFiles(dir)) {
    const src = readFileSync(join(dir, f), "utf8");
    for (const m of src.matchAll(/(?:from|import)\s+["']\.\.\/([^"']+)["']/g)) {
      const top = m[1].split("/")[0];
      if (top && top !== selfSlug) deps.add(top);
    }
  }
  return [...deps].sort().map((n) => `${REGISTRY_BASE}/${n}.json`);
}

/** registry item 的 files[]，content 内联真实源码（远程安装必须内联，路径没用）。 */
function buildFiles(dir, slug, { rewrite = true, type = "registry:ui" } = {}) {
  return payloadFiles(dir).map((f) => {
    const raw = readFileSync(join(dir, f), "utf8");
    return {
      path: `${TARGET_ROOT}/${slug}/${f}`,
      type,
      target: `${TARGET_ROOT}/${slug}/${f}`,
      content: rewrite ? rewriteImports(raw) : raw,
    };
  });
}

const INSTALLATION_REPLACE_VALUES = new Set([
  "assets",
  "copy",
  "event-handlers",
  "mock-data",
  "navigation",
]);

function objectProperty(object, name, context) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      ((ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
        (ts.isStringLiteralLike(candidate.name) && candidate.name.text === name)),
  );
  if (!property) throw new Error(`${context} missing required ${name}`);
  return property.initializer;
}

function stringValue(node, context) {
  if (!ts.isStringLiteralLike(node)) throw new Error(`${context} must be a string literal`);
  return node.text;
}

function stringArray(node, context) {
  if (!ts.isArrayLiteralExpression(node))
    throw new Error(`${context} must be a string array literal`);
  return node.elements.map((element, index) => stringValue(element, `${context}[${index}]`));
}

function installationValue(node, context) {
  if (!ts.isObjectLiteralExpression(node)) throw new Error(`${context} must be an object literal`);
  const providers = stringArray(objectProperty(node, "providers", context), `${context}.providers`);
  const replace = stringArray(objectProperty(node, "replace", context), `${context}.replace`);
  const slots = stringArray(objectProperty(node, "slots", context), `${context}.slots`);
  const unknown = replace.find((value) => !INSTALLATION_REPLACE_VALUES.has(value));
  if (unknown) throw new Error(`${context}.replace contains unknown value ${unknown}`);
  return { providers, replace, slots };
}

/** 从 app/{blocks,pages}/_meta.ts 的真实 TypeScript object literals 提取条目。 */
function parseMeta(file) {
  if (!existsSync(file)) return [];
  const src = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if (sourceFile.parseDiagnostics.length > 0) {
    const diagnostic = sourceFile.parseDiagnostics[0];
    throw new Error(
      `${file} parse failed: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`,
    );
  }
  let array;
  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        (declaration.name.text === "blocks" || declaration.name.text === "pages") &&
        declaration.initializer &&
        ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        array = declaration.initializer;
      }
    }
  });
  if (!array) throw new Error(`${file} missing blocks/pages array literal`);
  return array.elements.map((element, index) => {
    const context = `${basename(file)} entry ${index + 1}`;
    if (!ts.isObjectLiteralExpression(element))
      throw new Error(`${context} must be an object literal`);
    const slug = stringValue(objectProperty(element, "slug", context), `${context}.slug`);
    return {
      slug,
      name: stringValue(objectProperty(element, "name", slug), `${slug}.name`),
      description: stringValue(objectProperty(element, "description", slug), `${slug}.description`),
      category: stringValue(objectProperty(element, "category", slug), `${slug}.category`),
      tags: stringArray(objectProperty(element, "tags", slug), `${slug}.tags`),
      file: stringValue(objectProperty(element, "file", slug), `${slug}.file`),
      installation: installationValue(
        objectProperty(element, "installation", slug),
        `${slug}.installation`,
      ),
    };
  });
}

/** 页面注入目标项目后与 blocks 同级，源码中的仓库内路径需要改写为安装后的路径。 */
export function rewritePageBlockImports(code) {
  return code.replace(
    /((?:from|import)\s+["'])\.\.\/\.\.\/blocks\/_blocks\/([\w-]+)(["'])/g,
    "$1../blocks/$2$3",
  );
}

/** 从仓库内页面源码提取它安装时必须先注入的区块 registry item。 */
export function scanPageBlockDeps(code) {
  const deps = new Set();
  for (const match of code.matchAll(
    /(?:from|import)\s+["']\.\.\/\.\.\/blocks\/_blocks\/([\w-]+)["']/g,
  )) {
    deps.add(`block-${match[1]}`);
  }
  return [...deps].sort();
}

/** 区块 / 页面 → registry item。 */
export function buildCompositeItems(metaFile, srcDir, kind) {
  const metas = parseMeta(metaFile);
  const items = [];
  for (const meta of metas) {
    const abs = join(srcDir, meta.file);
    if (!existsSync(abs)) continue;
    const source = readFileSync(abs, "utf8");
    const pageBlockDeps = kind === "page" ? scanPageBlockDeps(source) : [];
    if (kind === "page") {
      const relativeImports = [
        ...source.matchAll(/(?:from|import)\s+["'](\.{1,2}\/[^"']+)["']/g),
      ].map((match) => match[1]);
      const unresolved = relativeImports.filter(
        (specifier) => !/^\.\.\/\.\.\/blocks\/_blocks\/[\w-]+$/.test(specifier),
      );
      if (unresolved.length > 0) {
        throw new Error(
          `${meta.file} 包含无法随 registry 安装的相对依赖: ${unresolved.join(", ")}`,
        );
      }
      const dependencySlots = pageBlockDeps.map((name) => name.replace(/^block-/, "")).sort();
      const declaredSlots = [...meta.installation.slots].sort();
      if (JSON.stringify(dependencySlots) !== JSON.stringify(declaredSlots)) {
        throw new Error(
          `${meta.file} installation.slots 与源码区块依赖不一致: expected ${
            dependencySlots.join(", ") || "[]"
          }; received ${declaredSlots.join(", ") || "[]"}`,
        );
      }
    }
    const content = kind === "page" ? rewritePageBlockImports(source) : source;
    const deps = new Set();
    for (const m of content.matchAll(/(?:from|import)\s+["']([^"'.][^"']*)["']/g)) {
      const spec = m[1];
      const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      if (!UNIVERSAL_PEERS.has(pkg)) deps.add(pkg);
    }
    items.push({
      name: `${kind}-${meta.slug}`,
      type: "registry:block",
      title: meta.name,
      description: meta.description,
      categories: [meta.category],
      dependencies: [...deps].sort(),
      registryDependencies: pageBlockDeps.map((name) => `${REGISTRY_BASE}/${name}.json`),
      files: [
        {
          path: `${TARGET_ROOT}/${kind}s/${meta.file}`,
          type: "registry:block",
          target: `${TARGET_ROOT}/${kind}s/${meta.file}`,
          content,
        },
      ],
      meta: {
        kind,
        selfContained: pageBlockDeps.length === 0,
        installation: meta.installation,
        source: `apps/www/app/${kind}s/_${kind}s/${meta.file}`,
      },
    });
  }
  return items;
}

/** 语义 token 作为 cssVars 一并下发，否则注入的组件在消费方那里没有颜色。 */
function buildCssVars() {
  const read = (f) => {
    const p = join(ROOT, "packages", "tokens", "src", f);
    return existsSync(p) ? readFileSync(p, "utf8") : "";
  };
  const pick = (css, block) => {
    const re = new RegExp(`${block}\\s*\\{([\\s\\S]*?)\\n\\}`);
    const m = css.match(re);
    if (!m) return {};
    const out = {};
    for (const v of m[1].matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) out[v[1].slice(2)] = v[2].trim();
    return out;
  };
  const semantic = read("semantic.css");
  return {
    light: pick(semantic, ":root"),
    dark: pick(semantic, '\\[data-theme="dark"\\]'),
  };
}

// ----------------------------------------------------------------- render --

const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** the "> blurb" line of a doc body, minus the trailing " · category/group" tail. */
function blurb(doc) {
  const m = doc.body.match(/^>\s*(.+)$/m);
  let s = m ? m[1] : doc.name;
  s = s.replace(/\s*·\s*[\w-]+\/[\w-]*\s*(·\s*MUI 桥)?\s*$/, "").trim();
  return truncate(s, 110);
}

function main() {
  const cats = parseCategories(readFileSync(MANIFEST, "utf8"));
  const catLabel = new Map(cats.map((c) => [c.key, c.label]));
  const catOrder = new Map(cats.map((c, i) => [c.key, i]));
  catOrder.set("uncatalogued", 999);

  const docs = collectDocs();
  docs.sort(
    (a, b) =>
      (catOrder.get(a.category) ?? 998) - (catOrder.get(b.category) ?? 998) ||
      a.name.localeCompare(b.name),
  );
  const enriched = docs.filter((d) => d.status === "enriched");
  const scaffold = docs.filter((d) => d.status !== "enriched");

  const byCat = new Map();
  for (const d of docs) {
    if (!byCat.has(d.category)) byCat.set(d.category, []);
    byCat.get(d.category).push(d);
  }
  const orderedCats = [...byCat.keys()].sort(
    (a, b) => (catOrder.get(a) ?? 998) - (catOrder.get(b) ?? 998),
  );

  // ---- llms.txt -----------------------------------------------------------
  const idx = [];
  idx.push(`# 瑚琏 Hulian (\`${PKG.name}\`)`);
  idx.push("");
  idx.push(`> ${TAGLINE} · ${docs.length} 个组件 · v${PKG.version}`);
  idx.push("");
  idx.push(
    "AI agent 索引。完整逐组件用法见 [llms-full.txt](./llms-full.txt)（自包含）或各组件源码旁 `<slug>.md`。",
  );
  idx.push(
    '安装 `npm i @hulianui/ui`，默认从根 barrel 导入：`import { X } from "@hulianui/ui"`；' +
      "只用少数几个组件时可改子路径 `@hulianui/ui/<slug>`（见 docs/consuming.md §3）。",
  );
  idx.push("铁律：业务里 100% 用库组件，禁止 style=/局部 CSS 覆盖；缺组件回库加。");
  idx.push("");
  for (const cat of orderedCats) {
    const list = byCat.get(cat);
    idx.push(`## ${catLabel.get(cat) ?? cat} ${cat}（${list.length}）`);
    for (const d of list) idx.push(`- [${d.name}](${d.docUrl}): ${blurb(d)}`);
    idx.push("");
  }
  writeFileSync(join(OUT_DIR, "llms.txt"), idx.join("\n"));

  // ---- llms-full.txt ------------------------------------------------------
  const full = [];
  full.push(`# 瑚琏 Hulian (\`${PKG.name}\`) — 全量组件使用文档`);
  full.push("");
  full.push(
    `> ${TAGLINE} · v${PKG.version} · ${enriched.length} 个组件文档（自包含，供 AI 一次性消费）`,
  );
  full.push("");
  full.push(
    '安装 `npm i @hulianui/ui @hulianui/tokens`（tokens 提供主题 CSS，必装）；默认从根 barrel 导入 `import { X } from "@hulianui/ui"`，' +
      "每个组件也有同名子路径入口 `@hulianui/ui/<slug>`，只用少数几个组件时用它可少拉几百个文件。",
  );
  full.push("");
  for (const cat of orderedCats) {
    const list = byCat.get(cat).filter((d) => d.status === "enriched");
    if (!list.length) continue;
    full.push(`\n# ━━━━━━━━ ${catLabel.get(cat) ?? cat} ━━━━━━━━\n`);
    for (const d of list) {
      full.push("<!-- ════════════════════════════════════════════════════════ -->");
      full.push(absolutize(d.body));
      full.push("");
    }
  }
  writeFileSync(join(OUT_DIR, "llms-full.txt"), full.join("\n"));

  // ---- registry.json + /r/<name>.json --------------------------------------
  const cssVars = buildCssVars();

  // 内部共享模块：组件的依赖底座，必须能被单独装，否则注入的组件 import 断链。
  const INTERNAL_MODULES = ["lib", "_icons", "motion"];
  const libItems = INTERNAL_MODULES.filter((m) => existsSync(join(UI_SRC, m))).map((m) => ({
    name: m,
    type: "registry:lib",
    title: m,
    description: `瑚琏内部共享模块 ${m}（组件注入后的依赖底座）`,
    dependencies: scanDeps(join(UI_SRC, m)),
    registryDependencies: scanInternalDeps(join(UI_SRC, m), m),
    files: buildFiles(join(UI_SRC, m), m, { type: "registry:lib" }),
  }));

  const uiItems = docs.map((d) => {
    // 入口按组件所在目录取（见 SUBPATH_ENTRY）：日期族在 `_mui/`，对外走 ./date-pickers 子路径，
    // 拼成根 barrel 就是给 AI 和人一条导不进来的 import。
    const entry = SUBPATH_ENTRY.get(basename(d.dir)) || PKG.name;
    // barrel 优先、frontmatter 兜底：前者是编译器认的真源，后者只在没有 index.ts 时才用得上。
    const barrel = barrelExports(d.dir) ?? {
      values: d.exports.filter((name) => !name.startsWith("type ")),
      types: d.exports.filter((name) => name.startsWith("type ")).map((name) => name.slice(5)),
    };
    const exported = barrel.values;
    const imp = exported.length
      ? `import { ${exported.join(", ")} } from "${entry}"`
      : `import { /* ? */ } from "${entry}"`;
    return {
      name: d.slug,
      type: "registry:ui",
      title: d.name,
      description: blurb(d),
      categories: [d.category],
      dependencies: scanDeps(d.dir),
      registryDependencies: scanInternalDeps(d.dir, d.slug),
      files: buildFiles(d.dir, d.slug),
      meta: {
        import: imp,
        exports: exported,
        // 类型导出不进 import 行，但要能被按名检索到（AI 常拿 ProTableProps 反查组件）
        types: barrel.types,
        group: d.group,
        tags: d.tags,
        animated: d.tags.includes("animated"),
        webgl: d.tags.includes("webgl"),
        doc: d.docUrl,
        docLocal: d.docUrl.replace(`${DOC_BASE}/`, ""),
        status: d.status,
        // 推荐用法仍是 npm import；注入源码是「想改这个组件」时才走的路。
        preferred: "npm",
      },
    };
  });

  const WWW_APP = join(ROOT, "apps", "www", "app");
  const blockItems = buildCompositeItems(
    join(WWW_APP, "blocks", "_meta.ts"),
    join(WWW_APP, "blocks", "_blocks"),
    "block",
  );
  const pageItems = buildCompositeItems(
    join(WWW_APP, "pages", "_meta.ts"),
    join(WWW_APP, "pages", "_pages"),
    "page",
  );

  const items = [...uiItems, ...libItems, ...blockItems, ...pageItems];

  // 门禁：registry 里不许出现导不进来的 import。这条占位符曾经安静地发到线上，
  // AI 拿到的就是一行「从这里导入什么我也不知道」——比没有元数据更糟。
  const unresolved = items.filter((item) => item.meta?.import?.includes("/* ? */"));
  if (unresolved.length > 0) {
    throw new Error(
      `registry 中有 ${unresolved.length} 条无法解析的 import：${unresolved
        .map((item) => item.name)
        .join(", ")}。检查 src/<slug>/index.ts 是否有具名导出，或文档 frontmatter 的 exports。`,
    );
  }

  // 根索引：目录用途，剥掉 files 的 content（否则单文件几十 MB，AI 拉一次就爆 context）
  const index = items.map(({ files, ...rest }) => ({
    ...rest,
    files: (files ?? []).map(({ content: _c, ...f }) => f),
  }));

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "hulianui",
    homepage: REPO,
    version: PKG.version,
    description: TAGLINE,
    install: `npm i ${PKG.name}`,
    import: `import { /* components */ } from "${PKG.name}"`,
    // 单件安装端点。AI / shadcn CLI 按此模板取具体 item。
    itemUrl: `${REGISTRY_BASE}/{name}.json`,
    items: index,
  };
  writeFileSync(join(OUT_DIR, "registry.json"), JSON.stringify(registry, null, 2));

  // 逐件文档端点 /d/<slug>.md —— MCP server 与任何 AI 都能按需取单个组件的用法，
  // 不必整吞 1.1M 的 llms-full.txt（那正是「猜签名」的根源：读不起就只能猜）。
  const D_DIR = join(OUT_DIR, "d");
  if (!existsSync(D_DIR)) mkdirSync(D_DIR, { recursive: true });
  for (const d of docs) writeFileSync(join(D_DIR, `${d.slug}.md`), absolutize(d.body));

  // 每个 item 一个可直接 `npx shadcn add <url>` 的端点
  const R_DIR = join(OUT_DIR, "r");
  if (!existsSync(R_DIR)) mkdirSync(R_DIR, { recursive: true });
  for (const it of items) {
    const payload = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      ...it,
      ...(it.type === "registry:ui" || it.type === "registry:lib" ? { cssVars } : {}),
    };
    writeFileSync(join(R_DIR, `${it.name}.json`), JSON.stringify(payload, null, 2));
  }

  console.log(
    `[llms-registry] llms.txt(${docs.length}) · llms-full.txt(${enriched.length} enriched) · ` +
      `registry.json(${items.length} = ui ${uiItems.length} + lib ${libItems.length} + block ${blockItems.length} + page ${pageItems.length}) · ` +
      `r/*.json(${items.length})` +
      (scaffold.length
        ? ` · ⚠ ${scaffold.length} 个仍 scaffold 未入 full: ${scaffold
            .slice(0, 8)
            .map((d) => d.slug)
            .join(",")}${scaffold.length > 8 ? "…" : ""}`
        : ""),
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  main();
}
