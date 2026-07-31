#!/usr/bin/env node
// gen-component-docs.mjs — scaffold per-component usage docs at
//   packages/ui/src/<slug>/<slug>.md   (or src/_mui/<slug>.md for MUI bridges)
//
// "脚本骨架 + AI 补血" pipeline, phase 1 (mechanical scaffold).
// Each .md is a template with AI:* placeholder sections + a SCAFFOLD DATA block
// carrying the raw material an enrichment agent needs (types interface,
// showcase controls/states/toCode, candidate pitfall skills, related comps).
// An enrichment agent fills the placeholders, then deletes the SCAFFOLD block
// and flips frontmatter status: scaffold -> enriched.
//
// Sources of truth (read-only):
//   apps/www/lib/manifest.ts        -> slug/name/description/category/group/tags
//   packages/ui/src/<slug>/         -> index.ts exports, <slug>.types.ts, <slug>.showcase.tsx
//   ~/.claude/skills/<name>/        -> candidate pitfall skills matched by name
//
// Zero dependencies. Idempotent: never clobbers an `status: enriched` file
// unless --force. Flags:
//   --force            rewrite even enriched files
//   --only=slugA,slugB only (re)generate these slugs
//   --dry              print what would change, write nothing
//
// Run: node scripts/gen-component-docs.mjs

import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_SRC = join(ROOT, "packages", "ui", "src");
const MANIFEST = join(ROOT, "apps", "www", "lib", "manifest.ts");
const SKILLS_DIR = join(homedir(), ".claude", "skills");

const TYPES_CAP = 140; // lines of .types.ts to inline as raw material
const SHOW_CAP = 90; // lines of .showcase.tsx to inline
const REL_MAX = 6; // related components listed
const SKILL_MAX = 8; // candidate pitfall skills

const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const DRY = argv.includes("--dry");
const LIST = argv.includes("--list"); // print JSON manifest of enrichment items to stdout, write nothing
const ONLY = (argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);

// ---------------------------------------------------------------- helpers --

const pascal = (slug) => slug.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
const readIf = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");
const capLines = (s, n) => {
  const ls = s.split("\n");
  return ls.length <= n ? s.trimEnd() : `${ls.slice(0, n).join("\n").trimEnd()}\n…（已截断，余 ${ls.length - n} 行见源文件）`;
};

// ---------------------------------------------------------------- manifest --
// (regex shapes mirror scripts/gen-skill-index.mjs)

function parseManifest(src) {
  const categories = [];
  const catBlock = src.slice(src.indexOf("export const CATEGORIES"), src.indexOf("export const manifest"));
  const catKeys = [...src.matchAll(/^\s*\|\s*"([\w-]+)"/gm)].map((m) => m[1]);
  for (const key of catKeys) {
    const m = catBlock.match(new RegExp(`key:\\s*"${key}",\\s*\\n\\s*label:\\s*"([^"]+)"`));
    if (m) categories.push({ key, label: m[1] });
  }
  const groupLabels = {};
  for (const m of catBlock.matchAll(/\{\s*key:\s*"([\w-]+)",\s*label:\s*"([^"]+)"\s*\}/g)) groupLabels[m[1]] = m[2];

  const entries = [];
  for (const m of src.matchAll(
    /\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"((?:[^"\\]|\\.)*)",\s*category:\s*"([^"]+)",\s*group:\s*"([^"]+)",(?:\s*tags:\s*\[([^\]]*)\],)?\s*status:\s*"([^"]+)"\s*,?\s*\}/g,
  )) {
    entries.push({
      slug: m[1],
      name: m[2],
      description: m[3].replace(/\\"/g, '"'),
      category: m[4],
      group: m[5],
      tags: m[6] ? [...m[6].matchAll(/"([^"]+)"/g)].map((t) => t[1]) : [],
      status: m[7],
    });
  }
  return { categories, groupLabels, entries };
}

