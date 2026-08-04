// README（中/英）里「N 个组件 / N 个 demo」的口径 SSOT + 一键同步。
//
// 这些数字是手写的，没有门禁就必然滞后：349 从 0.15 一直挂到 0.20（真实值 376），
// demo 数漏掉过第 19 个（hanship）。readme-counts.test.mjs 负责在 CI 拦住滞后，
// 本模块负责**让人一条命令改对**——否则每次增删组件要手改 5 处，改漏了再被 CI 打回来。
//
// 口径（测试与同步共用这一份，别在两处各写各的）：
//   组件数 = packages/ui/src/<slug>/<slug>.md 的个数 —— 即 npm 包里能 import 的公开组件，
//            与 llms.txt / registry.json 的 ui 计数同源。**不是**文档站画廊数（画廊少 3 个：
//            access / config / theme 是基础设施件，有意不进画廊）。
//   demo 数 = apps/www/app/demos/lib/demos.ts 里的 slug 条目数（demos 索引页的 SSOT）。
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const README_FILES = ["README.md", "README.en.md"];

export function componentCount() {
  const src = join(ROOT, "packages/ui/src");
  return readdirSync(src, { withFileTypes: true }).filter(
    (d) => d.isDirectory() && existsSync(join(src, d.name, `${d.name}.md`)),
  ).length;
}

export function demoCount() {
  const source = readFileSync(join(ROOT, "apps/www/app/demos/lib/demos.ts"), "utf8");
  return [...source.matchAll(/slug: "[a-z0-9-]+"/g)].length;
}

// \b 只对英文分支有意义：中文「个组件」后面常跟 `<`/`，`，两个非单词字符之间没有词边界
export const COMPONENT_RE = /(\d+)(\s*(?:个组件|components\b))/g;
export const DEMO_RE = /(\d+)(\s*(?:个(?:内置|真实)\s*demo|real demos))/gi;

export function componentNumbersIn(readme) {
  return [...readme.matchAll(COMPONENT_RE)].map((m) => Number(m[1]));
}

export function demoNumbersIn(readme) {
  return [...readme.matchAll(DEMO_RE)].map((m) => Number(m[1]));
}

/** 把一份 README 文本里的两类计数改写成真实值，返回 { text, changed }。 */
export function rewrite(readme, components, demos) {
  let changed = 0;
  const next = readme
    .replace(COMPONENT_RE, (whole, n, tail) => {
      if (Number(n) === components) return whole;
      changed += 1;
      return `${components}${tail}`;
    })
    .replace(DEMO_RE, (whole, n, tail) => {
      if (Number(n) === demos) return whole;
      changed += 1;
      return `${demos}${tail}`;
    });
  return { text: next, changed };
}

function main() {
  const check = process.argv.includes("--check");
  const components = componentCount();
  const demos = demoCount();
  let stale = 0;
  for (const file of README_FILES) {
    const path = join(ROOT, file);
    const { text, changed } = rewrite(readFileSync(path, "utf8"), components, demos);
    if (!changed) continue;
    stale += changed;
    if (check) {
      console.error(`[readme-counts] ${file} 有 ${changed} 处计数滞后`);
      continue;
    }
    writeFileSync(path, text);
    console.log(`[readme-counts] ${file} 已同步 ${changed} 处`);
  }
  if (check && stale) {
    console.error(`[readme-counts] 跑 \`pnpm readme:sync\` 修正，别手改（GitHub About 也要跟着改）`);
    process.exitCode = 1;
    return;
  }
  console.log(`[readme-counts] 组件 ${components} · demo ${demos}${stale ? "" : " · 已一致"}`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) main();
