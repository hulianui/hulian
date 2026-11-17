import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { avatarVariants } from "./avatar";

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  /**
   * 占位底色：`neutral` 中性灰底（默认）；`brand` 主色浅底 + 主色字 —— 品牌 / 系统 / AI 自己的头像，
   * 或想让首字头像带主题色。图片加载出来后底色被盖住。
   * @default "neutral"
   */
  tone?: "neutral" | "brand";
  /** 外圈 2px 描边，颜色随 tone（中性取 border，品牌取主色浅边）。压在彩色底 / 照片上或成组堆叠时用。@default false */
  ring?: boolean;
  className?: string;
}
