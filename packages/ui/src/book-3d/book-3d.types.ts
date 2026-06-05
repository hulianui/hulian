import type { ReactNode } from "react";

export interface Book3DCoverColor {
  from: string;
  to: string;
}

export interface Book3DProps {
  /** 封面主标题（渲染在书封上，如 "CSS" / "JS"） */
  title: ReactNode;
  /** 封面副标题（如 "转换" / "FUNCTION"） */
  subtitle?: ReactNode;
  /** 封面图 url；提供时覆盖 coverColor 渐变 */
  cover?: string;
  /** 封面中心叠加的产品 logo / app icon（图 url）；叠在渐变背景上居中展示，标题落到底部。 */
  logo?: string;
  /** 封面渐变色；默认品牌渐变 */
  coverColor?: Book3DCoverColor;
  /** 书脊/页厚颜色（CSS color），默认浅纸色 */
  spineColor?: string;
  /** 书脊厚度（页数感），CSS 长度，默认 "2.25rem" */
  thickness?: string;
  /** 角标缎带文字，如 "NEW" / "N°1" */
  ribbon?: string;
  /** 缎带语气，默认 danger（红） */
  ribbonTone?: "brand" | "danger" | "success";
  /** 提供则整本书是链接 */
  href?: string;
  /** 无 href 时提供则整本书是按钮 */
  onClick?: () => void;
  /** 外链是否新窗（href 时生效） */
  target?: string;
  className?: string;
}
