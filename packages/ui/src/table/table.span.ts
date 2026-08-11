import type { TableCellSpan } from "./table.types";

/** 计算结果：需要写 rowSpan/colSpan 的格子，以及被覆盖、不该渲染的格子。 */
export interface CellSpanPlan {
  /** key = `${rowIndex}:${colIndex}`，值为真正要落到 `<td>` 上的跨度（至少一维 > 1）。 */
  spans: Map<string, { rowSpan: number; colSpan: number }>;
  /** key 同上：被前面的格子盖住（或被显式判 0），该格不渲染。 */
  hidden: Set<string>;
}

export const spanKey = (rowIndex: number, colIndex: number) => `${rowIndex}:${colIndex}`;

/**
 * 把「每格返回多大跨度」翻译成「哪些格子写 rowSpan/colSpan、哪些格子不渲染」。
 *
 * 纯函数（不碰 DOM、不碰 TanStack），因为这是合并唯一容易出错的地方：
 * 覆盖关系一旦算错，表格会多出或少掉整列，而那种错在肉眼上表现为「整张表错位」，
 * 很难从渲染层的代码里读出来。
 *
 * 规则：
 * - 按行、再按列顺序推进；**已被覆盖的格子不再回调** `get`（所以消费方不必自己判断「我是不是被合掉的那格」）。
 * - `rowSpan` / `colSpan` 缺省为 1；小于 1（含 el-table 那套 `0` = 不渲染的写法）即判该格不渲染。
 * - 跨度按剩余行/列数封顶：返回 999 也不会越界画出表外。
 */
export function planCellSpans(
  rowCount: number,
  colCount: number,
  get: (rowIndex: number, colIndex: number) => TableCellSpan | void | undefined,
): CellSpanPlan {
  const spans = new Map<string, { rowSpan: number; colSpan: number }>();
  const hidden = new Set<string>();

  for (let r = 0; r < rowCount; r += 1) {
    for (let c = 0; c < colCount; c += 1) {
      const key = spanKey(r, c);
      if (hidden.has(key)) continue;

      const result = get(r, c) ?? {};
      const rawRow = result.rowSpan ?? 1;
      const rawCol = result.colSpan ?? 1;

      // 0 / 负数 = 这格不渲染（对齐 el-table 的 `[0, 0]` 与 antd 的 `colSpan: 0`）。
      // 正常写法只在首格给跨度，覆盖由上面的 hidden 自动推导，用不到这一支。
      if (rawRow < 1 || rawCol < 1) {
        hidden.add(key);
        continue;
      }

      const rowSpan = Math.min(Math.floor(rawRow), rowCount - r);
      const colSpan = Math.min(Math.floor(rawCol), colCount - c);
      if (rowSpan > 1 || colSpan > 1) {
        spans.set(key, { rowSpan, colSpan });
        for (let dr = 0; dr < rowSpan; dr += 1) {
          for (let dc = 0; dc < colSpan; dc += 1) {
            if (dr === 0 && dc === 0) continue;
            hidden.add(spanKey(r + dr, c + dc));
          }
        }
      }
    }
  }

  return { spans, hidden };
}
