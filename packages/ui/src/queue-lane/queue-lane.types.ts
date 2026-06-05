import type { ReactNode } from "react";

/** 泳道定义（按优先级 / 分类划分的一条有序队列）。 */
export interface QueueLaneDef {
  /** 泳道标识（与 item.laneId 对应）。 */
  id: string;
  /** 道头主标题。 */
  label: ReactNode;
  /**
   * 道头左色条的语义色（CSS 颜色值或 token 变量，如 `var(--chart-3)` / `#ef4444`）。
   * 缺省不染色条。组件原样写入 inline style，不做枚举映射 —— 调用方决定优先级配色。
   */
  tone?: string;
  /** 道头附加元信息（如平均等待 / 吞吐指标），渲染在条数右侧。 */
  meta?: ReactNode;
}

/** 队列项。FIFO 顺序 = items 数组给定顺序（由调度器决定，非人工拖拽）。 */
export interface QueueItem {
  /** 全局唯一稳定 id。 */
  id: string;
  /** 所属泳道 id（须命中某 lane，否则该项被丢弃）。 */
  laneId: string;
  [k: string]: unknown;
}

/** groupByLane 输出的单道分组：泳道定义 + 该道有序队列。 */
export interface QueueLaneGroup<T extends QueueItem = QueueItem> {
  lane: QueueLaneDef;
  items: T[];
}

export interface QueueLaneProps<T extends QueueItem = QueueItem> {
  /** 泳道定义（顺序即展示顺序）。 */
  lanes: QueueLaneDef[];
  /** 受控队列项数组；组件按 laneId 分组，道内顺序 = 数组原始顺序（FIFO）。 */
  items: T[];
  /** 渲染单个队列项；index 为该项在所属道内的队列位次（0 = 队首）。 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 自定义道头（拿到该道队列做指标聚合）。缺省渲染 lane.label + 条数 + lane.meta。 */
  renderLaneHeader?: (lane: QueueLaneDef, items: T[]) => ReactNode;
  /** 每道最多直显条数；超出折叠为「还有 N 条」。缺省不折叠（全显）。 */
  maxVisible?: number;
  /** 泳道排布方向。默认 "horizontal"：泳道横向并列，每道竖向排队。 */
  orientation?: "horizontal" | "vertical";
  /** 点击队列项回调（卡片只读，仅用于查看 / 下钻，不改变队列顺序）。 */
  onItemClick?: (item: T) => void;
  className?: string;
}
