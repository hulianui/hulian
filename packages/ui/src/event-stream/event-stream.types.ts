import type { ReactNode } from "react";

/**
 * 事件语义色。刻意用中性语义名而非具体业务词（如 allow/deny），
 * 这样审计流、CI 流水线、告警流都能直接复用。
 */
export type EventStreamTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface EventStreamItem {
  /** 全局唯一稳定 id。live 模式靠它判断哪些是新条目。 */
  id: string | number;
  /** 时间显示串。组件不做格式化 —— 时区与精度是调用方的领域知识。 */
  ts: ReactNode;
  /** 语义色。缺省 "neutral"（不染色，只占位保持左缘对齐）。 */
  tone?: EventStreamTone;
  /** 主标题，一行内说清"发生了什么"。 */
  title: ReactNode;
  /** 次要说明。默认折起，展开后显示。 */
  detail?: ReactNode;
  /** 尾部元信息（耗时 / 来源 / 编号），右对齐。 */
  meta?: ReactNode;
  /**
   * 该条已被人工覆盖/放行。渲染为标题旁的标记 + 一行覆盖说明，
   * 让"曾被拦但放行了"与"从未被拦"在视觉上可区分 —— 这是审计场景的刚需。
   */
  overridden?: ReactNode;
}

export interface EventStreamProps {
  /** 事件数组。顺序即展示顺序，组件不排序（时间语义由调用方掌握）。 */
  items: EventStreamItem[];
  /** 滚动容器最大高度。给了才出现内部滚动，否则随内容撑开。 */
  maxHeight?: number | string;
  /** 空态文案。 */
  emptyText?: ReactNode;
  /** 点击某条的回调。给了才有可点击态（cursor / focus ring / 键盘可达）。 */
  onItemClick?: (item: EventStreamItem) => void;
  /**
   * 实时模式：本次渲染新出现的 id 会淡入高亮一次。
   * 关掉时列表变化无动画，适合一次性回放历史。
   */
  live?: boolean;
  /** 时间轴与色点所在侧。默认 "left"。 */
  side?: "left" | "right";
  /** 默认展开全部 detail。缺省折起，点击标题切换。 */
  defaultExpanded?: boolean;
  className?: string;
}
