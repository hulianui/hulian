import type { HTMLAttributes, ReactElement, ReactNode } from "react";

/** 导航栏 28px / 侧栏 36px 是实际用到的两档；lg 给登录页品牌区。 */
export type BrandSize = "sm" | "md" | "lg";

export interface BrandProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** 徽章内容：图标、图片或首字。缺省时取 `name` 的首字（中文首字 / 英文首字母）。 */
  mark?: ReactNode;
  /** 品牌名。省略则只出徽章（侧栏收起态）。 */
  name?: ReactNode;
  /** 品牌名下方的一行副标题（版本号 / 一句话定位）。 */
  description?: ReactNode;
  /** @default "md" */
  size?: BrandSize;
  /** 徽章底色：语义色名（`primary`/`chart-3`…）或任意 CSS 色；`variant="bare"` 时是 mark 本身的颜色。@default "primary" */
  color?: string;
  /**
   * `badge`：方角实底徽章，mark 画在徽章里（默认）。
   * `bare`：没有徽章底，mark 就是 logo 本身、直接用 `color` 着色 —— 自带形状的品牌 logo 用这档。
   * @default "badge"
   */
  variant?: "badge" | "bare";
  /**
   * 单色 logo 图片地址（SVG / PNG）。按图片的形状着色（CSS mask），颜色跟 `color` 走，
   * 于是 logo 能跟着主题色、`AccentScope` 变色 —— `<img>` 做不到，颜色写死在文件里。
   * 传了它就忽略 `mark`。
   */
  maskSrc?: string;
  /**
   * 渲染成自定义元素（框架路由件：`<Link to="/" />`）——品牌区几乎总是链回首页。
   * 与 Button / Link / NavMenuItem 的 `render` 约定一致。
   */
  render?: ReactElement;
  /** 普通链接（不需要客户端路由时用）。 */
  href?: string;
  className?: string;
}
