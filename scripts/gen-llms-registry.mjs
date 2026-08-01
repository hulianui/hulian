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
// Zero dependencies. Run: node scripts/gen-llms-registry.mjs
// Re-run after enrichment; only `status: enriched` docs enter llms-full.txt.

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_SRC = join(ROOT, "packages", "ui", "src");
const MANIFEST = join(ROOT, "apps", "www", "lib", "manifest.ts");
const PKG = JSON.parse(readFileSync(join(ROOT, "packages", "ui", "package.json"), "utf8"));
const OUT_DIR = join(ROOT, "apps", "www", "public");

const REPO = "https://github.com/hulianui/hulian";
const DOC_BASE = `${REPO}/blob/master`; // + /packages/ui/src/<slug>/<slug>.md
const SITE = "https://hulianui.haloritual.com"; // 文档站；语料供站外 AI 消费，链接须绝对
// 把组件 md 里的相对链接转绝对，否则 AI 抓到 llms-full 后穿不透下一跳
const absolutize = (s) =>
  s
    .replace(/\]\(\.\.\/(?:_mui\/)?([\w-]+?)(?:\/[\w-]+)?\.md\)/g, `](${SITE}/components/$1)`)
    .replace(/\]\((\/[^)]+)\)/g, `](${SITE}$1)`);
const TAGLINE = "颜值 + 好用的 React 设计系统（Base UI + Tailwind v4 + Motion）";

const PKG_DEPS = new Set([...Object.keys(PKG.dependencies || {}), ...Object.keys(PKG.peerDependencies || {})]);
// universal framework peers — assumed everywhere, omitted from per-component deps to cut noise
const UNIVERSAL_PEERS = new Set(["react", "react-dom", "tailwindcss"]);

// 伴生 peer：**源码里永远扫不到、但少了就跑不起来**的那一类依赖。
// scanDeps 是靠 grep import specifier 反推 npm 依赖的，而 emotion 是 MUI v9 的样式引擎 ——
// 组件只 import `@mui/*`，emotion 由 MUI 自己在内部 require。于是 registry 单件安装
// 日期族时会漏装 emotion，装完直接跑不起来（docs/consuming.md 让人装的是四个包，
// registry 却只给三个）。这里按「谁带谁」补齐，别指望扫 import 能发现它们。
const COMPANION_PEERS = new Map([
  ["@mui/material", ["@emotion/react", "@emotion/styled"]],
  ["@mui/x-date-pickers", ["@emotion/react", "@emotion/styled"]],
]);

// 组件的对外入口未必是根 barrel。日期族在 package.json 的 exports 里单挂了 `./date-pickers`
// （映射到 src/_mui/index.ts）—— 因为 MUI 是 optional peer，放进根 barrel 就等于强制每个
// 消费方的 tsc 去编译 `_mui/*.tsx`。这里从 exports 反推「目录 → 入口说明符」，
// 而不是把 `_mui → ./date-pickers` 写死，将来再挂新的子路径入口时这里无需改动。
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
  const block = src.slice(src.indexOf("export const CATEGORIES"), src.indexOf("export const manifest"));
  const keys = [...src.matchAll(/^\s*\|\s*"([\w-]+)"/gm)].map((m) => m[1]);
  for (const key of keys) {
    const m = block.match(new RegExp(`key:\\s*"${key}",\\s*\\n\\s*label:\\s*"([^"]+)"`));
    if (m) cats.push({ key, label: m[1] });
  }
  return cats;
}

// ------------------------------------------------------------------- docs --

function parseDoc(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].trim();
  }
  const list = (v) => (v && v.startsWith("[") ? v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean) : []);
  return {
    slug: fm.slug,
    name: fm.name,
    category: fm.category || "uncatalogued",
    group: fm.group || "",
    tags: list(fm.tags),
    exports: list(fm.exports),
    status: fm.status || "scaffold",
    body: m[2].trim(),
  };
}

