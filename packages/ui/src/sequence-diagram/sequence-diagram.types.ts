import type { HTMLAttributes, Ref } from "react";

/** 一条生命线的主人：服务、角色或系统。 */
export interface SequenceParticipant {
  /** 稳定 id，消息和注释靠它引用这一列。重复时只认第一次出现的那个。 */
  id: string;
  /** 显示在列头的名称，也是读屏里「谁发给谁」的那个名字。 */
  label: string;
  /** 列头第二行的补充说明，如「Node 服务」。 */
  description?: string;
}

/**
 * 消息种类：
 * - `sync` 同步调用：实线 + 实心三角箭头
 * - `async` 异步消息：实线 + 开口箭头
 * - `reply` 返回：虚线 + 开口箭头，颜色更淡
 */
export type SequenceMessageKind = "sync" | "async" | "reply";

/** 一条消息。`from === to` 时画成自调用的回环。 */
export interface SequenceMessage {
  /** 可省略；写 `"message"` 只是为了和注释对称。 */
  type?: "message";
  id: string;
  from: string;
  to: string;
  label: string;
  /** 默认 `sync`。 */
  kind?: SequenceMessageKind;
}

/**
 * 一条注释，和消息排在同一条时间轴上，占自己的一行。
 * - `over: "a"`：贴在参与者 a 的生命线上
 * - `over: ["a", "c"]`：横跨 a 与 c 两条生命线之间（顺序无所谓）
 */
export interface SequenceNote {
  type: "note";
  id: string;
  over: string | readonly [string, string];
  label: string;
}

/** `messages` 数组里的一项：消息或注释。 */
export type SequenceItem = SequenceMessage | SequenceNote;

/**
 * 被丢弃的输入。组件不画它们（不会画到错的列上），开发环境下在控制台告警一次。
 * - `duplicate-participant`：参与者 id 重复，后出现的那个不成列
 * - `duplicate-item`：消息 / 注释 id 重复，后出现的那条不画
 * - `unknown-participant`：消息 / 注释引用了不存在的参与者 id（`ref`），这条不画
 */
export interface SequenceIssue {
  code: "duplicate-participant" | "duplicate-item" | "unknown-participant";
  /** 出问题的那一项在 `participants`（duplicate-participant）或 `messages` 里的下标。 */
  index: number;
  /** 出问题的那一项自己的 id。 */
  id: string;
  /** unknown-participant 时，引用到的那个不存在的参与者 id。 */
  ref?: string;
}

export interface SequenceDiagramProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 按数组顺序从左到右。 */
  participants: SequenceParticipant[];
  /**
   * 消息与注释，按数组顺序自上而下 —— 顺序就是时间，组件不重排。
   * 无效项（重复 id、引用不存在的参与者）不画，见 `validateSequence`。
   */
  messages: SequenceItem[];
  /** 整张图的可访问名称。缺省用本地化的「时序图」。 */
  title?: string;
  /** 在每条消息前显示序号（注释不编号）。默认 false。 */
  autoNumber?: boolean;
  /** 高亮当前这一步（如逐步讲解时），并标 `aria-current="step"`。消息或注释的 id 都行。 */
  activeId?: string | null;
  /** 每列最小宽度（px）。列数多于容器能放下时横向滚动。默认 160。 */
  minColumnWidth?: number;
  /** 落在根 `<figure>`（也是横向滚动容器）上。 */
  ref?: Ref<HTMLElement>;
}
