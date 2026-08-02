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
  /** 徽章底色：语义色名（`primary`/`chart-3`…）或任意 CSS 色。@default "primary" */
  color?: string;
  /**
   * 渲染成自定义元素（框架路由件：`<Link to="/" />`）——品牌区几乎总是链回首页。
   * 与 Button / Link / NavMenuItem 的 `render` 约定一致。
   */
  render?: ReactElement;
  /** 普通链接（不需要客户端路由时用）。 */
  href?: string;
  className?: string;
}
