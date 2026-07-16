"use client";
import { useCallback, useRef, type CSSProperties, type PointerEvent } from "react";
import { cn } from "../lib/cn";
import type { VoiceRecordProps, VoiceRecordStatus } from "./voice-record.types";

// 尺寸（Tailwind v4 标准 spacing）
const sizeMap = {
  sm: { btn: "size-20", ring: "size-24", font: "text-xs" },
  md: { btn: "size-24", ring: "size-32", font: "text-sm" },
  lg: { btn: "size-28", ring: "size-40", font: "text-base" },
};

// 光环/波形等装饰元素用绝对定位自居中，不受父容器大小影响
const ringCenter = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";

/**
 * VoiceRecord — 语音录制触发器
 *
 * 支持两种交互模式：
 *   - 默认 pressAndHold：按下开始→松开结束
 *   - pressAndHold=false：点击切换开始/停止
 *
 * 所有回调通过 ref 读取最新状态，避免 iOS 上闭包捕获过期值。
 */
export function VoiceRecord({
  status = "idle",
  labelIdle = "按住说话",
  labelRecording = "松开结束",
  labelProcessing = "处理中…",
  levels = [],
  size = "md",
  pressAndHold = true,
  onToggle,
  onPress,
  onRelease,
  className,
  disabled,
  ...props
}: VoiceRecordProps) {
  const s = sizeMap[size];
  const isRecording = status === "recording";
  const isProcessing = status === "processing";
  const isDisabled = disabled || status === "disabled";
  const isIdle = status === "idle";

  // 所有交互回调通过 ref 读取最新值，避免闭包在 iOS 上捕获过期状态
  const statusRef = useRef(status);
  statusRef.current = status;
  const pressAndHoldRef = useRef(pressAndHold);
  pressAndHoldRef.current = pressAndHold;
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;
  const onToggleRef = useRef(onToggle);
  onToggleRef.current = onToggle;

  // 本地按压标志——松开是否触发"停止"只看这一次按压是否由本组件发起，
  // 不依赖 status prop 的异步回环。这样可避免两类死锁：
  //   1. 快速点按时 status 还没回环到 recording 就松手 → 停止被丢弃
  //   2. iOS 手势被系统打断，浏览器派发 pointercancel 而非 pointerup →
  //      若不监听 cancel 就永远收不到"松手"，卡死在录音态
  const pressedRef = useRef(false);

  // ── 按下：idle → 发起录音 ──
  // 只用 Pointer Events 一套覆盖 鼠标/触摸/触控笔，不再叠加 touch 事件，
  // 否则触屏上 pointerdown 与 touchstart 会各触发一次，导致双重 start。
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (statusRef.current !== "idle") return;
    if (!pressAndHoldRef.current) return; // 点击模式交给 onClick
    // 触摸捕获指针：手指滑出按钮不会中断录音，且 up/cancel 都稳定落回本元素
    if (e.pointerType === "touch") {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* 某些浏览器在特定时序下会抛错，忽略即可 */
      }
    }
    pressedRef.current = true;
    onPressRef.current?.();
    onToggleRef.current?.("idle");
  }, []);

  // ── 松开 / 离开 / 取消：结束本次录音 ──
  // pointerup（正常松手）、pointercancel（iOS 手势被打断）、pointerleave（鼠标拖离）
  // 统一走这里；用本地 pressedRef 去重，只结束由本组件发起的那次按压。
  const handlePointerEnd = useCallback(() => {
    if (!pressAndHoldRef.current) return;
    if (!pressedRef.current) return;
    pressedRef.current = false;
    onReleaseRef.current?.();
    onToggleRef.current?.("recording");
  }, []);

  // ── 点击（非 pressAndHold 模式用） ──
  const handleClick = useCallback(() => {
    if (statusRef.current === "disabled" || statusRef.current === "processing") return;
    if (!pressAndHoldRef.current) {
      onToggleRef.current?.(statusRef.current);
    }
  }, []);

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-4 select-none", className)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 按钮 + 光环容器 — 固定大小容纳光环 */}
      <div className={cn("relative flex items-center justify-center", s.ring)}>
        {/* idle 态：微弱常驻辉光 */}
        {isIdle && (
          <span
            className={cn(
              ringCenter,
              "rounded-full bg-primary/5 blur-xl",
              s.ring,
            )}
          />
        )}
        {/* recording 态：脉动光环 */}
        {isRecording && (
          <>
            <span
              className={cn(
                ringCenter,
                "rounded-full border-2 border-primary/40 animate-ping",
                s.ring,
              )}
              style={{ "--tw-anim-duration": "1.5s" } as CSSProperties}
            />
            <span
              className={cn(
                ringCenter,
                "rounded-full border border-primary/30 animate-pulse",
                s.ring,
              )}
              style={{ "--tw-anim-duration": "2s" } as CSSProperties}
            />
            <span
              className={cn(
                ringCenter,
                "rounded-full bg-primary/10 blur-2xl",
                s.ring,
              )}
            />
          </>
        )}

        {/* 波形条 */}
        {isRecording && levels.length > 0 && (
          <div
            className={cn(
              ringCenter,
              "flex items-center justify-center gap-[3px]",
              s.ring,
            )}
          >
            {levels.map((lv, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-primary transition-all duration-100"
                style={{
                  height: `${Math.max(4, (lv || 0) * 100)}%`,
                  opacity: Math.max(0.3, lv || 0),
                }}
              />
            ))}
          </div>
        )}

        {/* 主按钮 — 始终居中 */}
        <button
          type="button"
          disabled={isDisabled}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          onClick={handleClick}
          aria-label={
            isRecording ? "松开结束录音" : isProcessing ? "处理中" : "按住说话"
          }
          className={cn(
            "relative z-10 inline-flex items-center justify-center rounded-full",
            "border-2 border-border bg-surface text-foreground",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "touch-none",
            s.btn,
            isRecording && "scale-90 border-danger bg-danger/10 text-danger",
            isProcessing && "animate-spin border-chart-3 text-chart-3",
            isIdle && !isDisabled && "hover:scale-105 hover:bg-surface-hover cursor-pointer",
            isDisabled && "pointer-events-none opacity-40",
          )}
          {...props}
        >
          {/* mic 图标 */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "transition-all duration-200",
              size === "lg" ? "size-8" : size === "sm" ? "size-5" : "size-6",
              isProcessing && "hidden",
            )}
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          {/* processing spinner */}
          {isProcessing && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={size === "lg" ? "size-8" : size === "sm" ? "size-5" : "size-6"}
            >
              <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* 状态标签 */}
      <span
        className={cn(
          "font-medium transition-colors duration-200",
          s.font,
          isRecording && "text-danger",
          isProcessing && "text-chart-3",
          isDisabled && "text-muted",
        )}
      >
        {isRecording ? labelRecording : isProcessing ? labelProcessing : labelIdle}
      </span>
    </div>
  );
}
