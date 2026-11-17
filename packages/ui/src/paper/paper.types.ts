import type { ElementType, HTMLAttributes, ReactNode, Ref, SVGAttributes } from "react";

/**
 * 论文的呈现形态：
 * - `read` 阅读：图可以交互，正文引用会把图切到对应状态
 * - `print` 打印 / 投稿：每张图定格在打印态，交互控件不渲染，分图展开
 *
 * 浏览器真正打印时（`beforeprint`）`Paper` 会临时切到 `print`，打印完（`afterprint`）切回。
 */
export type PaperMode = "read" | "print";

/** 属于论文内容的文字。论文的语言可以和界面语言不同（中文界面里排英文论文）。 */
export interface PaperContentLabels {
  /** 图号前的词，如 "Figure"、"图"。 */
  figure?: string;
  /** 图号与图注之间的文字，如 ": "、"："。 */
  separator?: string;
}

export interface PaperProps extends HTMLAttributes<HTMLElement> {
  /** 渲染的容器标签，默认 `article`。 */
  as?: ElementType;
  /** 受控形态。 */
  mode?: PaperMode;
  /** 非受控初始形态，默认 `read`。 */
  defaultMode?: PaperMode;
  /** 形态变化（含浏览器打印前后的自动切换不算：那一次不回调，打印完会自动还原）。 */
  onModeChange?: (mode: PaperMode) => void;
  /**
   * 图注前缀和自动引用文字。默认跟随 `ConfigProvider` 的界面语言（「图 1：」/ "Figure 1: "），
   * 论文语言和界面不同时在这里指定。步骤按钮等控件文字仍跟随界面语言。
   */
  labels?: PaperContentLabels;
  ref?: Ref<HTMLElement>;
}

/** 交给图内容和控件的句柄。 */
export interface FigureRenderContext<S> {
  /** 当前要画的状态值。打印形态下是打印态（或分图各自的状态）。 */
  state: S;
  /** 当前状态对应的预设名；状态是用 `setState` 直接给的值时为 `null`。 */
  stateKey: string | null;
  /** 切到某个预设。 */
  select: (key: string) => void;
  /** 直接给一个状态值（如滑块拖到的参数）。 */
  setState: (state: S) => void;
  mode: PaperMode;
}

export interface PaperFigureProps<S>
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "title" | "id"> {
  /** 图的稳定 id，`FigRef` 的 `to` 靠它找图；同时落在根 `<figure>` 的 `id` 上，可作锚点。 */
  id: string;
  /**
   * 有名字的状态预设，键是预设名。正文引用、打印态、分图都只引用预设名。
   * 对象键的书写顺序就是这张图「一步步讲」的顺序。
   */
  states: Readonly<Record<string, S>>;
  /** 初始预设，默认 `states` 的第一个键。 */
  defaultState?: string;
  /** 打印形态下主图用的预设，默认同 `defaultState`。 */
  printState?: string;
  /** 打印形态下在主图下方按顺序展开成 (a)(b)(c)… 分图的预设。 */
  printSubfigures?: readonly string[];
  /** 图注正文（不含「图 1：」前缀，编号自动）。 */
  caption: ReactNode;
  /** 图注第二行：说明当前状态。返回空则不占行。 */
  describe?: (state: S, key: string | null) => ReactNode;
  /** 分图的小标题，默认 `(a)`、`(b)`… 加 `describe` 的结果。 */
  subfigureLabel?: (key: string, index: number) => ReactNode;
  /**
   * 画图。**只能由 `state` 决定画成什么样**：打印分图就是同一个函数在不同状态下各调一次，
   * 函数里藏的内部状态在分图里不会出现。
   */
  children: (state: S, figure: FigureRenderContext<S>) => ReactNode;
  /** 图下方的交互控件（阅读形态才渲染，打印形态和 `@media print` 下都不出现）。 */
  controls?: (figure: FigureRenderContext<S>) => ReactNode;
  /** 状态变化回调：用户操作、`FigRef` 跳转都会触发。 */
  onStateChange?: (state: S, key: string | null) => void;
  ref?: Ref<HTMLElement>;
}

/** `ProcessFigure` 的一步。 */
export interface ProcessStep {
  /** 预设名，`FigRef state` 和 `FigureStep at` 都用它。不要用保留名 `"all"`。 */
  key: string;
  /** 短名，用在步骤按钮的提示、分图小标题。 */
  label: string;
  /** 这一步的说明，显示在图注第二行。 */
  description?: ReactNode;
}

export interface ProcessFigureProps
  extends Omit<
    PaperFigureProps<string>,
    "states" | "children" | "controls" | "describe" | "printState" | "printSubfigures"
  > {
  /** 按讲解顺序排列的步骤。 */
  steps: readonly ProcessStep[];
  /** 是否有「全部」状态（预设名 `"all"`：每一部分都亮着）。默认 true，且是默认打印态。 */
  overview?: boolean;
  /** 「全部」状态的说明，显示在图注第二行。 */
  overviewDescription?: ReactNode;
  /** 打印态，默认有 overview 时为 `"all"`，否则为最后一步。 */
  printState?: string;
  /** 打印分图，默认每一步各一张；传 `[]` 不展开。 */
  printSubfigures?: readonly string[];
  /** 自动播放每步停留的毫秒数，默认 2200。 */
  interval?: number;
  /** 图本身，一般是一张用 `FigureStep` 标好各部分属于哪一步的 SVG。 */
  children: ReactNode;
}

/** 当前步与某一部分的关系。 */
export type FigureStepPhase = "on" | "done" | "off" | "all";

export interface FigureStepProps extends SVGAttributes<SVGGElement> {
  /** 这一部分属于哪一步（可以属于几步）。 */
  at: string | readonly string[];
}

export interface FigRefProps extends Omit<HTMLAttributes<HTMLAnchorElement>, "href"> {
  /** 目标图的 id。 */
  to: string;
  /** 要切到的预设名；不传只跳到图，不改状态。 */
  state?: string;
  /** 引用文字；不传时自动生成「图 N」。 */
  children?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}
