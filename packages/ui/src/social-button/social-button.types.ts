import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SocialProvider =
  | "wechat"
  | "alipay"
  | "qq"
  | "weibo"
  | "github"
  | "google"
  | "apple"
  | "x"
  | "discord"
  | "gitlab";

/**
 * 自定义平台：内置枚举之外的 IdP 走这里，拿到与内置品牌**完全一致**的皮肤
 * （尺寸/形态/loading/按压/焦点环全共用），不必退回裸 Button 自己塞 SVG。
 *
 * 存在的理由不是"顺手加个口子"：自建 IdP（Keycloak / Authentik / Okta / 各家企业 SSO）
 * 在自托管场景里穷举不完；而且 simple-icons 已应法务要求下架 Microsoft / LinkedIn /
 * Slack / 飞书等 logo，这些**在库里根本无法内置**。所以补枚举永远追不上，逃生口才是解（#154）。
 *
 * ⚠️ 本组件是 memo 的。对象字面量每次渲染都是新引用，会让 memo 永远失效 ——
 * 请把它提到模块作用域当常量，别写成 `provider={{ ... }}` 内联。
 */
export interface SocialBrand {
  /** 品牌 logo。任意节点：内联 `<svg>`、`<img>`、图标组件皆可，会被约束到当前 size 的图标尺寸。 */
  icon: ReactNode;
  /** 品牌名。用于默认文案（「{label}登录」）与 shape="icon" 时的 aria-label。 */
  label: string;
  /**
   * 品牌主色（任意 CSS 颜色）：outline 时给 logo 着色、solid 时作按钮底色。
   * **不传即视为黑白系品牌**，与内置的 GitHub/X/Apple 同档 —— solid 走主题前景色，
   * 明暗两态都可读（企业自建 IdP 多半只有单色 logo，这是更常见的那一档）。
   */
  brandColor?: string;
}

export interface SocialButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /**
   * 第三方平台。决定品牌 logo、默认文案与品牌色。
   * 传内置枚举值即得内置品牌；枚举外的平台传 {@link SocialBrand} 对象（见其文档，注意 memo 一节）。
   */
  provider: SocialProvider | SocialBrand;
  /**
   * solid=品牌色填充（彩色品牌用品牌色，github/x/apple 黑白品牌随主题前景）；
   * outline=描边中性底 + 品牌色 logo（与其它表单控件同观感，推荐）。
   * @default "outline"
   */
  variant?: "solid" | "outline";
  /** button=带文案；icon=纯 logo 方钮。@default "button" */
  shape?: "button" | "icon";
  size?: "sm" | "md" | "lg";
  /** 提交中：替换 logo 为转圈并禁用。 */
  loading?: boolean;
  /** 覆盖默认文案（如「使用微信登录」→「微信」）。 */
  children?: ReactNode;
  className?: string;
}
