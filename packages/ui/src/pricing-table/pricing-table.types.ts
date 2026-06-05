import type { ReactNode } from "react";

export interface PricingColumn {
  /** 列唯一 key，与 row.values 的键对应。 */
  key: string;
  /** 列标题（被比项名，如模型名）。 */
  title: ReactNode;
  /** 高亮列（描边 + 角标位）。 */
  highlight?: boolean;
  /** 高亮角标内容（如「推荐」「最佳性价比」）。 */
  badge?: ReactNode;
  /** 列头富内容（如 logo + 副标题），提供则替换 title 区。 */
  header?: ReactNode;
}

export interface PricingRow {
  /** 行唯一 key。 */
  key: string;
  /** 行标签（属性名，首列）。 */
  label: ReactNode;
  /** 各列单元格内容，键为 column.key。 */
  values: Record<string, ReactNode>;
}

export interface PricingTableProps {
  columns: PricingColumn[];
  rows: PricingRow[];
  /** 表头吸顶，默认 true。 */
  stickyHeader?: boolean;
  className?: string;
}
