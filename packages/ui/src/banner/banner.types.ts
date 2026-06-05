import type { ReactNode } from "react";

export type BannerTone = "neutral" | "info" | "brand" | "success" | "warning" | "danger";

export interface BannerProps {
  /** 语气色。@default "info" */
  tone?: BannerTone;
  /** soft=浅底 / solid=实色填充（更醒目，适合促销/重大公告）。@default "soft" */
  variant?: "soft" | "solid";
  /** 前导图标（传入 svg；随 tone 自动着色）。 */
  icon?: ReactNode;
  /** 文案主体。 */
  children?: ReactNode;
  /** 右侧操作区（如「查看详情」链接/按钮）。 */
  action?: ReactNode;
  /** 内容对齐。@default "center" */
  align?: "start" | "center";
  /** 文案过长时单行无缝滚动（纯 CSS marquee·hover 暂停）。 */
  scrollable?: boolean;
  /** 传入则渲染关闭按钮。 */
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}
