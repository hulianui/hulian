import type { ReactNode } from "react";

/** 默认倍速档位（设计已定）。 */
export const DEFAULT_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Vidstack 可接受的 src 形态：单 URL（文件/.m3u8）或多源数组。 */
export type VideoSource = string | { src: string; type?: string }[];

export interface VideoProps {
  /** 文件 URL / HLS .m3u8 / 多源数组。 */
  src: VideoSource;
  /** 海报图。 */
  poster?: string;
  /** 无障碍标题，也用于内部 aria。 */
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  /** 透传给底层 media 的 crossorigin。 */
  crossOrigin?: boolean | string;
  /** CSS aspect-ratio，默认 "16/9"。 */
  aspectRatio?: string;
  /** 倍速档位，默认 DEFAULT_PLAYBACK_RATES。 */
  playbackRates?: number[];
  className?: string;
  /** —— 后续扩展位（v1 未实现，预留不堵死）—— */
  children?: ReactNode;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  /** 播放进度回调，单位秒。 */
  onTimeUpdate?: (currentTime: number) => void;
}

/** 秒 → 人读时间。NaN/负数/Infinity 兜底 0:00；≥1h 走 h:mm:ss。 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

/** src 归一化（v1 直接透传，留作未来 YouTube/Vimeo 适配钩子）。 */
export function normalizeSrc(src: VideoSource): VideoSource {
  return src;
}
