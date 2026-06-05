import type { ReactNode } from "react";

export interface LivePlayerHost {
  name: string;
  avatar?: string;
  /** 是否已关注。 */
  followed?: boolean;
  /** 点关注（不传则不显示关注钮）。 */
  onFollow?: () => void;
  /** 副信息（如「抖音号 / 粉丝数」）。 */
  meta?: ReactNode;
}

export interface LivePlayerProps {
  /** 本地视频源（内部固定 muted/loop/autoPlay/playsInline）。 */
  src?: string;
  poster?: string;
  /** 自定义画面（程序化场景等）；存在时优先于 src。 */
  surface?: ReactNode;
  /** 显示 LIVE 呼吸徽标，默认 true。 */
  live?: boolean;
  /** 在线人数（NumberTicker 跳数）。 */
  viewers?: number;
  /** 清晰度档位。 */
  qualities?: string[];
  /** 当前清晰度（受控）。 */
  quality?: string;
  onQualityChange?: (q: string) => void;
  /** 顶部主播条。 */
  host?: LivePlayerHost;
  /** 朝向，默认 landscape。 */
  orientation?: "portrait" | "landscape";
  /** 画面之上、操作条之下的覆盖层（弹幕/飘心/礼物）。 */
  overlay?: ReactNode;
  /** 底部互动栏插槽。 */
  footer?: ReactNode;
  /** CSS aspect-ratio；不传则按 orientation（landscape=16/9，portrait=9/16）。传 "fill" 则不锁比例、铺满父容器。 */
  aspectRatio?: string;
  className?: string;
}
