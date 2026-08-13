import type { ComponentPropsWithRef, ElementType, MouseEventHandler, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

/**
 * 新字面从哪一侧翻上来。
 *
 * 四档互为对称：`top` 是新字面从上方压下来（旧字面向下翻走），`left` 是从左侧转过来，以此类推。
 * 名字说的是**新字面进入的方向**，不是旧字面离开的方向——两者恒好相反，取前者是因为读者的
 * 注意力落在新出现的那一面上。
 */
export type FlipDirection = "top" | "bottom" | "left" | "right";

/** 切分粒度，与 [SplitText](../split-text/split-text.md) 同一套取值。 */
export type FlipSplitType = "char" | "word";

export interface FlipTextOwnProps {
  /**
   * 标题内容。**收 `children` 而不是 `text: string`**（#254）：标题几乎总是变量或表达式
   * （`{templateName}` / `{name || "未命名客户"}`），要求先拼成字符串会把这类调用点全部挡在门外。
   *
   * 内部从 children 递归取纯文本再切分，所以**嵌套标记不会保留**：`<em>` / `<span>` 之类会被
   * 摊平成文字。真需要富文本标题，说明它不该逐字翻转。
   * 取不出任何文字时（比如 children 只有一个图标）不做切分，原样渲染 children。
   */
  children?: ReactNode;

  /** 新字面从哪一侧翻上来，默认 `"top"`。 */
  direction?: FlipDirection;

  /** 切分粒度：`char` 逐字（中文友好）/ `word` 逐词（按空白切，避免西文单词被拆断行）。默认 `"char"`。 */
  splitType?: FlipSplitType;

  /** 单字翻面时长（秒），默认 `0.5`。 */
  duration?: number;

  /** 相邻字的错峰毫秒，默认 `30`。等价于 [SplitText](../split-text/split-text.md) 的 `delay`。 */
  stagger?: number;

  className?: string;

  /**
   * 鼠标移入回调。本组件的翻转就挂在这个事件上，但它**先调用你传的这个**再触发翻转，
   * 不会把它顶掉。
   */
  onMouseEnter?: MouseEventHandler<HTMLElement>;
}

/**
 * `as` 参与类型推导（hulianui/hulian#62）。
 *
 * 这一条对本件是刚需而不是锦上添花：它渲染的几乎总是页面主标题，必须**自己就是**那个 `h1`/`h2`
 * ——套一层 `<h1><FlipText/></h1>` 既是非法结构，也会让读屏读出两条 heading。
 * [PageHeader](../page-header/page-header.md) 的 `titleAs` 想接的正是这个能力。
 */
export type FlipTextProps<E extends ElementType = "span"> = PolymorphicProps<E, FlipTextOwnProps> & {
  /**
   * 转发到 `as` 指定的那个标签上。
   *
   * 单独补这一条是因为 `PolymorphicProps` 的底座用的是 `ComponentPropsWithoutRef`，`ref` 不在里面
   * ——React 19 下它本来就当普通 prop 透传得下去，只是类型上取不到，消费方要 cast 才能用。
   * 标题是常见的滚动/测量目标（锚点定位、吸顶判断），值得把类型补齐，而不是让每个调用点自己 cast。
   * 这里只补本件，不动共享底座：那会连带改到所有多态件的签名。
   */
  ref?: ComponentPropsWithRef<E>["ref"];
};
