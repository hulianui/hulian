"use client";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { RefreshCw, X } from "../_icons";
import { Button } from "../button";
import { useLocaleValue } from "../config/locale-context";
import { cn } from "../lib/cn";
import { Spinner } from "../spinner";
import type { CaptchaPoint, ClickCaptchaProps } from "./click-captcha.types";

// ClickCaptcha = 点选式人机验证的**纯 UI 层**：给定背景图/提示图，采集点击序列并回传相对坐标（0~1）。
// 有意不做的事：不碰网络、不认协议（captchaId / captchaInfo 编码各家后端不同，进库即 API 债）。
//   消费方在 onComplete 里把点位编码成自家协议串再发请求，失败时把 status 置 failed（组件抖动并清空）。
// 坐标用相对值而非像素：容器缩放 / 响应式 / 高 DPI 下都不错位，也不必把「后端期望的原图尺寸」塞进组件。
// 键盘可达：区域可聚焦，方向键移准星、Enter/Space 落点、Backspace 撤销（鼠标不是唯一通路）。
// 关键帧 hulian-captcha-shake 落 @hulianui/tokens preset.css；reduced-motion 下不抖（motion-safe 前缀）。

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function ClickCaptcha({
  backgroundSrc,
  hintSrc,
  hintText,
  maxPoints = 3,
  points: pointsProp,
  defaultPoints,
  onPointsChange,
  onComplete,
  onRefresh,
  loading = false,
  status = "idle",
  disabled = false,
  aspectRatio = 2,
  keyboardStep = 0.02,
  className,
}: ClickCaptchaProps) {
  const loc = useLocaleValue("clickCaptcha", {
    hint: "请依次点击图中的提示内容",
    hintImageAlt: "点击提示",
    areaLabel: "人机验证点选区：方向键移动准星，回车或空格落点，退格撤销",
    selected: "已选点位",
    undo: "撤销上一个点",
    refresh: "换一张",
    verifying: "校验中…",
    failed: "验证失败，请重新点选",
    success: "验证通过",
    imageError: "验证码图片加载失败，请点「换一张」重试",
  });
  const hintId = useId();
  const controlled = pointsProp !== undefined;
  const [innerPoints, setInnerPoints] = useState<CaptchaPoint[]>(defaultPoints ?? []);
  const points = controlled ? pointsProp : innerPoints;
  // 键盘准星：方向键移动后可见，Enter/Space 落点
  const [cursor, setCursor] = useState<CaptchaPoint>({ x: 0.5, y: 0.5 });
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [imageError, setImageError] = useState(false);
  const prevStatus = useRef(status);

  // verifying/success 期间锁交互；failed 仍可继续点选（重试）
  const locked = disabled || loading || status === "verifying" || status === "success";
  const full = points.length >= maxPoints;

  const commit = useCallback(
    (next: CaptchaPoint[]) => {
      if (!controlled) setInnerPoints(next);
      onPointsChange?.(next);
    },
    [controlled, onPointsChange],
  );

  // 校验失败 → 清空点位重来（抖动由 CSS 动画给反馈）
  useEffect(() => {
    if (status === "failed" && prevStatus.current !== "failed" && points.length > 0) commit([]);
    prevStatus.current = status;
  }, [status, points.length, commit]);

  useEffect(() => {
    setImageError(false);
  }, [backgroundSrc]);

  const addPoint = useCallback(
    (p: CaptchaPoint) => {
      if (locked || full) return;
      const next = [...points, { x: clamp01(p.x), y: clamp01(p.y) }];
      commit(next);
      if (next.length >= maxPoints) onComplete?.(next);
    },
    [locked, full, points, commit, maxPoints, onComplete],
  );

  const undo = useCallback(() => {
    if (locked || points.length === 0) return;
    commit(points.slice(0, -1));
  }, [locked, points, commit]);

  const refresh = useCallback(() => {
    if (disabled) return;
    if (points.length > 0) commit([]);
    onRefresh?.();
  }, [disabled, points.length, commit, onRefresh]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (locked || full) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setKeyboardMode(false);
    addPoint({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const move = (dx: number, dy: number) => {
      e.preventDefault();
      setKeyboardMode(true);
      setCursor((c) => ({ x: clamp01(c.x + dx), y: clamp01(c.y + dy) }));
    };
    switch (e.key) {
      case "ArrowLeft":
        return move(-keyboardStep, 0);
      case "ArrowRight":
        return move(keyboardStep, 0);
      case "ArrowUp":
        return move(0, -keyboardStep);
      case "ArrowDown":
        return move(0, keyboardStep);
      case "Enter":
      case " ":
        e.preventDefault();
        setKeyboardMode(true);
        return addPoint(cursor);
      case "Backspace":
      case "Delete":
        e.preventDefault();
        return undo();
      default:
        return;
    }
  };

  const statusText =
    status === "verifying"
      ? loc.verifying
      : status === "failed"
      ? loc.failed
      : status === "success"
      ? loc.success
      : "";

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col gap-2 rounded-[var(--radius)] border border-border bg-surface p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div id={hintId} className="flex min-w-0 items-center gap-2 text-sm text-foreground">
          <span className="truncate">{hintText ?? loc.hint}</span>
          {hintSrc != null && (
            <img
              src={hintSrc}
              alt={loc.hintImageAlt}
              draggable={false}
              className="h-5 max-w-[45%] shrink-0 object-contain"
            />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            aria-label={loc.undo}
            disabled={locked || points.length === 0}
            onClick={undo}
          >
            <X className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            aria-label={loc.refresh}
            disabled={disabled}
            onClick={refresh}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      <div
        role="application"
        aria-label={loc.areaLabel}
        aria-describedby={hintId}
        aria-disabled={locked || undefined}
        data-status={status}
        data-slot="captcha-area"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={() => setKeyboardMode(false)}
        style={{ aspectRatio: String(aspectRatio) }}
        className={cn(
          "relative w-full select-none overflow-hidden rounded-[var(--radius)] border border-border bg-bg outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          locked || full ? "cursor-default" : "cursor-crosshair",
          status === "failed" && "motion-safe:[animation:hulian-captcha-shake_0.4s_ease-in-out]",
        )}
      >
        {!imageError && (
          <img
            src={backgroundSrc}
            alt=""
            draggable={false}
            onError={() => setImageError(true)}
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
        )}
        {imageError && (
          <div className="absolute inset-0 grid place-items-center px-4 text-center text-sm text-muted-foreground">
            {loc.imageError}
          </div>
        )}

        {points.map((p, i) => (
          <span
            key={`${p.x}-${p.y}-${i}`}
            aria-hidden
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            data-slot="captcha-point"
            className="pointer-events-none absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow ring-2 ring-surface"
          >
            {i + 1}
          </span>
        ))}

        {keyboardMode && !locked && !full && (
          <span
            aria-hidden
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
            data-slot="captcha-cursor"
            className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary bg-primary/15"
          />
        )}

        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-bg/60">
            <Spinner />
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
        {statusText || `${loc.selected} ${points.length}/${maxPoints}`}
      </p>
    </div>
  );
}
