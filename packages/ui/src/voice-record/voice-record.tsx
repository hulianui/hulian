"use client";
import { useCallback, useRef, type CSSProperties, type PointerEvent } from "react";
import { cn } from "../lib/cn";
import type { VoiceRecordProps, VoiceRecordStatus } from "./voice-record.types";

// 尺寸（Tailwind v4 标准 spacing）：ring 必须明显大于 btn，光环才在按钮外围
const sizeMap = {
  sm: { btn: "size-20", ring: "size-24", font: "text-xs" },
  md: { btn: "size-24", ring: "size-32", font: "text-sm" },
  lg: { btn: "size-28", ring: "size-40", font: "text-base" },
};

/**
 * VoiceRecord — 语音录制触发器
 *
 * 支持两种交互模式：
 *   - 默认 pressAndHold：按下开始→松开结束（GPT-Live 风格）
 *   - pressAndHold=false：点击切换开始/停止
 *
 * 关键实现细节：pointer 事件的闭包问题。
 * onPointerUp 必须通过 ref 读取最新 status，不能在 useCallback 里闭包捕获，
 * 否则 iOS 上 status 从 "idle" 变为 "recording" 后，onPointerUp 的 isRecording
 * 闭包可能还是旧值，导致无法停止录音。
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

  // ── Ref 方案解决 pointer 事件闭包问题 ──
  // 每次渲染同步最新值，回调里读 ref，不依赖 useCallback 的 deps 重建
  const statusRef = useRef(status);
  statusRef.current = status;
  const pressAndHoldRef = useRef(pressAndHold);
  pressAndHoldRef.current = pressAndHold;
  const onToggleRef = useRef(onToggle);
  onToggleRef.current = onToggle;
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  // ── 指针按下：idle 态触发录音开始 ──
  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (statusRef.current !== "idle") return;
      e.preventDefault();
      if (pressAndHoldRef.current) {
        onPress?.();
        onToggleRef.current?.("idle");
      }
    },
    [onPress],
  );

  // ── 指针松开 / 离开：recording 态触发停止 ──
  const handlePointerUp = useCallback((e: PointerEvent) => {
    e.preventDefault();
    if (pressAndHoldRef.current && statusRef.current === "recording") {
      onReleaseRef.current?.();
      onToggleRef.current?.(statusRef.current);
    }
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
      {/* 按钮 + 光环 */}
      <div className="relative flex items-center justify-center">
        {/* 脉动光环 */}
        {isRecording && (
          <>
            <span
              className={cn(
                "absolute inset-0 rounded-full border-2 border-primary/40",
                "animate-ping",
                s.ring,
              )}
              style={{ "--tw-anim-duration": "1.5s" } as CSSProperties}
            />
            <span
              className={cn(
                "absolute inset-0 rounded-full border border-primary/30",
                "animate-pulse",
                s.ring,
              )}
              style={{ "--tw-anim-duration": "2s" } as CSSProperties}
            />
          </>
        )}

        {/* 波形条 */}
        {isRecording && levels.length > 0 && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-[3px]",
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

        {/* 主按钮 */}
        <button
          type="button"
          disabled={isDisabled}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleClick}
          aria-label={
            isRecording ? "松开结束录音" : isProcessing ? "处理中" : "按住说话"
          }
          data-recording={isRecording || undefined}
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