// ------------------------------------------------------------------ source --

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

function parseDirectExports(src) {
  const out = [];
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/g)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

/** Locate a component's files whether it lives in src/<slug>/ or src/_mui/<slug>.* */
function resolveFiles(slug) {
  const dir = join(UI_SRC, slug);
  if (existsSync(dir) && statSync(dir).isDirectory()) {
    return {
      mui: false,
      mdOut: join(dir, `${slug}.md`),
      indexSrc: readIf(join(dir, "index.ts")) || readIf(join(dir, "index.tsx")),
      typesSrc: readIf(join(dir, `${slug}.types.ts`)),
      showSrc: readIf(join(dir, `${slug}.showcase.tsx`)),
      mainSrc: readIf(join(dir, `${slug}.tsx`)) || readIf(join(dir, `${slug}-provider.tsx`)),
      dir,
    };
  }
  const muiTsx = join(UI_SRC, "_mui", `${slug}.tsx`);
  if (existsSync(muiTsx)) {
    return {
      mui: true,
      mdOut: join(UI_SRC, "_mui", `${slug}.md`),
      indexSrc: "",
      typesSrc: readIf(join(UI_SRC, "_mui", `${slug}.types.ts`)),
      showSrc: readIf(join(UI_SRC, "_mui", `${slug}.showcase.tsx`)),
      mainSrc: readIf(muiTsx),
      dir: join(UI_SRC, "_mui"),
    };
  }
  return null;
}

function exportsOf(f) {
  let ex = parseValueExports(f.indexSrc);
  if (!ex.length) ex = parseDirectExports(f.mainSrc);
  return ex;
}

function firstJsdocLine(src) {
  const m = src.match(/\/\*\*\s*\n?\s*\*?\s*([^\n*@]{4,})/);
  if (!m) return "";
  const firstExport = src.search(/^export /m);
  return firstExport !== -1 && m.index > firstExport ? "" : m[1].trim();
}

// ------------------------------------------------------------ pitfall skills --

let SKILL_NAMES = [];
function loadSkillNames() {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR).filter((d) => {
    try {
      return statSync(join(SKILLS_DIR, d)).isDirectory() && existsSync(join(SKILLS_DIR, d, "SKILL.md"));
    } catch {
      return false;
    }
  });
}

const bounded = (hay, needle) => new RegExp(`(^|-)${needle}(-|$)`).test(hay);

function candidateSkills(entry) {
  const slug = entry.slug;
  const name = entry.name.toLowerCase();
  const toks = slug.split("-").filter((t) => t.length >= 4);
  const out = [];
  for (const s of SKILL_NAMES) {
    if (s === "hulianui-index") continue;
    let hit = bounded(s, slug);
    if (!hit && slug.includes("-") && toks.length) hit = toks.every((t) => s.includes(t));
    if (!hit && name !== slug) hit = bounded(s, name);
    if (hit && !out.includes(s)) out.push(s);
  }
  return out.slice(0, SKILL_MAX);
}

// --------------------------------------------------------------- related --

function relatedOf(entry, entries) {
  const sameGroup = entries.filter((e) => e.slug !== entry.slug && e.group === entry.group && e.category === entry.category);
  const sameCat = entries.filter((e) => e.slug !== entry.slug && e.category === entry.category && e.group !== entry.group);
  return [...sameGroup, ...sameCat].slice(0, REL_MAX);
}

// every component file sits one level under src/ (src/<slug>/ or src/_mui/),
// so links to any sibling are uniformly `../<path-from-src>` — keyed on the
// TARGET's location, not the current file's.
let MUI_SLUGS = new Set();
function loadMuiSlugs() {
  const d = join(UI_SRC, "_mui");
  if (!existsSync(d)) return new Set();
  return new Set(readdirSync(d).filter((f) => f.endsWith(".tsx") && !/\.(test|showcase|types)\.tsx$/.test(f)).map((f) => f.replace(/\.tsx$/, "")));
}
const relLink = (slug) => `../${MUI_SLUGS.has(slug) ? `_mui/${slug}.md` : `${slug}/${slug}.md`}`;

