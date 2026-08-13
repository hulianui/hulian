import type { Header, HeaderGroup } from "@tanstack/react-table";
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
/**
 * 表头行的跨度编排（多级表头 / 分组列）。
 *
 * TanStack 的 `getHeaderGroups()` 给的是**矩形**结构：每行都铺满全部叶子列，
 * 跨列靠 `header.colSpan`，跨行靠「上层放 `isPlaceholder` 的空格子」。照着它逐格渲染
 * 而不落 `colSpan`，一个横跨 4 列的组名就只占 1 格，上下两行格子数对不上，整排歪掉（#261）。
 *
 * 这里做两件事：
 * 1. **落 colSpan**：直接取 `header.colSpan`。
 * 2. **把 placeholder 换成真正的 rowSpan**：分组列与独立列混排时（一部分列在组里、
 *    一部分不在），独立列的名字被 TanStack 排在最底行、上面留一格空表头。改为在它
 *    第一次出现的那行渲染真名并纵向跨满，与 Element Plus / Ant Design 的观感一致。
 *
 * 为什么不直接用 `header.rowSpan`：TanStack v8 里那个字段**恒为 0**（叶子 rowSpan 起点是 0，
 * 分组取子节点的 min，于是整棵树都是 0）——它没有实现跨行语义，跨行是用 placeholder 表达的。
 * 照抄 `rowSpan={header.rowSpan > 1 ? … : undefined}` 只会得到一段永远不生效的死代码。
 */
export function planHeaderRows<TData>(
  groups: HeaderGroup<TData>[],
): { header: Header<TData, unknown>; colSpan: number; rowSpan: number }[][] {
  const lifted = new Set<string>(); // 已被上层格子接管的 column.id，下层不再出格
  return groups.map((hg, rowIndex) =>
    hg.headers.flatMap((header) => {
      const id = header.column.id;
      if (lifted.has(id)) return [];
      if (header.isPlaceholder) {
        // placeholder 一旦出现就会连到底行（该列在这些层级上没有祖先分组），
        // 故这一格纵向跨到底，并接管同列在下面各行的真实 header。
        lifted.add(id);
        return [{ header, colSpan: header.colSpan, rowSpan: groups.length - rowIndex }];
      }
      return [{ header, colSpan: header.colSpan, rowSpan: 1 }];
    }),
  );
}
