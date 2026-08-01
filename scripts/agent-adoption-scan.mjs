#!/usr/bin/env node
// 扫描本机 code/ 下真实消费 @hulianui/ui 的项目，产出组件采用基线。
//
//   node scripts/agent-adoption-scan.mjs            # 摘要
//   node scripts/agent-adoption-scan.mjs --json     # 完整数据
//   node scripts/agent-adoption-scan.mjs --root ~/w # 换扫描根
//
// 只读：不写、不改任何被扫项目。产出用于 #41 的采用率与场景 profile 论证，
// 口径与已知偏差见 docs/agent-adoption-baseline-2026-08-01.md。
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const rootArg = argv[argv.indexOf("--root") + 1];
const SCAN_ROOT =
  argv.includes("--root") && rootArg
    ? resolve(rootArg.replace(/^~/, homedir()))
    : join(homedir(), "Desktop", "code");
// --exclude a,b：跳过指定目录。用于剔除 demo 原型这类不代表生产使用的仓库。
const excludeArg = argv.includes("--exclude")
  ? (argv[argv.indexOf("--exclude") + 1] ?? "")
  : "";
const EXCLUDE = excludeArg
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const REGISTRY = fileURLToPath(
  new URL("../apps/www/public/registry.json", import.meta.url),
);

const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".turbo",
  "out",
  "coverage",
  "src-tauri",
]);
const CODE_EXT = /\.(tsx|ts|jsx|js)$/;
const JSX_EXT = /\.(tsx|jsx)$/;

// 花括号内不会嵌套，用 [^{}] 而非 [\s\S]：后者会跨过上一条 import 的收尾
// 花括号，把 react 的 useState/useEffect 一并算成瑚琏组件。
const IMPORT_RE =
  /import\s+(type\s+)?\{([^{}]*?)\}\s*from\s*["'](@hulianui\/[^"']+)["']/g;

