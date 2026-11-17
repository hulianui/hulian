import type { ElementType, HTMLAttributes, ReactElement, ReactNode, Ref, SVGAttributes } from "react";

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
  /** `PaperHeader` 摘要的标题，如 "Abstract"、"摘要"。 */
  abstract?: string;
  /** `Bibliography` 的标题，如 "References"、"参考文献"。 */
  references?: string;
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
  /**
   * `PaperPresenter` 演示时这张图依次展示的预设，默认 `states` 的全部键（按书写顺序）。
   * 传 `[]` 表示演示时跳过这张图。
   */
  presentStates?: readonly string[];
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
  // presentStates 从 PaperFigureProps 继承：默认各步 + "all"（有 overview 时）。
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

/** 演示里的一页：哪张图的哪个预设。 */
export interface PresenterSlide {
  /** 图的 id。 */
  figure: string;
  /** 预设名。 */
  state: string;
}

export interface PaperPresenterProps {
  /** 受控：是否打开。 */
  open?: boolean;
  /** 非受控初始是否打开，默认 false。 */
  defaultOpen?: boolean;
  /** 打开 / 关闭（含 Esc、退出按钮）。 */
  onOpenChange?: (open: boolean) => void;
  /**
   * 打开演示的按钮，如 `<Button>演示</Button>`。关闭后焦点回到它身上。
   * 不传时用 `open` 受控打开，焦点回到打开前聚焦的元素。
   */
  trigger?: ReactElement;
  /** 演示页眉左侧的标题，一般是论文题目。 */
  title?: ReactNode;
  /**
   * 整组幻灯片。默认按文档顺序串起每张图的 `presentStates`
   * （`PaperFigure` 默认全部预设，`ProcessFigure` 默认各步 + 全部）。
   * 不存在的图或预设开发环境告警一次并跳过。
   */
  slides?: readonly PresenterSlide[];
  /** 是否在演示里渲染图自带的控件（步骤按钮、参数开关）。默认 true。 */
  controls?: boolean;
  /** 翻到某一页时触发（含打开时的第一页）。 */
  onSlideChange?: (slide: PresenterSlide, index: number) => void;
  /** 加在全屏层根元素上。 */
  className?: string;
}

/** `exportFigureSvg` 的选项。 */
export interface FigureSvgExportOptions {
  /**
   * 按哪套主题出色。默认 `"light"`：投稿要白纸上的图，读者开着暗色也导出亮色。
   * `"current"` 按页面此刻的主题。
   */
  theme?: "light" | "current";
  /** 底色，任意 CSS 颜色（导出时换算成十六进制）。默认透明。 */
  background?: string;
  /** 输出 SVG 的 `width`（px），高度按 `viewBox` 比例。默认等于 `viewBox` 的宽。 */
  width?: number;
}

export interface PaperExport {
  /**
   * 把图 `id` 的预设 `stateKey` 画成一份独立的 SVG 文本：样式内联成表现属性，颜色换成十六进制，
   * 不依赖页面的 CSS。正文里的图不受影响。
   *
   * 图找不到、预设不存在、图的画面不是单独一个 `<svg>`（如 canvas、HTML）时 reject。
   */
  exportFigureSvg: (id: string, stateKey: string, options?: FigureSvgExportOptions) => Promise<string>;
}

/** `usePaperTerm` 的返回值。 */
export interface PaperTermBinding {
  /** 这一项此刻是否高亮（公式里悬停 / 聚焦了它，或别的绑定控件正被悬停 / 聚焦）。 */
  active: boolean;
  /**
   * 展开到控件上：悬停 / 聚焦时让公式里的这一项亮起来。
   * 高亮时带 `data-active`，可以用 `data-[active]:` 写样式。
   */
  bind: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    "data-paper-term": string;
    "data-active"?: "";
  };
}

/** `PaperEquation` 里一个可交互的项。 */
export interface EquationTerm {
  /** 读屏名和悬停提示，说清点了会怎样，如「√d_k：切换图 2 的缩放」。 */
  label: string;
  /** 点击时驱动的图 id。不传则这一项只做高亮联动，不能点。 */
  figure?: string;
  /**
   * 点击后图的状态：预设名，或由图的当前状态算出新状态的函数（如开关取反）。
   * 不传时点击只滚到图并描边。
   */
  state?: string | ((current: unknown) => unknown);
}

export interface PaperEquationProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * 整条公式的 LaTeX（数学模式，不用包 `$`）。用 `\term{name}{…}` 标出可交互的项，
   * name 只能是字母、数字、`_`、`-`：`\frac{QK^T}{\term{dk}{\sqrt{d_k}}}`。
   */
  children: string;
  /** `\term` 标出的各项，键是 name。 */
  terms?: Readonly<Record<string, EquationTerm>>;
  /** 右侧的公式编号，如 `1` 渲染成 `(1)`。 */
  number?: ReactNode;
  /** 块级排版，默认 true。 */
  display?: boolean;
  /** 自定义宏，透传给 KaTeX。`\term` 是保留名。提到模块级常量，避免每次渲染重排。 */
  macros?: Record<string, string>;
  ref?: Ref<HTMLDivElement>;
}

/** `PaperHeader` 里的一位作者。 */
export interface PaperAuthor {
  name: ReactNode;
  /** 单位，显示在姓名下方。 */
  affiliation?: ReactNode;
  /** 邮箱，显示在单位下方（等宽小字，不加 mailto 链接）。 */
  email?: string;
}

export interface PaperHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 论文题目。 */
  title: ReactNode;
  /** 题目的标签，默认 `h1`。 */
  titleAs?: ElementType;
  authors?: readonly PaperAuthor[];
  /** 作者下方的一行说明，如会议、日期、arXiv 号。 */
  meta?: ReactNode;
  /** 摘要正文。标题用 `labels.abstract`（跟随 `Paper` 的论文语言）。 */
  abstract?: ReactNode;
  ref?: Ref<HTMLElement>;
}

/** `Bibliography` 的一条文献。 */
export interface BibliographyEntry {
  /** 稳定 id，`Cite` 的 `to` 靠它找条目；同时是条目 `<li>` 的 DOM id（可作锚点）。 */
  id: string;
  /** 条目正文（作者、题目、出处）。 */
  content: ReactNode;
}

export interface BibliographyProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 按编号顺序排列的文献，第一条是 [1]。 */
  entries: readonly BibliographyEntry[];
  /** 标题，默认 `labels.references`；传 `null` 不渲染标题。 */
  title?: ReactNode;
  /** 标题的标签，默认 `h2`。 */
  titleAs?: ElementType;
  ref?: Ref<HTMLElement>;
}

export interface CiteProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** 引用的文献 id，可以是几条：`["he2016", "ba2016"]` 渲染成 `[5, 6]`。 */
  to: string | readonly string[];
  ref?: Ref<HTMLSpanElement>;
}
