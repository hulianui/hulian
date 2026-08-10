"use client";
import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { Spinner } from "../spinner/spinner";
import type { SpinProps } from "./spin.types";

// 加载遮罩（区别于裸 Spinner）：spinning 包裹 children → 半透明遮罩 + 居中 Spinner(复用瑚琏 Spinner) + tip；
// 不包 children 时作纯指示器；fullscreen 整页遮罩。delay 防闪：spinning 持续超过 delay 才显示。

export function Spin({
  spinning = true,
  tip,
  delay = 0,
  size = "md",
  fullscreen = false,
  children,
  className,
}: SpinProps) {
  // delay 防闪：delayed=true 表示仍在等待期（不显示）。初值据首帧 spinning&&delay 计算，避免挂载闪一下。
  const [delayed, setDelayed] = useState(() => spinning && delay > 0);

  useEffect(() => {
    if (spinning && delay > 0) {
      setDelayed(true);
      const t = setTimeout(() => setDelayed(false), delay);
      return () => clearTimeout(t);
    }
    setDelayed(false);
  }, [spinning, delay]);

  const visible = spinning && !delayed;

  const indicator = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Spinner size={size} />
      {tip && <div className="text-sm text-muted-foreground">{tip}</div>}
    </div>
  );

  // 整页遮罩：fixed 覆盖视口，忽略 children
  if (fullscreen) {
    if (!visible) return null;
    return (
      <div
        className={cn(
          "fixed inset-0 z-[70] flex items-center justify-center bg-bg/60 backdrop-blur-sm",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        {indicator}
      </div>
    );
  }

  // 纯指示器：不包 children 时直接渲 Spinner（无遮罩）
  if (children === undefined) {
    if (!visible) return null;
    return (
      <div className={cn("inline-flex", className)} role="status" aria-live="polite">
        {indicator}
      </div>
    );
  }

  // 包裹模式：相对容器 + 内容遮罩期降透明 + pointer-events:none + 居中遮罩
  return (
    <div className={cn("relative", className)} aria-busy={visible}>
      <div
        className={cn(
          "transition-opacity",
          visible && "pointer-events-none select-none opacity-50",
        )}
      >
        {children}
      </div>
      {visible && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-bg/60 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
        >
          {indicator}
        </div>
      )}
    </div>
  );
}
