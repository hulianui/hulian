import type { HTMLAttributes, ReactNode } from "react";
import type { HeadingLevel } from "../heading/heading.types";

/**
 * 背景配方。三档都由 token 混色写死在组件内——**消费方不需要、也不应该**为了一块渐变底
 * 去裸写 `<div style={{ background: "radial-gradient(…)" }}>`（hulianui/hulian#71）。
 *  · `radial`：左上角起的柔和光晕（默认，最百搭）
 *  · `linear`：45° 斜向渐变，两端各带一点品牌色
 *  · `mesh`：三处光斑叠加，设计感最强，适合注册页 / 落地页
 *  · `none`：纯 surface 底（想自己叠 DotPattern / GridPattern 之类的图案时用）
 */
export type AuthPanelGradient = "radial" | "linear" | "mesh" | "none";

// title / color 都要盖掉原生同名属性：前者原生只收 string（我们要 ReactNode 放富文本标语），
// 后者是早已废弃的展示属性，这里的语义是品牌色。
export interface AuthPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "color"> {
  /** 品牌位（通常直接放 [Brand](../brand/brand.md)）。 */
  brand?: ReactNode;
  /** 主标语。 */
  title?: ReactNode;
  /** 标题语义级别（视觉尺寸固定，只影响 `h1`–`h6` 标签）。@default 2 */
  titleLevel?: HeadingLevel;
  /** 标语下的补充说明。 */
  description?: ReactNode;
  /**
   * 卖点列表（每条前面自动带一枚勾选标记）。要完全自定义就用 `children`。
   */
  highlights?: ReactNode[];
  /** 中部自由内容（插画、统计数字、客户 logo 墙……）。 */
  children?: ReactNode;
  /** 底部区（版权、备案号、次要链接）。 */
  footer?: ReactNode;
  /**
   * 品牌色：语义色名（`primary`/`chart-2`…）、任意 CSS 色或变量，走 `resolveTone`——
   * 与 `Brand.color` / `Dot.color` / `ChartSeries.color` 同一条路径。
   * @default "primary"
   */
  color?: string;
  /** 背景配方。@default "radial" */
  gradient?: AuthPanelGradient;
  /**
   * 中部内容（title / description / children）的垂直位置。
   *  · `start`：紧跟品牌位贴顶（默认，现有页面不变）
   *  · `center`：相对**整块面板**垂直居中——分屏认证页右半边的表单通常 `place-items-center`，
   *    左侧标语要与它齐平就选这档。brand 仍贴顶、highlights / footer 仍贴底；上下两段等分剩余
   *    空间，所以居中位置不受品牌位与底部区高度差影响（hulianui/hulian#338）。
   * @default "start"
   */
  contentAlign?: "start" | "center";
  className?: string;
}
