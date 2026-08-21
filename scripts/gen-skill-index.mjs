#!/usr/bin/env node
// gen-skill-index.mjs — generate ~/.claude/skills/hulianui-index/SKILL.md
//
// Sources of truth (read-only):
//   1. apps/www/lib/manifest.ts  -> slug / name / description / category / group / tags
//   2. packages/ui/src/<slug>/   -> value exports (index.ts) + key props (<slug>.types.ts)
//      (MUI-bridge components live in packages/ui/src/_mui/<slug>.*)
//
// Zero dependencies. Run: node scripts/gen-skill-index.mjs
// Auto-runs from .git/hooks/post-commit when ui src / manifest changed
// (see scripts/install-hooks.sh).

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_SRC = join(ROOT, "packages", "ui", "src");
const MANIFEST = join(ROOT, "apps", "www", "lib", "manifest.ts");
const OUT = join(homedir(), ".claude", "skills", "hulianui-index", "SKILL.md");

const MAX_PROPS = 10;
const MAX_DESC = 72; // chars; manifest descriptions can run very long

// ---------------------------------------------------------------- manifest --

function parseManifest(src) {
  // CATEGORIES: capture order + labels.
  const categories = []; // { key, label }
  const catBlock = src.slice(src.indexOf("export const CATEGORIES"), src.indexOf("export const manifest"));
  // top-level category objects have `key: "...",` followed (possibly later) by `label: "...",`
  // and a CategoryKey from the union; groups also have key/label, so anchor on known keys.
  const catKeys = [...src.matchAll(/^\s*\|\s*"([\w-]+)"/gm)].map((m) => m[1]);
  for (const key of catKeys) {
    const m = catBlock.match(new RegExp(`key:\\s*"${key}",\\s*\\n\\s*label:\\s*"([^"]+)"`));
    if (m) categories.push({ key, label: m[1] });
  }
  // group labels: key -> label (shared namespace is fine for display purposes)
  const groupLabels = {};
  for (const m of catBlock.matchAll(/\{\s*key:\s*"([\w-]+)",\s*label:\s*"([^"]+)"\s*\}/g)) {
    groupLabels[m[1]] = m[2];
  }

  // manifest entries are single-line object literals.
  const entries = [];
  for (const m of src.matchAll(/\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",(?:\s*shortName:\s*"(?:[^"\\]|\\.)*",)?\s*description:\s*"((?:[^"\\]|\\.)*)",\s*category:\s*"([^"]+)",\s*group:\s*"([^"]+)",(?:\s*tags:\s*\[([^\]]*)\],)?\s*status:\s*"[^"]+"\s*,?\s*\}/g)) {
    entries.push({
      slug: m[1],
      name: m[2],
      description: m[3].replace(/\\"/g, '"'),
      category: m[4],
      group: m[5],
      tags: m[6] ? [...m[6].matchAll(/"([^"]+)"/g)].map((t) => t[1]) : [],
    });
  }
  return { categories, groupLabels, entries };
}

// ------------------------------------------------------------------ source --

/** Value exports from an index barrel: `export { A, B } from "./x"`. */
function parseValueExports(indexSrc) {
  const out = [];
  for (const m of indexSrc.matchAll(/export\s*\{([^}]+)\}/g)) {
    if (/export\s+type\s*\{/.test(m[0])) continue;
    for (const raw of m[1].split(",")) {
      const name = raw.trim().split(/\s+as\s+/).pop().trim();
      if (name && !out.includes(name)) out.push(name);
    }
  }
  return out;
}

/** Direct exports from a component file: `export function X` / `export const X`. */
function parseDirectExports(src) {
  const out = [];
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+([A-Za-z_$][\w$]*)/g)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

const pascal = (slug) => slug.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");