/** find every component .md and its src dir (for dep scan + doc url). */
function collectDocs() {
  const out = [];
  const push = (mdPath, dir, urlRel) => {
    const parsed = parseDoc(readFileSync(mdPath, "utf8"));
    if (parsed && parsed.slug) out.push({ ...parsed, dir, docUrl: `${DOC_BASE}/${urlRel}` });
  };
  for (const d of readdirSync(UI_SRC).sort()) {
    const p = join(UI_SRC, d);
    if (!statSync(p).isDirectory()) continue;
    if (d === "_mui") {
      for (const f of readdirSync(p)) {
        if (f.endsWith(".md")) {
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
    if (!/\.(tsx?|ts)$/.test(f) || /\.(test|showcase)\.tsx?$/.test(f) || f.endsWith(".md")) continue;
    const src = readFileSync(join(dir, f), "utf8");
    for (const m of src.matchAll(/(?:from|import)\s+["']([^"'.][^"']*)["']/g)) {
      const spec = m[1];
      if (spec.startsWith("@hulianui")) continue;
      const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      if (PKG_DEPS.has(pkg) && !UNIVERSAL_PEERS.has(pkg)) deps.add(pkg);
    }
  }
  for (const pkg of [...deps]) {
    for (const companion of COMPANION_PEERS.get(pkg) || []) deps.add(companion);
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

/** 从 app/{blocks,pages}/_meta.ts 里正则提取条目（与 parseCategories 同策略，零依赖）。 */
function parseMeta(file) {
  if (!existsSync(file)) return [];
  const src = readFileSync(file, "utf8");
  const out = [];
  for (const m of src.matchAll(
    /\{\s*slug:\s*"([\w-]+)",\s*name:\s*"([^"]*)",\s*description:\s*"([^"]*)",\s*category:\s*"([\w-]+)",\s*tags:\s*\[([^\]]*)\],\s*file:\s*"([^"]+)"/g,
  )) {
    out.push({
      slug: m[1],
      name: m[2],
      description: m[3],
      category: m[4],
      tags: [...m[5].matchAll(/"([^"]*)"/g)].map((t) => t[1]),
      file: m[6],
    });
  }
  return out;
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

/** 根据真实源码生成安装后的接入清单；只报告能从语法直接证明存在的工作。 */
function inferCompositeInstallation(source, kind, pageBlockDeps) {
  const replace = new Set(["copy"]);
  if (/\bconst\s+[\w$]+\s*(?::[^=]+)?=\s*\[/.test(source)) replace.add("mock-data");
  if (/\bhref\s*=|\b(?:router\.)?(?:push|replace)\s*\(/.test(source)) replace.add("navigation");
  if (/\bon[A-Z][\w]*\s*=/.test(source)) replace.add("event-handlers");
  return {
    providers: ["ThemeProvider"],
    replace: [...replace].sort(),
    slots: kind === "page" ? pageBlockDeps.map((name) => name.replace(/^block-/, "")) : [],
  };
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
        throw new Error(`${meta.file} 包含无法随 registry 安装的相对依赖: ${unresolved.join(", ")}`);
      }
    }
    const content = kind === "page" ? rewritePageBlockImports(source) : source;
    const installation = inferCompositeInstallation(source, kind, pageBlockDeps);
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
        installation,
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
  docs.sort((a, b) => (catOrder.get(a.category) ?? 998) - (catOrder.get(b.category) ?? 998) || a.name.localeCompare(b.name));
  const enriched = docs.filter((d) => d.status === "enriched");
  const scaffold = docs.filter((d) => d.status !== "enriched");

  const byCat = new Map();
  for (const d of docs) {
    if (!byCat.has(d.category)) byCat.set(d.category, []);
    byCat.get(d.category).push(d);
  }
  const orderedCats = [...byCat.keys()].sort((a, b) => (catOrder.get(a) ?? 998) - (catOrder.get(b) ?? 998));

  // ---- llms.txt -----------------------------------------------------------
  const idx = [];
  idx.push(`# 瑚琏 Hulian (\`${PKG.name}\`)`);
  idx.push("");
  idx.push(`> ${TAGLINE} · ${docs.length} 个组件 · v${PKG.version}`);
  idx.push("");
  idx.push("AI agent 索引。完整逐组件用法见 [llms-full.txt](./llms-full.txt)（自包含）或各组件源码旁 `<slug>.md`。");
  idx.push('安装 `npm i @hulianui/ui`，统一从根 barrel 导入：`import { X } from "@hulianui/ui"`。');
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
  full.push(`> ${TAGLINE} · v${PKG.version} · ${enriched.length} 个组件文档（自包含，供 AI 一次性消费）`);
  full.push("");
  full.push(
    '安装 `npm i @hulianui/ui @hulianui/tokens`（tokens 提供主题 CSS，必装）；所有组件从根 barrel 导入 `import { X } from "@hulianui/ui"`。',
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
    const imp = d.exports.length ? `import { ${d.exports.join(", ")} } from "${entry}"` : `import { /* ? */ } from "${entry}"`;
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
        exports: d.exports,
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
      (scaffold.length ? ` · ⚠ ${scaffold.length} 个仍 scaffold 未入 full: ${scaffold.slice(0, 8).map((d) => d.slug).join(",")}${scaffold.length > 8 ? "…" : ""}` : ""),
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  main();
}
