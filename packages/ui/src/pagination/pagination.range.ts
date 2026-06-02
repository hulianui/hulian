// 页码区间算法 —— 纯函数（零 React、零副作用，可独立单测）。
// 规则：首页(1) + 末页(total) + 当前页±siblingCount，升序去重；
// 相邻两段间隔 >1 页 → 插省略号；恰隔 1 页 → 直接补出那一页（"两段间隔 >1 才省略"）。
export type PaginationItem = number | "ellipsis";

export interface PaginationRangeOptions {
  /** 当前页（1 起）。越界自动夹紧到 [1, total] */
  page: number;
  /** 总页数 */
  total: number;
  /** 当前页左右各显示的页码数，默认 1 */
  siblingCount?: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export function getPaginationRange({
  page,
  total,
  siblingCount = 1,
}: PaginationRangeOptions): PaginationItem[] {
  if (!Number.isFinite(total) || total < 1) return [];
  const cur = clamp(Math.trunc(page), 1, total);
  const sib = Math.max(0, Math.trunc(siblingCount));

  // 必显页码集合：首页 + 末页 + 当前页±siblingCount（去重，夹在 [1,total] 内）
  const shown = new Set<number>([1, total]);
  for (let p = cur - sib; p <= cur + sib; p++) {
    if (p >= 1 && p <= total) shown.add(p);
  }

  const sorted = [...shown].sort((a, b) => a - b);
  const result: PaginationItem[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev) {
      if (p - prev === 2) result.push(prev + 1); // 恰隔 1 页 → 补出该页（不插省略号）
      else if (p - prev > 2) result.push("ellipsis"); // 隔 >1 页 → 省略号
    }
    result.push(p);
    prev = p;
  }
  return result;
}