// ---------------------------------------------------------------- render --

function statusBadge(entry, f) {
  const bits = [entry.category && entry.group ? `${entry.category}/${entry.group}` : entry.category || "uncatalogued"];
  if (entry.tags?.length) bits.push(entry.tags.map((t) => `#${t}`).join(" "));
  if (f.mui) bits.push("MUI 桥");
  return bits.join(" · ");
}

function render(entry, f, entries) {
  const ex = exportsOf(f);
  // `_mui/` 下的件不在根 barrel 里 —— MUI/emotion 是 optional peer，放进根 barrel 就等于
  // 强制每个消费方装齐才能 import 任何组件，所以日期族对外只走 ./date-pickers 子路径。
  // scaffold 出根 barrel 的 import 就是给人和 AI 一条导不进来的路径。
  const importEntry = f.mui ? "@hulianui/ui/date-pickers" : "@hulianui/ui";
  const importLine = ex.length
    ? `import { ${ex.join(", ")} } from "${importEntry}"`
    : `import { /* ? */ } from "${importEntry}"`;
  const related = relatedOf(entry, entries);
  const relatedLine = related.length ? related.map((r) => `[${r.name}](${relLink(r.slug)})`).join(" · ") : "—";
  const skills = candidateSkills(entry);

  const fm = [
    "---",
    `slug: ${entry.slug}`,
    `name: ${entry.name}`,
    `category: ${entry.category || "uncatalogued"}`,
    `group: ${entry.group || ""}`,
    `tags: [${(entry.tags || []).join(", ")}]`,
    `exports: [${ex.join(", ")}]`,
    "status: scaffold",
    "---",
  ];

  const body = [
    "",
    `# ${entry.name} ${entry.name === pascal(entry.slug) ? "" : ""}`.trimEnd(),
    "",
    `> ${entry.description || firstJsdocLine(f.mainSrc) || ""} · ${statusBadge(entry, f)}`,
    "",
    "## 何时用",
    "<!-- AI:WHEN — 一句话适用场景 + 与下方「相关」近邻组件的取舍判断。素材见文末 SCAFFOLD DATA 的 description。 -->",
    "",
    "## 导入",
    "```ts",
    importLine,
    "```",
    "",
    "## Props",
    "<!-- AI:PROPS — 配置/数据/外观/状态类属性（含 CVA 变体 variant/tone/size，从 showcase controls 并入）。不含事件回调与内容插槽——那两类拆到下面 Events / Slots。 -->",
    "",
    "| 名称 | 类型 | 默认 | 说明 |",
    "|------|------|------|------|",
    "",
    "## Events",
    "<!-- AI:EVENTS — onX 回调类属性（onChange/onClick/onOpenChange/onValueChange…）。无则整节删除。 -->",
    "",
    "| 事件 | 类型 | 说明 |",
    "|------|------|------|",
    "",
    "## Slots",
    "<!-- AI:SLOTS — ReactNode/渲染函数类内容插槽（children/icon/title/header/footer/action/extra…）。无则整节删除。 -->",
    "",
    "| 插槽 | 类型 | 说明 |",
    "|------|------|------|",
    "",
    "## 示例",
    "<!-- AI:EXAMPLE — 从 showcase states/toCode 选 1–2 个最有代表性的最小可用片段。 -->",
    "```tsx",
    "",
    "```",
    "",
    "## 禁忌 / 坑",
    "<!-- AI:PITFALL — 校验下方候选坑 skill 是否真适用本组件，删不适用的；可补从源码看出的坑。无坑则写「暂无已知坑」。引用写 [[skill-name]]。 -->",
    "",
    "## 相关",
    relatedLine,
    "",
  ];

  const data = [
    "<!-- ============================ SCAFFOLD DATA ============================",
    "     enrich 完成后请删除本注释块。以下为机械抽取的原始素材。",
    "",
    `EXPORTS: ${ex.join(", ") || "(无)"}`,
    "",
    "----- .types.ts -----",
    f.typesSrc ? capLines(f.typesSrc, TYPES_CAP) : "(无 types 文件)",
    "",
    "----- .showcase.tsx (controls 含 CVA 变体的 options/默认值；states 为命名示例；toCode 为规范代码串) -----",
    f.showSrc ? capLines(f.showSrc, SHOW_CAP) : "(无 showcase 文件)",
    "",
    "----- 候选坑 skill（按名称匹配，需 AI 校验是否真适用） -----",
    skills.length ? skills.map((s) => `- ${s}`).join("\n") : "(无名称匹配命中；如组件较 tricky 可自行 grep ~/.claude/skills)",
    "============================================================================ -->",
    "",
  ];

  return [...fm, ...body, ...data].join("\n");
}

