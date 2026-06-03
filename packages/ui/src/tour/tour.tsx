"use client";
// 自研 Tour 漫游引导（零依赖 · 含 Portal/状态/几何测量故 "use client"）。
// 机制：
//   · Portal 全屏 SVG mask 遮罩——白底全屏 + 黑色圆角矩形镂空高亮当前 target（mask 镂空，
//     比 4 块 div 更平滑、原生支持圆角；镂空区透明、指针穿透 → 目标保持可交互）。
//   · 气泡卡「自定位」（不复用 Base UI Positioner，绕开 Positioner 必须 Portal 的红线）：
//     由 target getBoundingClientRect + placement 算位置，溢出翻转对侧 + 夹进视口。
//   · 窗口 resize / 任意祖先 scroll（capture）重算高亮框与卡片位置。
//   · 无 target 的步骤 → 卡片居中（开场/收尾）。Esc 关闭。reduced-motion 去过渡。
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import { X } from "../_icons";
import { cn } from "../lib/cn";
import { Button } from "../button";
import { motionDurationCss, motionEaseCss } from "../motion";
import {
  computeCardPosition,
  computeSpotlight,
  resolveTarget,
  type Rect,
} from "./tour.geometry";
import type { TourProps } from "./tour.types";

interface CardPos {
  top: number;
  left: number;
}

export function Tour({
  steps,
  open,
  current,
  onChange,
  onClose,
  onFinish,
  maskClosable = false,
  spotlightPadding = 8,
  spotlightRadius = 8,
  gap = 12,
  zIndex = 100,
  prevText = "上一步",
  nextText = "下一步",
  skipText = "跳过",
  finishText = "完成",
}: TourProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const maskId = `hulian-tour-mask-${uid}`;
  const titleId = `hulian-tour-title-${uid}`;
  const descId = `hulian-tour-desc-${uid}`;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cardRef = useRef<HTMLDivElement>(null);
  // spot=null 表示当前步无目标（卡片居中）；card=null 表示尚未测量定位（首帧隐藏防闪）。
  const [spot, setSpot] = useState<Rect | null>(null);
  const [card, setCard] = useState<CardPos | null>(null);

  const step = steps[current];
  const total = steps.length;
  const isFirst = current <= 0;
  const isLast = current >= total - 1;

  const recompute = useCallback(() => {
    if (!open || !step || typeof window === "undefined") return;
    const vp = { width: window.innerWidth, height: window.innerHeight };
    const c = cardRef.current;
    const cardSize = { width: c?.offsetWidth || 320, height: c?.offsetHeight || 160 };

    const el = resolveTarget(step.target);
    if (!el) {
      // 无目标：去掉镂空，卡片居中
      setSpot(null);
      setCard({
        top: vp.height / 2 - cardSize.height / 2,
        left: vp.width / 2 - cardSize.width / 2,
      });
      return;
    }
    const r = el.getBoundingClientRect();
    const sp = computeSpotlight(
      { top: r.top, left: r.left, width: r.width, height: r.height },
      spotlightPadding,
    );
    setSpot(sp);
    const pos = computeCardPosition(sp, step.placement ?? "bottom", cardSize, vp, gap);
    setCard({ top: pos.top, left: pos.left });
  }, [open, step, spotlightPadding, gap]);

  // 打开 / 步骤变化：把目标滚入视口 + 测量重算（useLayoutEffect 在 paint 前定位，防闪）。
  useLayoutEffect(() => {
    if (!open || !mounted || !step) return;
    const el = resolveTarget(step.target);
    el?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    recompute();
  }, [open, mounted, current, step, recompute]);

  // resize / 任意祖先 scroll（capture 捕获滚动容器）持续重算。
  useEffect(() => {
    if (!open || !mounted) return;
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, true);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
  }, [open, mounted, recompute]);

  // Esc 关闭。
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted || !step || typeof document === "undefined") return null;

  const goPrev = () => {
    if (!isFirst) onChange?.(current - 1);
  };
  const goNext = () => {
    if (isLast) (onFinish ?? onClose)?.();
    else onChange?.(current + 1);
  };
  const handleMaskClick = () => {
    if (maskClosable) onClose?.();
  };

  const cardTransition = reduce
    ? undefined
    : {
        transitionProperty: "top, left, opacity",
        transitionDuration: motionDurationCss.base,
        transitionTimingFunction: motionEaseCss.out,
      };

  return createPortal(
    <>
      {/* 全屏遮罩：SVG mask 镂空当前高亮。镂空区透明 → 指针穿透使目标可交互；
          暗色 scrim 区捕获点击（maskClosable 时关闭）。两态皆用深色 scrim（引导惯例）。 */}
      <svg
        aria-hidden
        className="fixed inset-0 h-full w-full"
        style={{ zIndex, cursor: maskClosable ? "pointer" : "default" }}
        onClick={handleMaskClick}
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spot && (
              <rect
                x={spot.left}
                y={spot.top}
                width={spot.width}
                height={spot.height}
                rx={spotlightRadius}
                ry={spotlightRadius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.55)"
          mask={`url(#${maskId})`}
          style={
            reduce
              ? undefined
              : {
                  transition: `all ${motionDurationCss.base} ${motionEaseCss.out}`,
                }
          }
        />
      </svg>

      {/* 气泡卡：自定位（fixed top/left）。首帧未测量 → opacity-0 防闪。 */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof step.title === "string" ? undefined : "引导"}
        aria-labelledby={step.title != null ? titleId : undefined}
        aria-describedby={step.description != null ? descId : undefined}
        className={cn(
          "fixed w-[min(90vw,20rem)] rounded-[var(--radius)] border border-border bg-surface p-4 shadow-xl",
          card ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{
          zIndex: zIndex + 1,
          top: card?.top ?? 0,
          left: card?.left ?? 0,
          ...cardTransition,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {step.title != null && (
              <p id={titleId} className="text-sm font-semibold text-foreground">
                {step.title}
              </p>
            )}
            {step.description != null && (
              <p id={descId} className="mt-1.5 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="关闭引导"
            onClick={() => onClose?.()}
            className="-mr-1 -mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius),0.375rem)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {/* 进度 1/N */}
          <span className="text-xs tabular-nums text-muted" aria-label={`第 ${current + 1} 步，共 ${total} 步`}>
            {current + 1}/{total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="rounded-[min(var(--radius),0.375rem)] px-1.5 py-1 text-xs text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {skipText}
            </button>
            {!isFirst && (
              <Button size="sm" variant="outline" onClick={goPrev}>
                {prevText}
              </Button>
            )}
            <Button size="sm" onClick={goNext}>
              {isLast ? finishText : nextText}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
