// 分支着色：把分支名映射到一个语义色名（喂给 resolveTone → var(--color-*)）。
// 让部署列表 / PR 列表里不同分支一眼可分。规则：
//   1) 主干分支（main / master / trunk / release*）→ success（绿，最稳）
//   2) 约定式前缀按类型固定取色：feat→chart-1 / fix→warning / hotfix→danger /
//      perf→chart-4 / refactor→chart-5 / chore·ci·build·docs→chart-3 / style→chart-6
//   3) 其余分支按名称稳定哈希落到 chart-1..6（同名永远同色）。

/** 语义色名（交给 resolveTone 解析成带 --color- 前缀的 CSS 变量）。 */
export type BranchTone =
  | "success"
  | "warning"
  | "danger"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6";

const HASH_POOL: BranchTone[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
];

const PREFIX_TONE: Record<string, BranchTone> = {
  feat: "chart-1",
  feature: "chart-1",
  fix: "warning",
  bugfix: "warning",
  hotfix: "danger",
  perf: "chart-4",
  refactor: "chart-5",
  chore: "chart-3",
  ci: "chart-3",
  build: "chart-3",
  docs: "chart-3",
  test: "chart-2",
  style: "chart-6",
};

const TRUNK = new Set(["main", "master", "trunk", "develop", "dev"]);

/** djb2 字符串哈希（确定性，跨渲染稳定）。 */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return h >>> 0;
}

/** 把分支名解析为一个语义色名（稳定、可单测）。 */
export function branchTone(branch: string): BranchTone {
  const name = branch.trim().toLowerCase();
  if (!name) return "chart-1";
  if (TRUNK.has(name) || name.startsWith("release")) return "success";
  const prefix = name.split("/")[0];
  const mapped = PREFIX_TONE[prefix];
  if (mapped) return mapped;
  return HASH_POOL[hash(name) % HASH_POOL.length];
}