// ------------------------------------------------------------------ main --

function readStatus(p) {
  if (!existsSync(p)) return null;
  const m = readFileSync(p, "utf8").match(/^---[\s\S]*?\bstatus:\s*(\w+)/);
  return m ? m[1] : "unknown";
}

function main() {
  SKILL_NAMES = loadSkillNames();
  MUI_SLUGS = loadMuiSlugs();
  const { entries } = parseManifest(readFileSync(MANIFEST, "utf8"));
  if (entries.length < 100) throw new Error(`manifest parse suspiciously small: ${entries.length}`);

  // include uncatalogued real components (Access/Callout/Config/Theme …)
  const SKIP_DIRS = new Set(["_icons", "_mui", "lib", "motion", "showcase"]);
  const known = new Set(entries.map((e) => e.slug));
  const all = [...entries];
  for (const d of readdirSync(UI_SRC).sort()) {
    const p = join(UI_SRC, d);
    if (!statSync(p).isDirectory() || SKIP_DIRS.has(d) || known.has(d)) continue;
    const f = resolveFiles(d);
    if (!f || !exportsOf(f).length) continue;
    all.push({ slug: d, name: pascal(d), description: firstJsdocLine(f.mainSrc), category: "", group: "", tags: [], status: "uncatalogued" });
  }

  if (LIST) {
    const items = [];
    for (const entry of all) {
      if (ONLY.length && !ONLY.includes(entry.slug)) continue;
      const f = resolveFiles(entry.slug);
      if (!f) continue;
      items.push({
        slug: entry.slug,
        name: entry.name,
        category: entry.category || "uncatalogued",
        group: entry.group || "",
        mui: f.mui,
        mdPath: f.mdOut.replace(ROOT + "/", ""),
        status: readStatus(f.mdOut) || "scaffold",
      });
    }
    process.stdout.write(JSON.stringify(items));
    return;
  }

  let wrote = 0, skipped = 0, missing = 0;
  for (const entry of all) {
    if (ONLY.length && !ONLY.includes(entry.slug)) continue;
    const f = resolveFiles(entry.slug);
    if (!f) { missing += 1; console.warn(`  ! 找不到源文件: ${entry.slug}`); continue; }

    const cur = readStatus(f.mdOut);
    if (cur === "enriched" && !FORCE) { skipped += 1; continue; }

    const md = render(entry, f, entries);
    if (DRY) { console.log(`  ~ ${entry.slug} -> ${f.mdOut.replace(ROOT + "/", "")} (${cur ?? "new"})`); wrote += 1; continue; }
    writeFileSync(f.mdOut, md);
    wrote += 1;
  }

  console.log(
    `[component-docs] ${DRY ? "(dry) " : ""}scaffold ${wrote}, skip-enriched ${skipped}, missing ${missing} · ${all.length} components · ${SKILL_NAMES.length} skills indexed`,
  );
}

main();
