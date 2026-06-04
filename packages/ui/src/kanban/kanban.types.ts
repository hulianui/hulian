import type { ReactNode } from "react";

/** 看板列定义。 */
export interface KanbanColumn {
  /** 列标识（与卡片 getColumnId 返回值对应）。 */
  id: string;
  /** 列头主标题（renderColumnHeader 缺省时展示）。 */
  title: ReactNode;
  /** 覆盖整列头（含自定义统计），优先于 title。 */
  header?: ReactNode;
  /** 列底部区（如「+ 新建」按钮）。 */
  footer?: ReactNode;
}

/** 拖拽落定事件：跨列或列内重排都触发。toIndex = 目标列内（已剔除被拖卡片后）的插入下标。 */
export interface KanbanMoveEvent {
  id: string;
  fromColumn: string;
  toColumn: string;
  toIndex: number;
}

export interface KanbanProps<T> {
  /** 列定义（顺序即展示顺序）。 */
  columns: KanbanColumn[];
  /** 受控卡片数组；组件按 getColumnId 分桶到各列，列内顺序 = 数组原始顺序。 */
  items: T[];
  /** 取卡片稳定 id（须全局唯一且稳定）。 */
  getId: (item: T) => string;
  /** 取卡片当前所属列 id。 */
  getColumnId: (item: T) => string;
  /** 拖拽落定回调。组件不直接改 T（避免越界写业务字段），由消费者据此改自身状态。 */
  onMove: (e: KanbanMoveEvent) => void;
  /** 渲染单张卡片；state.dragging 表示该卡正被拖拽。 */
  renderItem: (item: T, state: { dragging: boolean }) => ReactNode;
  /** 自定义列头（拿到该列卡片做统计）。缺省渲染 column.header ?? column.title。 */
  renderColumnHeader?: (column: KanbanColumn, items: T[]) => ReactNode;
  className?: string;
  columnClassName?: string;
}
