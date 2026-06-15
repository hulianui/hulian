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
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_SRC = join(ROOT, "packages", "ui", "src");
const MANIFEST = join(ROOT, "apps", "www", "lib", "manifest.ts");
const PKG = JSON.parse(readFileSync(join(ROOT, "packages", "ui", "package.json"), "utf8"));
const OUT_DIR = join(ROOT, "apps", "www", "public");

const REPO = "https://github.com/hulianui/hulian";
const DOC_BASE = `${REPO}/blob/master`; // + /packages/ui/src/<slug>/<slug>.md
const TAGLINE = "颜值 + 好用的 React 设计系统（Base UI + Tailwind v4 + Motion）";

const PKG_DEPS = new Set([...Object.keys(PKG.dependencies || {}), ...Object.keys(PKG.peerDependencies || {})]);
// universal framework peers — assumed everywhere, omitted from per-component deps to cut noise
const UNIVERSAL_PEERS = new Set(["react", "react-dom", "tailwindcss"]);

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
  return [...deps].sort();
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
  full.push('安装 `npm i @hulianui/ui`；所有组件从根 barrel 导入 `import { X } from "@hulianui/ui"`。');
  full.push("");
  for (const cat of orderedCats) {
    const list = byCat.get(cat).filter((d) => d.status === "enriched");
    if (!list.length) continue;
    full.push(`\n# ━━━━━━━━ ${catLabel.get(cat) ?? cat} ━━━━━━━━\n`);
    for (const d of list) {
      full.push("<!-- ════════════════════════════════════════════════════════ -->");
      full.push(d.body);
      full.push("");
    }
  }
  writeFileSync(join(OUT_DIR, "llms-full.txt"), full.join("\n"));

  // ---- registry.json ------------------------------------------------------
  const items = docs.map((d) => {
    const imp = d.exports.length ? `import { ${d.exports.join(", ")} } from "${PKG.name}"` : `import { /* ? */ } from "${PKG.name}"`;
    return {
      name: d.slug,
      type: "registry:ui",
      title: d.name,
      description: blurb(d),
      categories: [d.category],
      dependencies: scanDeps(d.dir),
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
      },
    };
  });
  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "hulianui",
    homepage: REPO,
    version: PKG.version,
    description: TAGLINE,
    install: `npm i ${PKG.name}`,
    import: `import { /* components */ } from "${PKG.name}"`,
    items,
  };
  writeFileSync(join(OUT_DIR, "registry.json"), JSON.stringify(registry, null, 2));

  console.log(
    `[llms-registry] llms.txt(${docs.length}) · llms-full.txt(${enriched.length} enriched) · registry.json(${items.length})` +
      (scaffold.length ? ` · ⚠ ${scaffold.length} 个仍 scaffold 未入 full: ${scaffold.slice(0, 8).map((d) => d.slug).join(",")}${scaffold.length > 8 ? "…" : ""}` : ""),
  );
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
main();
