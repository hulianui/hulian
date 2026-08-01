#!/usr/bin/env node
// 组件使用证据矩阵：每个组件被验证到了哪一层。
//
//   node scripts/evidence-matrix.mjs              # 摘要
//   node scripts/evidence-matrix.mjs --json       # 完整数据
//   node scripts/evidence-matrix.mjs --gaps       # 只列缺口（按优先级）
//   node scripts/evidence-matrix.mjs --check      # 有回退时非 0 退出（进 CI）
//
// 分两类证据，**刻意不混**：
//   自动可判（仓库里就能证明）：docs / unit / showcase / scenario
//   只能登记（需要人或浏览器跑过）：theme / mobile / motion / interaction / external
//
// 后一类绝不自动推断 —— 「有 .test.tsx」不等于「深浅色都验过」，把没验的算成验过，
// 矩阵就成了粉饰工具。它们从 docs/evidence-registry.json 读，谁登记谁负责。
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const UI_SRC = join(ROOT, "packages", "ui", "src");
const REGISTRY_JSON = join(ROOT, "apps", "www", "public", "registry.json");
const LEDGER = join(ROOT, "docs", "evidence-registry.json");
const BLOCK_DIRS = [
  join(ROOT, "apps", "www", "app", "blocks", "_blocks"),
  join(ROOT, "apps", "www", "app", "pages", "_pages"),
];

const AUTO_LEVELS = ["docs", "unit", "showcase", "scenario"];
const LEDGER_LEVELS = ["theme", "mobile", "motion", "interaction", "external"];

const LEVEL_DESC = {
  docs: "有 .md 文档且写了 Props",
  unit: "有单元测试",
  showcase: "文档站有独立示例",
  scenario: "进入了 block / page 的真实组合",
  theme: "深色 + 浅色都验过",
  mobile: "390px 或等价窄屏验过",
  motion: "动效 / reduced-motion 验过",
  interaction: "真实浏览器完成过关键交互",
  external: "外部真实项目登记使用",
};

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const onlyGaps = argv.includes("--gaps");
const checkMode = argv.includes("--check");
// --sync-external <scan.json>：把 agent-adoption-scan 的结果写进登记文件的 external 层。
// 显式动作，不是隐式遥测：只写 slug 与项目名，不含任何消费项目的源码。
const syncFrom = argv.includes("--sync-external")
  ? argv[argv.indexOf("--sync-external") + 1]
  : null;

