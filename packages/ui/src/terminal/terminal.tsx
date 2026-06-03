"use client";
import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import { tokenizeTerminal, type TermTokenType } from "./terminal-highlight";
import type { TerminalLine, TerminalProps } from "./terminal.types";

// 吸取自 magicui.design Terminal：mac 窗口外壳 + 命令行逐行揭示（motion，必 "use client"）。
// 瑚琏化：窗口/红绿灯/文字走 token；行按 index*lineDelay 顺序淡入（挂载即播，无需 IntersectionObserver）；
// reduced-motion → 全部直接显示。减包：m + LazyMotionProvider(domAnimation) 取代全量 motion。
const toneClass = { command: "text-foreground", muted: "text-muted", success: "text-primary" } as const;

// 各 token 着色（吃 --code-* → 明暗自适应）。plain 不着色，继承所在行的 tone 色。
const TERM_STYLE: Partial<Record<TermTokenType, CSSProperties>> = {
  string: { color: "var(--code-string)" },
  url: { color: "var(--code-string)", textDecoration: "underline" },
  flag: { color: "var(--code-attr)" },
  number: { color: "var(--code-number)" },
};

function colorize(text: string): ReactNode {
  return tokenizeTerminal(text).map((t, i) =>
    t.type === "plain" ? t.value : (
      <span key={i} style={TERM_STYLE[t.type]}>
        {t.value}
      </span>
    ),
  );
}

// 命令行：行首词（命令名）用 keyword 色，其余走通用着色；输出行整段着色。
function LineContent({ line, highlight }: { line: TerminalLine; highlight: boolean }) {
  const { text, tone = "command" } = line;
  if (!highlight || typeof text !== "string") return <span>{text}</span>;
  if (tone === "command") {
    const match = /^(\s*)(\S+)([\s\S]*)$/.exec(text);
    if (!match) return <span>{colorize(text)}</span>;
    const [, lead, cmd, rest] = match;
    return (
      <span>
        {lead}
        <span style={{ color: "var(--code-keyword)" }}>{cmd}</span>
        {colorize(rest)}
      </span>
    );
  }
  if (tone === "muted") return <span>{colorize(text)}</span>;
  return <span>{text}</span>;
}

export function Terminal({ lines, lineDelay = 0.4, title = "bash", highlight = true, className }: TerminalProps) {
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
        <LazyMotionProvider>
          {lines.map((line, i) => (
            <m.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * lineDelay, duration: 0.25 }}
              className={cn("flex gap-2 whitespace-pre-wrap break-all", toneClass[line.tone ?? "command"])}
            >
              {line.prompt && <span className="select-none text-muted">{line.prompt}</span>}
              <LineContent line={line} highlight={highlight} />
            </m.div>
          ))}
        </LazyMotionProvider>
      </div>
    </div>
  );
}
