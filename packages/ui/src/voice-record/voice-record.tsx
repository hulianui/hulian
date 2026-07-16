"use client";
import { useCallback, useRef, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { VoiceRecordProps, VoiceRecordStatus } from "./voice-record.types";

const sizeMap = {
  sm: { btn: "size-20", ring: "size-24", font: "text-xs" },
  md: { btn: "size-26", ring: "size-32", font: "text-sm" },
  lg: { btn: "size-32", ring: "size-40", font: "text-base" },
};

/**
 * VoiceRecord — 语音录制触发器
 *
 * 圆形麦克风按钮，通过 status 驱动视觉反馈：
 *   idle       → 默认 mic 图标，可点击开始录音
 *   recording  → 脉动光环 + 波形动画，点击停止
 *   processing → 转圈加载态
 *   disabled   → 不可交互
 *
 * 涟漪脉动用 CSS 动画实现（纯动画，零 JS 测量），波形用传入的 levels 驱动条形振幅。
 * 完全受控：消费侧驱动 status 和 levels。
 */
export function VoiceRecord({
  status = "idle",
  labelIdle = "按住说话",
  labelRecording = "松开结束",
  labelProcessing = "处理中…",
  levels = [],
  size = "md",
  onToggle,
  className,
  disabled,
  ...props
}: VoiceRecordProps) {
  const s = sizeMap[size];
  const isRecording = status === "recording";
  const isProcessing = status === "processing";
  const isDisabled = disabled || status === "disabled";

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    onToggle?.(status);
  }, [status, isDisabled, onToggle]);

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-4 select-none", className)}
    >
      {/* 光环 + 按钮 容器 */}
      <div className="relative flex items-center justify-center">
        {/* 脉动光环 — recording 态 */}
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

        {/* 波形条 — recording 态 */}
        {isRecording && levels.length > 0 && (
          <div className={cn("absolute inset-0 flex items-center justify-center gap-[3px]", s.ring)}>
            {levels.map((lv, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-primary transition-all duration-150"
                style={{
                  height: `${Math.max(4, lv * 100)}%`,
                  opacity: Math.max(0.3, lv),
                }}
              />
            ))}
          </div>
        )}

        {/* 主按钮 */}
        <button
          type="button"
          onClick={handleClick}
          disabled={isDisabled}
          aria-label={
            isRecording ? "松开结束录音" : isProcessing ? "处理中" : "按住说话"
          }
          className={cn(
            "relative z-10 inline-flex items-center justify-center rounded-full",
            "border-2 border-border bg-surface text-foreground",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            s.btn,
            // recording 态：按钮缩小 + 红色边框
            isRecording && "scale-90 border-danger bg-danger/10 text-danger",
            // processing 态：旋转动画
            isProcessing && "animate-spin border-chart-3 text-chart-3",
            // idle 态：hover 放大
            !isRecording && !isProcessing && !isDisabled && "hover:scale-105 hover:bg-surface-hover",
            // disabled
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
          {/* processing 态：spinner */}
          {isProcessing && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn(
                size === "lg" ? "size-8" : size === "sm" ? "size-5" : "size-6",
              )}
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
