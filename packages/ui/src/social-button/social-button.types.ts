import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SocialProvider =
  | "wechat"
  | "alipay"
  | "qq"
  | "weibo"
  | "github"
  | "google"
  | "apple"
  | "x";

export interface SocialButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** 第三方平台。决定品牌 logo、默认文案与品牌色。 */
  provider: SocialProvider;
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
