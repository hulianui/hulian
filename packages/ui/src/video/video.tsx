"use client";
import "@vidstack/react/player/styles/base.css";
import { useEffect, useRef, useState } from "react";
import { MediaPlayer, MediaProvider, Poster, type MediaPlayerInstance } from "@vidstack/react";
import { cn } from "../lib/cn";
import { VideoControls } from "./video-controls";
import { DEFAULT_PLAYBACK_RATES, formatTime, normalizeSrc, type VideoProps } from "./video.types";

// Vidstack 引擎（媒体加载/HLS/状态）+ 瑚琏皮肤（控件 token 化）。
// HLS：src 给 .m3u8 即可，Vidstack 按需加载 hls.js（v1 默认 CDN，自托管口子见 types 注释/文档）。
export function Video({
  src,
  poster,
  title,
  autoPlay,
  muted,
  loop,
  crossOrigin,
  aspectRatio = "16/9",
  playbackRates,
  chapters,
  startTime,
  endScreen,
  className,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}: VideoProps) {
  const rates = playbackRates ?? [...DEFAULT_PLAYBACK_RATES];
  const playerRef = useRef<MediaPlayerInstance>(null);
  // SSR 安全：Vidstack 在服务端构造 MediaPlayer 会摸 window（静态导出预渲染即崩）。
  // 首帧渲同比例占位，挂载后再渲真播放器；对 SPA/CSR 无感，对 SSG/SSR 不再炸。
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // 续播：仅首次 can-play 时 seek 一次，避免与用户后续拖拽/换源冲突。
  const seekedRef = useRef(false);
  // VideoProps.crossOrigin 是 boolean | string；Vidstack 接受 true | '' | 'anonymous' | 'use-credentials' | null。
  // boolean → true/undefined；字符串原样透传（按 MediaCrossOrigin 取，非法值由运行时容忍）。
  const resolvedCrossOrigin =
    typeof crossOrigin === "boolean"
      ? crossOrigin
        ? true
        : undefined
      : (crossOrigin as "" | "anonymous" | "use-credentials" | undefined);
  if (!mounted) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[var(--radius)] border border-border bg-black",
          className,
        )}
        style={{ aspectRatio }}
      />
    );
  }
  return (
    <MediaPlayer
      ref={playerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius)] border border-border bg-black text-white",
        className,
      )}
      title={title}
      src={normalizeSrc(src) as never}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      crossOrigin={resolvedCrossOrigin}
      aspectRatio={aspectRatio}
      playsInline
      viewType="video"
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
      onCanPlay={() => {
        if (startTime && startTime > 0 && !seekedRef.current && playerRef.current) {
          playerRef.current.currentTime = startTime;
          seekedRef.current = true;
        }
      }}
      onTimeUpdate={(detail) => onTimeUpdate?.(detail.currentTime)}
    >
      <MediaProvider>
        {poster ? (
          <Poster
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity data-[visible]:opacity-100"
            src={poster}
            alt={title ?? ""}
          />
        ) : null}
      </MediaProvider>
      <VideoControls playbackRates={rates} chapters={chapters} endScreen={endScreen} />
    </MediaPlayer>
  );
}

export { formatTime, normalizeSrc };
