import type { ReactNode } from "react";

/** 默认倍速档位（设计已定）。 */
export const DEFAULT_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Vidstack 可接受的 src 形态：单 URL（文件/.m3u8）或多源数组。 */
export type VideoSource = string | { src: string; type?: string }[];

/** 视频章节（cue point）：在某秒开始的分段。 */
export interface VideoChapter {
  /** 章节起点，单位秒。 */
  time: number;
  /** 章节标题（hover 进度条标记时显示）。 */
  title: string;
}

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
  /** 章节分段标记：在进度条上按 time/duration 渲染 tick，hover 显示标题。 */
  chapters?: VideoChapter[];
  /** 续播：媒体可播放后 seek 到此秒（仅初始一次，>0 才生效）。 */
  startTime?: number;
  /** 播完(ended)浮现的结束屏内容（如「下一节」卡片）；为空则只给重播按钮。 */
  endScreen?: ReactNode;
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

/** 章节标记：算每个章节在进度条上的百分比位置。
 * duration 非正/NaN 时无从定位，返回空；time 夹取到 [0,duration]；按位置升序。 */
export function chapterMarkers(
  chapters: VideoChapter[] | undefined,
  duration: number,
): { percent: number; title: string }[] {
  if (!chapters?.length || !Number.isFinite(duration) || duration <= 0) return [];
  return chapters
    .map((c) => {
      const t = Math.min(Math.max(c.time, 0), duration);
      return { percent: (t / duration) * 100, title: c.title };
    })
    .sort((a, b) => a.percent - b.percent);
}
