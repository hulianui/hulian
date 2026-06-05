import type { CSSProperties, ReactNode } from "react";

export interface ProfileCardProps {
  /**
   * 头像图片地址。未提供时回退为「姓名首字母」占位块（不引入外链）。
   */
  avatarUrl?: string;
  /**
   * 姓名，显示在卡片底部主标题；也用于无头像时生成首字母占位。
   * 默认 "瑚琏"。
   */
  name?: string;
  /**
   * 职位 / 副标题，显示在姓名下方。默认 "前端工程师"。
   */
  title?: string;
  /**
   * 用户 handle（@xxx），显示在底部信息条左侧。默认 "hulianui"。
   */
  handle?: string;
  /**
   * 状态文案（如「在线」），显示在 handle 下方。默认 "在线"。
   */
  status?: string;
  /**
   * 联系按钮文案。默认 "联系"。
   */
  contactText?: string;
  /**
   * 是否显示底部毛玻璃信息条（含 handle / 状态 / 联系按钮）。默认 true。
   */
  showUserInfo?: boolean;
  /**
   * 点击「联系」按钮回调。
   */
  onContactClick?: () => void;
  /**
   * 是否开启指针倾斜 + 全息光泽交互，默认 true。
   * 关闭后为静态卡片（仍带渐变与底部信息条）。
   * 用户系统开启「减少动态效果」时自动降级为静态。
   */
  enableTilt?: boolean;
  /**
   * 全息高光主色，喂给径向光晕与边缘炫彩。
   * 必须用带 `--color-` 前缀的 token（Tailwind v4 真名），默认 var(--color-chart-1)。
   * 也可传任意 CSS 颜色字符串。
   */
  glowColor?: string;
  /**
   * 卡片宽高比（width / height），默认 0.74（接近实体卡）。
   */
  aspectRatio?: number;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
  /**
   * 自定义卡片正面叠加内容（覆盖在头像层之上、信息条之下）。
   */
  children?: ReactNode;
}
