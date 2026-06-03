"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { cn } from "../lib/cn";
import type { HeroVideoDialogProps } from "./hero-video-dialog.types";

// 吸取自 magicui.design Hero Video Dialog：缩略图 + 播放钮，点击弹出居中视频层（含状态/Portal/Esc 故 "use client"）。
// 瑚琏化：遮罩/卡片走 token；自管 Portal 模态（不耦合 Base UI Dialog）；Esc + 点遮罩关闭；body 锁滚。
export function HeroVideoDialog({ thumbnailSrc, thumbnailAlt = "", videoSrc, className }: HeroVideoDialogProps) {
  const [open, setOpen] = useState(false);

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
        aria-label="播放视频"
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
              aria-label="关闭"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-surface/80 text-foreground outline-none hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="aspect-video w-full max-w-3xl overflow-hidden rounded-[var(--radius)] border border-border bg-black shadow-2xl"
            >
              <iframe
                src={videoSrc}
                title="视频"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
