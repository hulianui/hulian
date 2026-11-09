import type { HTMLAttributes } from "react";

/** 一条生命线的主人：服务、角色或系统。 */
export interface SequenceParticipant {
  id: string;
  /** 显示在列头的名称，也是读屏里「谁发给谁」的那个名字。 */
  label: string;
  /** 列头第二行的补充说明，如「Node 服务」。 */
  description?: string;
}

/**
 * 消息种类：
 * - `sync` 同步调用：实线 + 实心箭头
 * - `async` 异步消息：实线 + 开口箭头
 * - `reply` 返回：虚线 + 开口箭头，颜色更淡
 */
export type SequenceMessageKind = "sync" | "async" | "reply";

/** 一条消息，按数组顺序自上而下排列。`from === to` 时画成自调用的回环。 */
export interface SequenceMessage {
  id: string;
  from: string;
  to: string;
  label: string;
  /** 默认 `sync`。 */
  kind?: SequenceMessageKind;
}

export interface SequenceDiagramProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  participants: SequenceParticipant[];
  /** 引用了不存在参与者的消息不画，也不进读屏列表。 */
  messages: SequenceMessage[];
  /** 整张图的可访问名称。缺省用本地化的「时序图」。 */
  title?: string;
  /** 在每条消息前显示序号。默认 false。 */
  autoNumber?: boolean;
  /** 高亮当前这一步（如逐步讲解时），并标 `aria-current="step"`。 */
  activeId?: string | null;
  /** 每列最小宽度（px）。列数多于容器能放下时横向滚动。默认 160。 */
  minColumnWidth?: number;
}
