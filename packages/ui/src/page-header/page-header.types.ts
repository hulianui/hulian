import type { ElementType, HTMLAttributes, ReactNode } from "react";

/** `meta` 这一串的位置：标题行下方自成一行（默认），或接在 `subTitle` 后面同一行。 */
export type PageHeaderMetaPlacement = "block" | "inline";

// title 为 ReactNode → 与 HTMLAttributes 的 title?:string 冲突，必须 Omit "title"
// （同 Alert/Empty/BentoCard 的复发坑）。
export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 主标题（必填）。 */
  title: ReactNode;
  /**
   * 标题渲染成哪个标签，默认 `h1`。
   *
   * 「这一屏的标题排第几级」是页面的结构信息，不归页头皮肤：页头未必是本页最高级标题，
   * 而且消费方的标题常常是自带动画的组件、需要它自己就是那个标签
   * （套在 `h1` 里既是非法 HTML，也会让读屏读出两条 heading）——hulianui/hulian#247。
   *
   * 只让出标签，不让出字号：字号仍由组件定，要改在外层 `className` 上用后代选择器回贴
   * （标签是消费方回贴不了的那个，字号不是）。
   * @default "h1"
   */
  titleAs?: ElementType;
  /** 副标题，内联于标题右侧，中性弱化色。 */
  subTitle?: ReactNode;
  /** 提供则在标题左侧渲染返回箭头按钮，点击触发该回调（带回调 → 消费侧为 client）。 */
  onBack?: () => void;
  /** 返回按钮的无障碍标签，默认「返回」。 */
  backLabel?: string;
  /** 面包屑区（位于标题行上方）。直接 dogfood 传入瑚琏 <Breadcrumb/>。 */
  breadcrumb?: ReactNode;
  /** 状态标签区（贴标题右侧）。传入瑚琏 <Chip/>/<Badge/> 等。 */
  tags?: ReactNode;
  /** 右侧操作区（按钮组等）。窄屏自动换行到标题下方。 */
  extra?: ReactNode;
  /**
   * 元信息行：标题下面那串用分隔符串起来的事实值（证件号 · 性别 · 3 段社保 · 2 家公司…）。
   *
   * 与 `subTitle`（一句话）、`tags`（状态标记）、`footer`（页头最下方）都不是一回事。
   * 分隔符由组件插在项与项之间，**空项自动跳过**（`null` / `undefined` / `false` / `""`），
   * 因此某一项缺值时不会留下孤零零一个分隔符 —— 这正是消费方用 `span + span::before`
   * 拼中点要绕开的那件事（hulianui/hulian#240）。数字 `0` 是事实值，不算空。
   */
  meta?: ReactNode[];
  /**
   * 这一串放哪（#357 —— #240 解决了「有没有 meta」，这条是「放哪」）：
   *
   * · `"block"`（默认）—— 标题行**下面**自成一行。项多、或某项本身就是一句短语时用它。
   * · `"inline"` —— 接在 `subTitle` 后面、与标题同一行。两三个短事实值（`4 章` · `0 题` ·
   *   `原件 105MB`）用它：这些值本来就与 `subTitle` 同字号同色、视觉上就是一串，
   *   另起一行只是把页头拉高一档、把正文挤下去。
   *
   * 两档的语义完全一样：仍是 `ul`/`li`、仍自动跳过空项、分隔符仍是 `aria-hidden` 装饰位。
   * 换句话说，不必再为了排成一行而把版本名和事实值 `join(" · ")` 塞进 `subTitle`——
   * 那一拼，列表语义、空项跳过、装饰位分隔符就全丢了。
   * @default "block"
   */
  metaPlacement?: PageHeaderMetaPlacement;
  /** `meta` 各项之间的分隔符，默认 `"·"`。装饰位，自动 `aria-hidden`。 */
  metaSeparator?: ReactNode;
  /** 底部附加区，常放 <Tabs/>。 */
  footer?: ReactNode;
  /** 是否在页头底部渲染分隔线（复用瑚琏 <Separator/>），默认 false。 */
  bordered?: boolean;
}
