"use client";
import { useState } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "../avatar";
import { NumberTicker } from "../number-ticker";
import type { LivePlayerProps } from "./live-player.types";
import { useComponentLocale } from "../config/locale-context";

export function LivePlayer({
  src,
  poster,
  surface,
  live = true,
  viewers,
  qualities,
  quality,
  onQualityChange,
  host,
  orientation = "landscape",
  overlay,
  footer,
  aspectRatio,
  className,
}: LivePlayerProps) {
  const labels = useComponentLocale().livePlayer ?? { follow: "+ 关注", followed: "已关注" };
  const [menuOpen, setMenuOpen] = useState(false);
  // aspectRatio="fill" → 不锁比例，铺满父容器（沉浸式竖屏直播间用）。
  const fill = aspectRatio === "fill";
  const ratio = fill ? undefined : aspectRatio ?? (orientation === "portrait" ? "9/16" : "16/9");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius)] bg-slate-900 text-white",
        fill && "size-full",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {/* 画面层 */}
      {surface ? (
        <div className="absolute inset-0">{surface}</div>
      ) : src ? (
        <video
          className="absolute inset-0 size-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      )}

      {/* 覆盖层（弹幕/飘心/礼物） */}
      {overlay && <div className="absolute inset-0">{overlay}</div>}

      {/* 顶部渐变 + 主播条 + 状态 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/45 to-transparent p-3">
        <div className="flex items-start justify-between gap-2">
          {host && (
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/35 p-1 pr-2 backdrop-blur-sm">
              <Avatar size="sm" src={host.avatar} alt={host.name} fallback={host.name[0]} />
              <div className="leading-tight">
                <div className="text-xs font-semibold">{host.name}</div>
                {host.meta && <div className="text-[10px] text-white/70">{host.meta}</div>}
              </div>
              {host.onFollow &&
                (host.followed ? (
                  <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white/80">
                    {labels.followed}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={host.onFollow}
                    className="ml-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground transition hover:bg-primary-hover"
                  >
                    {labels.follow}
                  </button>
                ))}
            </div>
          )}

          <div className="pointer-events-auto flex items-center gap-1.5">
            {live && (
              <span className="flex items-center gap-1 rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold leading-none tracking-wide text-danger-foreground">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                </span>
                LIVE
              </span>
            )}
            {viewers != null && (
              <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] leading-none backdrop-blur-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="size-3 fill-none stroke-current"
                  strokeWidth={2}
                >
                  <path d="M12 5c-5 0-9 5-9 7s4 7 9 7 9-5 9-7-4-7-9-7Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                {/* 视频浮层恒为白字：覆盖 NumberTicker 默认的 text-foreground（浅色主题下会变深色） */}
                <NumberTicker value={viewers} className="tabular-nums text-white" />
              </span>
            )}
            {qualities && qualities.length > 0 && (
              // flex：使包裹层高度=按钮高（而非继承 ~1.5 行高的行盒），与 LIVE/观看数药丸等高居中。
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-[11px] leading-none backdrop-blur-sm"
                >
                  {quality ?? qualities[0]} ▾
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-7 z-20 min-w-20 overflow-hidden rounded-[var(--radius)] bg-black/80 py-1 text-[11px] backdrop-blur-sm">
                    {qualities.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          onQualityChange?.(q);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          "block w-full px-3 py-1 text-left hover:bg-white/15",
                          q === quality && "text-primary",
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部互动栏 */}
      {footer && <div className="absolute inset-x-0 bottom-0 z-10">{footer}</div>}
    </div>
  );
}
