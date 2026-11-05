import type { HTMLAttributes, ReactNode } from "react";

// 取值顺序与 [Alert](../alert/alert.tsx) 一致（neutral/brand/info/success/warning/danger）。
// `info` 是后补的（#232）：`brand` 是主色，表达「这条和产品/主操作有关」；`info` 走独立的
// info 色（与主色差 30° 色相的青蓝），表达「这是中性事实说明」。这两个语义在 Alert 里自 #173
// tokens 补齐 `--color-info` 起就已经分家，那次统一没有延伸到 Tag —— 于是「当前处于什么模式」
// 这类行内标签只能在「灰得读不出来」和「紫得跟主 CTA 抢注意力」之间二选一。
export type TagTone = "neutral" | "brand" | "info" | "success" | "warning" | "danger";
export type TagVariant = "soft" | "solid" | "outline";

/**
 * 继承 span 的原生属性：状态标签经常要挂 `title` 做 hover 全文（短标签 + 完整值，
 * 典型如表格里显示「Word」而 title 是完整 MIME）、挂 `data-testid` 给 e2e、挂 `aria-*` 给读屏。
 * 封闭接口把这些全挡在外面，而同库的 Button / Card / Empty / Progress 都是继承的（#148）。
 */
export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** 视觉变体：soft 浅底（默认，最常用于状态标签）/ solid 实底 / outline 描边。 */
  variant?: TagVariant;
  /** 语气色：neutral 默认 / brand 与主操作有关 / info 中性说明 / success 成功 / warning 警告 / danger 错误。 */
  tone?: TagTone;
  /**
   * 分类色：与状态无关的「这属于哪一类」着色（渠道、业务线、文件类型、标签体系…），
   * 语义六档接不住十几二十种分类时用它。走 `resolveTone` —— 语义色名（`chart-2` / `primary` …）、
   * 任意 CSS 颜色（`#7c3aed` / `oklch(...)`）或 `var(--color-*)` 都收，与 `Dot.color` /
   * `Brand.color` / `ChartSeries.color` 同一条路径。
   *
   * 三档 variant 都从这一个色派生（soft 12% 底、outline 描边、solid 实底），自动吃明暗主题。
   * 与 `tone` 同时传时 `color` 优先（`tone` 是语义快捷方式）。极浅的分类色建议配 soft / outline，
   * 实底用的是 `primary-foreground` 前景，浅底上白字会偏弱。
   */
  color?: string;
  size?: "sm" | "md";
  /** 前导状态圆点（颜色随 tone）。与 icon 互斥：icon > dot。 */
  dot?: boolean;
  /** 圆点呼吸动画（processing 进行态语义）。仅在 dot 为真时生效。 */
  pulse?: boolean;
  /** 前导图标槽（状态图标等），存在时不渲染 dot。 */
  icon?: ReactNode;
  /** 提供则渲染关闭(×)按钮，点击触发该回调。 */
  onClose?: () => void;
  /** 禁用：降透明度、屏蔽指针事件、关闭按钮不可点。 */
  isDisabled?: boolean;
  className?: string;
  children?: ReactNode;
}
