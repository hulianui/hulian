"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "../_icons";
import { cn } from "../lib/cn";
import type { HeroVideoDialogProps } from "./hero-video-dialog.types";
import { useComponentLocale } from "../config/locale-context";

// 吸取自 magicui.design Hero Video Dialog：缩略图 + 播放钮，点击弹出居中视频层（含状态/Portal/Esc 故 "use client"）。
// 瑚琏化：遮罩/卡片走 token；自管 Portal 模态（不耦合 Base UI Dialog）；Esc + 点遮罩关闭；body 锁滚。
//
// 弹层里挂 iframe 还是 <video>：上游只有 iframe 一条路，于是自托管视频（`/hero.mp4`）也只能塞进
// iframe —— 浏览器会用自带的媒体查看器兜底，能出画面，但没有 poster、控件样式不可控、部分浏览器
// 直接触发下载。所以这里把两种形态都做成一等公民，由 videoType 选择。
//
// 为什么不是 <video> 一把梭：第三方嵌入页（youtube/bilibili embed）是完整 HTML 文档，只能进 iframe。
// 为什么不复用 Video 播放器组件：那件带 @vidstack/react，营销页的「点开就播」不该为此背上一个引擎。

// 自动判别只认扩展名里明确是「视频文件」的那几种。
// 刻意不含 .m3u8：HLS 只有 Safari 原生放得动，Chrome/Firefox 需要 hls.js —— 自动挂 <video> 会在
// 多数浏览器上黑屏，比留在 embed 分支更难排查。要放 HLS 请用 Video 播放器组件。
const VIDEO_FILE_RE = /\.(?:mp4|webm|ogv|ogg|mov|m4v)(?:[?#]|$)/i;

/** 把 `videoType` 归一成实际形态；`"auto"` 时按 `videoSrc` 扩展名判别。 */
function resolveVideoKind(videoSrc: string, videoType: "auto" | "embed" | "video"): "embed" | "video" {
  if (videoType !== "auto") return videoType;
  return VIDEO_FILE_RE.test(videoSrc) ? "video" : "embed";
}

export function HeroVideoDialog({
  thumbnailSrc,
  thumbnailAlt = "",
  videoSrc,
  videoType = "auto",
  className,
}: HeroVideoDialogProps) {
  const labels = useComponentLocale().heroVideoDialog ?? {
    play: "播放视频",
    close: "关闭",
    iframeTitle: "视频",
  };
  const [open, setOpen] = useState(false);
  const kind = resolveVideoKind(videoSrc, videoType);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block overflow-hidden rounded-[var(--radius)] border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        aria-label={labels.play}
      >
        <img src={thumbnailSrc} alt={thumbnailAlt} className="block size-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
          <span className="flex size-16 items-center justify-center rounded-full bg-surface/90 text-primary backdrop-blur-md transition-transform group-hover:scale-110">
            <Play className="size-6 translate-x-0.5 fill-current" />
          </span>
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              aria-label={labels.close}
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-surface/80 text-foreground outline-none hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="aspect-video w-full max-w-3xl overflow-hidden rounded-[var(--radius)] border border-hairline bg-black shadow-2xl"
            >
              {kind === "video" ? (
                // poster 复用缩略图：弹层打开到首帧解码之间不会闪黑底，缩略图与视频本来就该是同一画面。
                // autoPlay 是「点击才挂载」下的正常预期；若被浏览器自动播放策略拦下，controls 仍在，用户点一下即可。
                <video
                  src={videoSrc}
                  poster={thumbnailSrc}
                  aria-label={labels.iframeTitle}
                  controls
                  autoPlay
                  playsInline
                  className="size-full object-contain"
                />
              ) : (
                <iframe
                  src={videoSrc}
                  title={labels.iframeTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
