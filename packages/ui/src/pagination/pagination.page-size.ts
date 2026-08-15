// 换页长之后的页码归位 —— 纯函数（零 React、零副作用，可独立单测）。
//
// 抽出来的原因和 pagination.range.ts 一样：这段数学在 jsdom 里够不着 —— Base UI Select 的浮层
// 在 jsdom 下打不开（实测点 Trigger 后 aria-expanded 恒为 false、role=option 数为 0），
// 于是「切档 → 页码怎么走」只能靠纯函数直接验，不能靠点选项间接验。
//
// 归位规则（#271）：夹到新的末页，而不是回第 1 页。用户切大页长是为了「先粗扫再筛」，
// 把他扔回开头等于丢掉他已经翻到的位置；夹到末页至少还在同一段数据附近。

export interface PageAfterPageSizeChangeOptions {
  /** 切档前的当前页（1 起，可越界，函数内自己夹）。 */
  page: number;
  /** 新的每页条数。 */
  pageSize: number;
  /** 总条数。缺席时算不出新页数。 */
  totalItems?: number;
  /** 总页数。给了它就说明页数不由 pageSize 决定，切档不该动页码。 */
  total?: number;
}

/**
 * 切换每页条数后应该跳到第几页；返回 `null` = 不必补发 `onPageChange`。
 *
 * 返回 `null` 的两种情形本质不同，但对调用方是同一个动作（别动页码）：
 *  · 当前页在新范围内 —— 归位无必要；
 *  · 只给了 `total`（总页数）—— 新页数根本算不出来，猜一个错的比不动更糟。
 */
export function pageAfterPageSizeChange({
  page,
  pageSize,
  totalItems,
  total,
}: PageAfterPageSizeChangeOptions): number | null {
  if (total != null || totalItems == null) return null;
  if (!Number.isFinite(pageSize) || pageSize < 1) return null;
  const nextTotalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / Math.trunc(pageSize)));
  const current = Math.max(1, Math.trunc(page));
  return current > nextTotalPages ? nextTotalPages : null;
}
