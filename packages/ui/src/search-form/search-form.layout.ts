import type { SearchField } from "./search-form.types";

export interface LayoutPlan {
  /** 折叠时实际渲染的字段子集（展开时即全部）。 */
  visible: SearchField[];
  /** 操作区 grid 起列（1-based；end 恒 -1）。 */
  actionStart: number;
  /** 字段恰好填满整行 → 操作区另起一行右对齐。 */
  actionFullRow: boolean;
}

const spanOf = (f: SearchField, columns: number) => Math.min(f.colSpan ?? 1, columns);

/** 字段累计跨度（每字段 span 封顶 columns）。 */
export function totalSpan(fields: SearchField[], columns: number): number {
  return fields.reduce((sum, f) => sum + spanOf(f, columns), 0);
}

/** 是否需要折叠：操作区恒占 ≥1 格，字段累计跨度 > columns-1 才折。 */
export function canCollapse(fields: SearchField[], columns: number): boolean {
  return totalSpan(fields, columns) > columns - 1;
}

/** 算折叠可见字段集 + 操作区起列。纯函数（零 React），jsdom 无关可单测。 */
export function planLayout(fields: SearchField[], columns: number, collapsed: boolean): LayoutPlan {
  let visible = fields;
  if (collapsed) {
    const picked: SearchField[] = [];
    let used = 0;
    for (const f of fields) {
      const s = spanOf(f, columns);
      if (used + s > columns - 1) break; // 留 ≥1 格给操作区
      picked.push(f);
      used += s;
    }
    visible = picked;
  }
  let used = 0;
  for (const f of visible) used += spanOf(f, columns);
  const rem = used % columns;
  const actionFullRow = rem === 0 && visible.length > 0;
  const actionStart = actionFullRow ? 1 : rem + 1;
  return { visible, actionStart, actionFullRow };
}