/** Top-level field names of the main `<Pascal>Props` interface (fallback: first *Props). */
function parseProps(typesSrc, slug) {
  const wanted = `${pascal(slug)}Props`;
  let m = typesSrc.match(new RegExp(`export interface ${wanted}[^{]*\\{`));
  if (!m) m = typesSrc.match(/export interface (\w*Props)[^{]*\{/);
  if (!m) return [];
  const start = m.index + m[0].length;
  const props = [];
  let depth = 1;
  let total = 0;
  const lines = typesSrc.slice(start).split("\n");
  for (const line of lines) {
    if (depth === 1) {
      const f = line.match(/^\s*(?:readonly\s+)?["']?([\w$]+)["']?\s*\??\s*[:(]/);
      if (f && !["constructor"].includes(f[1])) {
        total += 1;
        if (props.length < MAX_PROPS) props.push(f[1]);
      }
    }
    for (const ch of line) {
      if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    if (depth === 0) break;
  }
  if (total > props.length) props.push("…");
  return props;
}

/** File-header JSDoc summary (only if it appears before the first export — prop docs don't count). */
function firstJsdocLine(src) {
  const m = src.match(/\/\*\*\s*\n?\s*\*?\s*([^\n*@]{4,})/);
  if (!m) return "";
  const firstExport = src.search(/^export /m);
  return firstExport !== -1 && m.index > firstExport ? "" : m[1].trim();
}

function readIfExists(p) {
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

/** Resolve a manifest slug to { exports, props, typesPath }. */
function resolveComponent(slug) {
  const dir = join(UI_SRC, slug);
  if (existsSync(dir) && statSync(dir).isDirectory()) {
    const indexSrc = readIfExists(join(dir, "index.ts")) || readIfExists(join(dir, "index.tsx"));
    let exports = parseValueExports(indexSrc);
    if (!exports.length) {
      for (const f of readdirSync(dir)) {
        if (/\.(test|showcase|types)\.tsx?$/.test(f) || !/\.tsx?$/.test(f)) continue;
        exports = exports.concat(parseDirectExports(readFileSync(join(dir, f), "utf8")));
      }
      exports = [...new Set(exports)];
    }
    const typesRel = `${slug}/${slug}.types.ts`;
    const typesSrc = readIfExists(join(UI_SRC, typesRel));
    return { exports, props: parseProps(typesSrc, slug), typesRel: typesSrc ? typesRel : null };
  }
  // _mui flat layout: src/_mui/<slug>.tsx + <slug>.types.ts
  const muiTsx = join(UI_SRC, "_mui", `${slug}.tsx`);
  if (existsSync(muiTsx)) {
    const typesRel = `_mui/${slug}.types.ts`;
    const typesSrc = readIfExists(join(UI_SRC, typesRel));
    return {
      exports: parseDirectExports(readFileSync(muiTsx, "utf8")),
      props: parseProps(typesSrc, slug),
      typesRel: typesSrc ? typesRel : null,
    };
  }
  return { exports: [], props: [], typesRel: null };
}

// ------------------------------------------------------------------ render --

const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function renderLine(entry, comp) {
  const bits = [`- **${entry.name}** \`${entry.slug}\``];
  if (comp.typesRel?.startsWith("_mui/")) bits.push("(_mui)");
  if (comp.exports.length) bits.push(`→ ${comp.exports.join(", ")}`);
  if (comp.props.length) bits.push(`| props: ${comp.props.join(", ")}`);
  if (entry.tags?.length) bits.push(`| #${entry.tags.join(" #")}`);
  bits.push(`— ${truncate(entry.description, MAX_DESC)}`);
  return bits.join(" ");
}

function main() {
  const { categories, groupLabels, entries } = parseManifest(readFileSync(MANIFEST, "utf8"));
  if (entries.length < 100) throw new Error(`manifest parse suspiciously small: ${entries.length} entries`);

  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const resolved = new Map(entries.map((e) => [e.slug, resolveComponent(e.slug)]));

  // src dirs that are real components but missing from manifest
  const SKIP_DIRS = new Set(["_icons", "_mui", "lib", "motion", "showcase"]);
  const uncatalogued = [];
  for (const d of readdirSync(UI_SRC).sort()) {
    const p = join(UI_SRC, d);
    if (!statSync(p).isDirectory() || SKIP_DIRS.has(d) || bySlug.has(d)) continue;
    const comp = resolveComponent(d);
    if (!comp.exports.length) continue;
    const mainFile = readIfExists(join(p, `${d}.tsx`)) || readIfExists(join(p, `${d}-provider.tsx`));
    uncatalogued.push({
      entry: { slug: d, name: pascal(d), description: firstJsdocLine(mainFile) || `${pascal(d)} (not yet in docs manifest)`, tags: [] },
      comp,
    });
  }

  const lines = [];
  lines.push("---");
  lines.push("name: hulianui-index");
  lines.push(
    'description: "Use when building UI with @hulianui/ui — component catalog with exports/key props. This index is for discovery; ALWAYS read the component\'s <slug>.md usage doc (full props/examples/pitfalls) before use, falling back to .types.ts for exact signatures"',
  );
  lines.push("---");
  lines.push("");
  lines.push("# @hulianui/ui 组件索引");
  lines.push("");
  lines.push("> 自动生成，勿手改。再生成：hulian 仓 `pnpm run skill-index`（post-commit hook 在 ui 源码变更后自动跑）。");
  lines.push(`> 源：packages/ui/src（${entries.length + uncatalogued.length} 组件）+ apps/www/lib/manifest.ts（分类/描述 SSOT）。`);
  lines.push("");
  lines.push("## 使用守则（铁律）");
  lines.push("");
  lines.push("1. **100% 库组件**：admin/业务界面只用 @hulianui/ui，禁止 style=/局部 CSS 覆盖库组件。");
  lines.push("2. **缺了回库加**：组件缺失/不够用 → 去 `/Users/zhangzhiwei/Desktop/code/hulian/packages/ui/src/` 新增或扩展，不在业务仓造轮子。");
  lines.push("3. **用前必读用法**：本索引只管「找到组件」，props 列仅前 " + MAX_PROPS + " 个字段名。定位到组件后 **必须先 Read 它的使用文档 `<slug>.md`**（完整 props 表 + 示例 + 禁忌坑 + 相关组件），就在组件源码旁：");
  lines.push("   - 常规：`/Users/zhangzhiwei/Desktop/code/hulian/packages/ui/src/<slug>/<slug>.md`（精确签名仍以同目录 `<slug>.types.ts` 为准）");
  lines.push("   - 标注 (_mui) 的：`/Users/zhangzhiwei/Desktop/code/hulian/packages/ui/src/_mui/<slug>.md`");
  lines.push("   - 全量离线语料（一次喂全库）：`apps/www/public/llms-full.txt`；机读目录 `llms.txt` / 组件清单 `registry.json`。");
  lines.push(
    "4. **导入优先走子路径**：`import { X } from \"@hulianui/ui/<slug>\"`（0.14.0 起，slug 即组件目录名 / 本索引里的条目名）。" +
      "根 barrel `import { X } from \"@hulianui/ui\"` 仍然可用，但本库是**源码分发**，barrel 会把整棵 `src/`（700+ tsx）" +
      "连同全部 26 个 dependencies 拖进消费方模块图 —— 即使一个都没用到（hulianui/hulian#19）。" +
      "**Next.js 消费方额外注意**：`transpilePackages` 是本库的强制项，而它恰恰把整棵源码放回 loader 路径，" +
      "叠加 dev 模式不 tree-shake，是所有链路里最糟的一档；跑 **webpack dev**（Next 15 及以下）时务必同时配 " +
      "`experimental: { optimizePackageImports: [\"@hulianui/ui\"] }`，它在编译期把 barrel 导入改写成深路径、**dev 也生效**" +
      "（实测冷编译 16.5s→3.9s、模块数 7378→1730；Next 16 的 Turbopack 实测无差异，hulianui/hulian#34）。",
  );
  lines.push("5. 标签 `#animated` 动效、`#webgl` 需 WebGL 上下文（SSR 注意）。");
  lines.push(
    "6. **跨 workspace 消费本库时**（消费方不在本仓的 pnpm workspace 内，如 `link:` / 软链到源码）：" +
      "先读 skill `consume-tailwind-v4-design-system-package-outside-its-pnpm-workspace`。" +
      "它记录了 React/emotion 被解析成两份实例导致的一整类故障——" +
      "症状是 `Cannot read properties of null (reading 'useRef'/'useId'/'useContext'/'useMemo')` " +
      "且**栈顶指向本库或第三方包内部，看起来像组件坏了**，实际是消费方的构建/测试解析配置问题。" +
      "四种依赖形态（自研零依赖 / 纯 ESM peer 包 / 有 exports 但 import 指向 CJS 壳 / 无 exports 的 legacy 包）" +
      "各需一条不同配置，缺一族崩一族，**逐条单独试会得出「每条都无效」的错误结论**。",
  );
  lines.push("");
  lines.push("## 组件目录");

  for (const cat of categories) {
    const catEntries = entries.filter((e) => e.category === cat.key);
    if (!catEntries.length) continue;
    lines.push("");
    lines.push(`### ${cat.label} ${cat.key}（${catEntries.length}）`);
    lines.push("");
    let lastGroup = null;
    for (const e of catEntries) {
      if (e.group !== lastGroup) {
        lines.push(`**${groupLabels[e.group] ?? e.group}**`);
        lastGroup = e.group;
      }
      lines.push(renderLine(e, resolved.get(e.slug)));
    }
  }

  if (uncatalogued.length) {
    lines.push("");
    lines.push(`### 未入册 uncatalogued（${uncatalogued.length}，源码存在但 manifest 未注册）`);
    lines.push("");
    for (const { entry, comp } of uncatalogued) lines.push(renderLine(entry, comp));
  }
  lines.push("");

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, lines.join("\n"));
  console.log(`[hulianui-index] wrote ${OUT} (${lines.length} lines, ${entries.length} catalogued + ${uncatalogued.length} uncatalogued)`);
}

main();
