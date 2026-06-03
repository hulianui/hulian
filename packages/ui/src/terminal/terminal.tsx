"use client";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { TerminalProps } from "./terminal.types";

// 吸取自 magicui.design Terminal：mac 窗口外壳 + 命令行逐行揭示（motion，必 "use client"）。
// 瑚琏化：窗口/红绿灯/文字走 token；行按 index*lineDelay 顺序淡入（挂载即播，无需 IntersectionObserver）；
// reduced-motion → 全部直接显示。
const toneClass = { command: "text-foreground", muted: "text-muted", success: "text-primary" } as const;

export function Terminal({ lines, lineDelay = 0.4, title = "bash", className }: TerminalProps) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "w-full max-w-lg overflow-hidden rounded-[var(--radius)] border border-border bg-surface font-mono text-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="size-3 rounded-full bg-danger/70" />
        <span className="size-3 rounded-full bg-[oklch(0.8_0.15_85)]" />
        <span className="size-3 rounded-full bg-primary/70" />
        <span className="ml-2 text-xs text-muted">{title}</span>
      </div>
      <div className="flex flex-col gap-1 p-4">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * lineDelay, duration: 0.25 }}
            className={cn("flex gap-2 whitespace-pre-wrap break-all", toneClass[line.tone ?? "command"])}
          >
            {line.prompt && <span className="select-none text-muted">{line.prompt}</span>}
            <span>{line.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