function readIfExists(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/** 收集 block/page 源码里出现过的组件导入。 */
function scenarioUsage() {
  const used = new Map(); // slug 无法直接拿到，先收 symbol
  for (const dir of BLOCK_DIRS) {
    let files;
    try {
      files = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const f of files) {
      if (!f.isFile() || !/\.tsx?$/.test(f.name)) continue;
      const src = readIfExists(join(dir, f.name));
      if (!src) continue;
      for (const m of src.matchAll(
        /import\s+(type\s+)?\{([^{}]*?)\}\s*from\s*["']@hulianui\/ui["']/g,
      )) {
        if (m[1]) continue;
        for (let raw of m[2].split(",")) {
          raw = raw.trim();
          if (!raw || raw.startsWith("type ")) continue;
          const name = raw.split(/\s+as\s+/)[0].trim();
          if (name) used.set(name, (used.get(name) ?? 0) + 1);
        }
      }
    }
  }
  return used;
}

function main() {
  if (!existsSync(REGISTRY_JSON)) {
    console.error(`读不到 registry：${REGISTRY_JSON}\n先跑 pnpm llms-registry。`);
    process.exit(1);
  }
  const registry = JSON.parse(readFileSync(REGISTRY_JSON, "utf8"));
  const ui = registry.items.filter((i) => i.type === "registry:ui");

  const ledger = existsSync(LEDGER)
    ? JSON.parse(readFileSync(LEDGER, "utf8"))
    : {
        note:
          "组件使用证据登记。theme / mobile / motion / interaction / external 无法从仓库" +
          "自动证明，只能由验过的人登记 —— 把没验的写成验过，这份矩阵就成了粉饰工具。",
        components: {},
      };

  if (syncFrom) {
    if (!existsSync(syncFrom)) {
      console.error(`读不到扫描结果：${syncFrom}\n先跑 node scripts/agent-adoption-scan.mjs --json > scan.json`);
      process.exit(1);
    }
    const scan = JSON.parse(readFileSync(syncFrom, "utf8"));
    const counted = (scan.projects ?? []).filter((p) => !p.duplicateOf);
    const bySlug = new Map();
    for (const p of counted) {
      const label = p.dir + (p.scanSubdir ? `/${p.scanSubdir}` : "");
      for (const [slug] of p.slugs ?? []) {
        if (!bySlug.has(slug)) bySlug.set(slug, []);
        bySlug.get(slug).push(label);
      }
    }
    ledger.components ??= {};
    for (const [slug, projects] of bySlug) {
      ledger.components[slug] = {
        ...(ledger.components[slug] ?? {}),
        external: true,
        // 只记数量不记项目名：这份登记会进公开仓库，消费项目的名字属于使用者的信息，
        // 不该因为「统计需要」被带出去。要看是哪些项目，本地跑 agent-adoption-scan。
        externalProjectCount: projects.length,
      };
    }
    ledger.externalSyncedFrom = {
      projects: counted.length,
      coverage: `${bySlug.size}/${scan.registryUi ?? "?"}`,
      // 同理不记 scanRoot（本机绝对路径）
    };
    writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`);
    console.log(
      `已把 ${bySlug.size} 个组件的 external 证据写进 ${LEDGER.replace(ROOT, "")}（来自 ${counted.length} 个真实项目）。`,
    );
  }

  const scenarioSymbols = scenarioUsage();
  const symbolToSlug = new Map();
  for (const item of ui)
    for (const ex of item.meta?.exports ?? [])
      if (!symbolToSlug.has(ex)) symbolToSlug.set(ex, item.name);
  const scenarioSlugs = new Set();
  for (const sym of scenarioSymbols.keys()) {
    const slug = symbolToSlug.get(sym);
    if (slug) scenarioSlugs.add(slug);
  }

  const rows = ui.map((item) => {
    const slug = item.name;
    const dir = join(UI_SRC, slug);
    const doc = readIfExists(join(dir, `${slug}.md`));

    let files = [];
    try {
      files = readdirSync(dir);
    } catch {
      /* 组件目录不存在（lib 类），留空 */
    }

    const evidence = {
      docs: Boolean(doc && /^#+\s*Props/im.test(doc)),
      unit: files.some((f) => /\.test\.tsx?$/.test(f)),
      showcase: files.some((f) => /\.showcase\.tsx?$/.test(f)),
      scenario: scenarioSlugs.has(slug),
    };

    const entry = ledger.components?.[slug] ?? {};
    for (const lvl of LEDGER_LEVELS) evidence[lvl] = Boolean(entry[lvl]);

    const autoScore = AUTO_LEVELS.filter((l) => evidence[l]).length;
    return {
      slug,
      title: item.title,
      categories: item.categories ?? [],
      animated: Boolean(item.meta?.animated),
      webgl: Boolean(item.meta?.webgl),
      evidence,
      autoScore,
      ledgerScore: LEDGER_LEVELS.filter((l) => evidence[l]).length,
    };
  });

  // 缺口优先级：动效 / WebGL 件缺真实浏览器证据最危险 —— jsdom 测不出来
  const gaps = {
    missingDocs: rows.filter((r) => !r.evidence.docs).map((r) => r.slug),
    missingUnit: rows.filter((r) => !r.evidence.unit).map((r) => r.slug),
    showcaseOnly: rows
      .filter((r) => r.evidence.showcase && !r.evidence.scenario)
      .map((r) => r.slug),
    riskyWithoutBrowser: rows
      .filter((r) => (r.animated || r.webgl) && !r.evidence.interaction)
      .map((r) => r.slug),
  };

  const counts = Object.fromEntries(
    [...AUTO_LEVELS, ...LEDGER_LEVELS].map((l) => [
      l,
      rows.filter((r) => r.evidence[l]).length,
    ]),
  );

  const result = { total: rows.length, counts, gaps, rows };

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (onlyGaps) {
    console.log(`缺文档（${gaps.missingDocs.length}）：${gaps.missingDocs.join(" ") || "无"}`);
    console.log(`\n缺单测（${gaps.missingUnit.length}）：${gaps.missingUnit.join(" ") || "无"}`);
    console.log(
      `\n只有 showcase、从未进入真实组合（${gaps.showcaseOnly.length}）：\n  ${gaps.showcaseOnly.join(" ") || "无"}`,
    );
    console.log(
      `\n动效 / WebGL 件缺真实浏览器证据（${gaps.riskyWithoutBrowser.length}）—— jsdom 证明不了这些：\n  ${gaps.riskyWithoutBrowser.join(" ") || "无"}`,
    );
    return;
  }

  console.log(`组件证据矩阵 · ${rows.length} 个组件\n`);
  console.log("自动可判（仓库里就能证明）");
  for (const l of AUTO_LEVELS)
    console.log(
      `  ${l.padEnd(10)}${String(counts[l]).padStart(4)}/${rows.length}  ${((counts[l] / rows.length) * 100).toFixed(0).padStart(3)}%  ${LEVEL_DESC[l]}`,
    );
  console.log("\n只能登记（docs/evidence-registry.json，谁登记谁负责）");
  for (const l of LEDGER_LEVELS)
    console.log(
      `  ${l.padEnd(10)}${String(counts[l]).padStart(4)}/${rows.length}  ${((counts[l] / rows.length) * 100).toFixed(0).padStart(3)}%  ${LEVEL_DESC[l]}`,
    );

  console.log("\n缺口");
  console.log(`  缺文档 ${gaps.missingDocs.length} · 缺单测 ${gaps.missingUnit.length}`);
  console.log(`  只有 showcase 从未进真实组合 ${gaps.showcaseOnly.length}`);
  console.log(`  动效/WebGL 件缺浏览器证据 ${gaps.riskyWithoutBrowser.length}`);
  console.log("\n用 --gaps 看具体清单，--json 拿完整数据。");

  if (checkMode) {
    // 只把「自动可判」的两项当门禁：文档与单测是仓库自己的责任。
    // 登记类不进门禁 —— 那会逼人为了过 CI 去登记没验过的东西。
    const hard = gaps.missingDocs.length + gaps.missingUnit.length;
    if (hard > 0) {
      console.error(
        `\n--check 失败：${gaps.missingDocs.length} 个缺文档、${gaps.missingUnit.length} 个缺单测。`,
      );
      process.exit(1);
    }
  }
}

main();