// 手搓信号：本该用现成组件，却退回原生标签 / 内联样式。
const HANDMADE_RULES = [
  { id: "bare-table", should: "Table / ProTable", re: /<table[\s>]/g },
  { id: "bare-button", should: "Button", re: /<button[\s>]/g },
  { id: "bare-input", should: "Input / Field", re: /<input[\s>]/g },
  { id: "bare-select", should: "Select", re: /<select[\s>]/g },
  { id: "bare-textarea", should: "Textarea", re: /<textarea[\s>]/g },
  { id: "bare-dialog", should: "Dialog", re: /<dialog[\s>]/g },
  { id: "inline-style", should: "语义 token / 组件 prop", re: /\sstyle=\{\{/g },
  {
    id: "hardcoded-color",
    should: "语义 token",
    re: /(?:text|bg|border|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/g,
  },
  {
    id: "handmade-overlay",
    should: "Dialog / Drawer / Popover",
    re: /fixed\s+inset-0/g,
  },
];

// Agent 契约可能落在哪些文件，以及「铁律」类措辞。
const CONTRACT_FILES = [
  "CLAUDE.md",
  "AGENTS.md",
  "README.md",
  ".github/copilot-instructions.md",
  ".cursorrules",
];
const RULE_WORDS = /100%|铁律|硬规则|回库|不.{0,6}(CSS|css).{0,4}补丁|优先使用/;

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (SKIP_DIR.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (CODE_EXT.test(e.name)) acc.push(p);
  }
  return acc;
}

// monorepo 消费方的前端可能不在仓库根。有界探测这些常见位置，不递归全仓 ——
// 与 #37 里 inspect_project 面对 monorepo 根的处境同构：只看根 package.json
// 会得出「没装 @hulianui/ui」的错误结论（5069tk-app 就是这样被漏掉的）。
const WORKSPACE_CANDIDATES = [
  "web",
  "frontend",
  "client",
  "site",
  "ui",
  "app",
  "www",
  "apps/web",
  "apps/www",
  "packages/web",
  "packages/ui",
];

/** 该目录是否就是瑚琏库仓库本身（而非消费方）。 */
function isHulianRepo(dir) {
  const p = join(dir, "packages", "ui", "package.json");
  if (!existsSync(p)) return false;
  try {
    return JSON.parse(readFileSync(p, "utf8")).name === "@hulianui/ui";
  } catch {
    return false;
  }
}

/** 读一个 package.json，若依赖 @hulianui/* 则返回描述，否则 null。 */
function readHulianPkg(pkgPath) {
  if (!existsSync(pkgPath)) return null;
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch {
    return null;
  }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const hulian = Object.keys(deps).filter((d) => d.startsWith("@hulianui/"));
  if (!hulian.length) return null;
  return {
    pkgName: pkg.name,
    deps: Object.fromEntries(hulian.map((h) => [h, deps[h]])),
    linked: hulian.some((h) => String(deps[h]).startsWith("link:")),
  };
}

/**
 * 找出扫描根下依赖 @hulianui/* 的项目。先看一级目录的 package.json；
 * 命不中再有界探测 WORKSPACE_CANDIDATES，命中则以该子目录为扫描起点。
 */
function discoverProjects(root, exclude = []) {
  const found = [];
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    if (!e.isDirectory() || SKIP_DIR.has(e.name)) continue;
    if (exclude.includes(e.name)) continue;
    // 跳过瑚琏仓库自身：apps/www 会 import 全部组件做 showcase，计入会把覆盖率
    // 拉到接近 100%，且 xxxShowcase 这类导出并非组件使用。
    if (isHulianRepo(join(root, e.name))) continue;

    const direct = readHulianPkg(join(root, e.name, "package.json"));
    if (direct) {
      found.push({
        dir: e.name,
        scanSubdir: "",
        pkgName: direct.pkgName ?? e.name,
        ...direct,
      });
      continue;
    }

    for (const cand of WORKSPACE_CANDIDATES) {
      const sub = readHulianPkg(join(root, e.name, cand, "package.json"));
      if (!sub) continue;
      found.push({
        dir: e.name,
        scanSubdir: cand, // 只扫这个子目录，避免把后端/脚本算进 jsx 统计
        pkgName: sub.pkgName ?? `${e.name}/${cand}`,
        ...sub,
      });
      break;
    }
  }
  return found;
}

function scanProject(root, proj) {
  // monorepo 消费方只扫前端子目录，避免把后端 / 脚本算进 jsx 与手搓统计
  const base = join(root, proj.dir, proj.scanSubdir || "");
  const files = walk(base);

  const symbolCounts = new Map();
  let filesUsingHulian = 0;
  for (const f of files) {
    let src;
    try {
      src = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    if (!src.includes("@hulianui/")) continue;
    let hit = false;
    for (const m of src.matchAll(IMPORT_RE)) {
      const typeImport = Boolean(m[1]);
      for (let raw of m[2].split(",")) {
        raw = raw.trim();
        if (!raw) continue;
        let typeOnly = typeImport;
        if (raw.startsWith("type ")) {
          typeOnly = true;
          raw = raw.slice(5).trim();
        }
        if (typeOnly) continue; // 类型导入不等于用了组件
        const name = raw.split(/\s+as\s+/)[0].trim();
        if (!name) continue;
        symbolCounts.set(name, (symbolCounts.get(name) ?? 0) + 1);
        hit = true;
      }
    }
    if (hit) filesUsingHulian++;
  }

  const handmade = {};
  let jsxFiles = 0;
  for (const f of files.filter((f) => JSX_EXT.test(f))) {
    let src;
    try {
      src = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    jsxFiles++;
    for (const r of HANDMADE_RULES) {
      const m = src.match(r.re);
      if (!m) continue;
      handmade[r.id] ??= { count: 0, files: [] };
      handmade[r.id].count += m.length;
      if (handmade[r.id].files.length < 5)
        handmade[r.id].files.push(relative(base, f));
    }
  }

  // 契约可能写在仓库根（monorepo 常见）也可能在前端子目录，两处都看
  const contractRoots = [join(root, proj.dir)];
  if (proj.scanSubdir) contractRoots.push(base);
  const contracts = [];
  const seenContract = new Set();
  for (const cr of contractRoots) {
    for (const cf of CONTRACT_FILES) {
      const p = join(cr, cf);
      if (seenContract.has(p) || !existsSync(p)) continue;
      seenContract.add(p);
      let text;
      try {
        text = readFileSync(p, "utf8");
      } catch {
        continue;
      }
      const mentions = (text.match(/hulianui/gi) ?? []).length;
      if (!mentions) continue;
      contracts.push({
        file: relative(join(root, proj.dir), p),
        mentions,
        hasRuleWording: RULE_WORDS.test(text),
      });
    }
  }

  return {
    ...proj,
    codeFiles: files.length,
    jsxFiles,
    filesUsingHulian,
    distinctSymbols: symbolCounts.size,
    symbols: [...symbolCounts.entries()].sort((a, b) => b[1] - a[1]),
    handmadeTotal: Object.values(handmade).reduce((s, h) => s + h.count, 0),
    handmade,
    contracts,
    hasContract: contracts.length > 0,
  };
}

function main() {
  if (!existsSync(REGISTRY)) {
    console.error(
      `registry 读不到：${REGISTRY}\n先跑 pnpm llms-registry 生成产物。`,
    );
    process.exit(1);
  }
  const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
  const ui = registry.items.filter((i) => i.type === "registry:ui");
  const symbolToSlug = new Map();
  for (const item of ui)
    for (const ex of item.meta?.exports ?? [])
      if (!symbolToSlug.has(ex)) symbolToSlug.set(ex, item.name);
  const slugMeta = new Map(ui.map((i) => [i.name, i]));

  const projects = discoverProjects(SCAN_ROOT, EXCLUDE)
    .map((p) => scanProject(SCAN_ROOT, p))
    .filter((p) => p.distinctSymbols > 0 || p.hasContract);

  // 同一 package name 出现在多个目录 = 同产品的快照/发布副本（如 jinshu 与
  // jinshu-release）。全都计入会把同一份代码的覆盖算两遍，故只留代码量最大的
  // 那份参与统计，其余标记后仍列出，便于人工核对判断是否真的重复。
  const byPkgName = new Map();
  for (const p of projects) {
    const peers = byPkgName.get(p.pkgName) ?? [];
    peers.push(p);
    byPkgName.set(p.pkgName, peers);
  }
  for (const peers of byPkgName.values()) {
    if (peers.length < 2) continue;
    const primary = peers.reduce((a, b) => (b.codeFiles > a.codeFiles ? b : a));
    for (const p of peers) if (p !== primary) p.duplicateOf = primary.dir;
  }
  const counted = projects.filter((p) => !p.duplicateOf);

  const usedSlugs = new Map();
  const unmapped = new Set();
  for (const p of projects) {
    p.slugs = new Map();
    for (const [sym, n] of p.symbols) {
      const slug = symbolToSlug.get(sym);
      if (!slug) {
        unmapped.add(sym);
        continue;
      }
      p.slugs.set(slug, (p.slugs.get(slug) ?? 0) + n);
      if (p.duplicateOf) continue; // 快照副本不计入覆盖率
      if (!usedSlugs.has(slug))
        usedSlugs.set(slug, { uses: 0, projects: new Set() });
      const rec = usedSlugs.get(slug);
      rec.uses += n;
      rec.projects.add(p.dir);
    }
    const cats = {};
    for (const s of p.slugs.keys())
      for (const c of slugMeta.get(s).categories ?? ["?"])
        cats[c] = (cats[c] ?? 0) + 1;
    p.slugCount = p.slugs.size;
    p.categories = Object.fromEntries(
      Object.entries(cats).sort((a, b) => b[1] - a[1]),
    );
  }

  const catTable = [];
  const cats = new Set(ui.flatMap((i) => i.categories ?? ["?"]));
  for (const cat of cats) {
    const total = ui.filter((i) => (i.categories ?? ["?"]).includes(cat));
    const used = total.filter((i) => usedSlugs.has(i.name));
    catTable.push({
      cat,
      used: used.length,
      total: total.length,
      never: total.filter((i) => !usedSlugs.has(i.name)).map((i) => i.name),
    });
  }
  catTable.sort((a, b) => b.total - a.total);

  const result = {
    scanRoot: SCAN_ROOT,
    registryUi: ui.length,
    usedSlugs: usedSlugs.size,
    coveragePct: +((usedSlugs.size / ui.length) * 100).toFixed(1),
    unmappedSymbols: [...unmapped],
    catTable,
    projects: projects.map((p) => ({
      ...p,
      slugs: [...p.slugs.entries()].sort((a, b) => b[1] - a[1]),
      symbols: undefined,
    })),
  };

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`扫描根：${SCAN_ROOT}`);
  console.log(
    `组件覆盖：${result.usedSlugs}/${result.registryUi} = ${result.coveragePct}%（${counted.length} 个真实项目并集）\n`,
  );
  console.log("分类".padEnd(16) + "已用/总数  覆盖率");
  for (const c of catTable)
    console.log(
      c.cat.padEnd(16) +
        `${String(c.used).padStart(3)}/${String(c.total).padEnd(5)}` +
        `${((c.used / c.total) * 100).toFixed(0)}%`,
    );

  console.log("\n项目".padEnd(22) + "契约  slug  手搓  接入方式");
  for (const p of projects)
    console.log(
      (p.dir + (p.scanSubdir ? `/${p.scanSubdir}` : "")).padEnd(22) +
        (p.hasContract ? " ✅  " : " ❌  ") +
        String(p.slugCount).padStart(4) +
        String(p.handmadeTotal).padStart(6) +
        "  " +
        (p.linked ? "link:源码" : "registry 发布版") +
        (p.duplicateOf ? `  ← ${p.duplicateOf} 的副本，未计入覆盖率` : ""),
    );

  const withC = counted.filter((p) => p.hasContract);
  const without = counted.filter((p) => !p.hasContract);
  const sum = (a) => a.reduce((s, p) => s + p.handmadeTotal, 0);
  console.log(
    `\n有契约 ${withC.length} 个项目手搓合计 ${sum(withC)} 处；` +
      `无契约 ${without.length} 个项目手搓合计 ${sum(without)} 处。`,
  );
  if (result.unmappedSymbols.length)
    console.log(`\n未映射 symbol（非组件导出）：${result.unmappedSymbols.join(", ")}`);
}

main();
