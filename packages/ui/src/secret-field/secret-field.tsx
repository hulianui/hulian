"use client";
import { useState } from "react";
import { cn } from "../lib/cn";
import { Eye, EyeOff, Copy, Check } from "../_icons";
import type { MaskStrategy, SecretFieldProps } from "./secret-field.types";

// SecretField = 密钥/令牌掩码字段：默认 `sk-abc…wxyz` 掩码，眼睛 toggle 显形，一键复制原值，
// 尾部可挂重置/吊销动作槽。API key 管理页刚需。复制 idiom 同 Snippet（navigator.clipboard + 1.5s 反馈）。
const PREFIX = 6;
const SUFFIX = 4;

/** 掩码纯函数（可测）：full 全掩；prefix-suffix 前 6 + … + 后 4，过短退化全掩。 */
export function maskSecret(value: string, strategy: MaskStrategy = "prefix-suffix"): string {
  if (strategy === "full" || value.length <= PREFIX + SUFFIX) {
    return "•".repeat(Math.min(Math.max(value.length, 4), 16));
  }
  return `${value.slice(0, PREFIX)}…${value.slice(-SUFFIX)}`;
}

const iconBtn =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius),0.375rem)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

export function SecretField({
  value,
  revealed: revealedProp,
  onRevealedChange,
  maskStrategy = "prefix-suffix",
  copyable = true,
  onCopy,
  actions,
  readOnly,
  size = "md",
  className,
}: SecretFieldProps) {
  const [revealedState, setRevealedState] = useState(false);
  const revealed = revealedProp ?? revealedState;
  const [copied, setCopied] = useState(false);

  const toggleReveal = () => {
    const next = !revealed;
    if (revealedProp === undefined) setRevealedState(next);
    onRevealedChange?.(next);
  };

  const handleCopy = () => {
    void navigator.clipboard?.writeText(value);
    onCopy?.(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface font-mono",
        size === "sm" ? "h-8 px-2 text-xs" : "h-9 px-2.5 text-sm",
        readOnly && "bg-surface-hover",
        className,
      )}
    >
      <code className="truncate text-foreground">
        {revealed ? value : maskSecret(value, maskStrategy)}
      </code>
      <span className="ml-auto inline-flex items-center gap-0.5">
        <button
          type="button"
          onClick={toggleReveal}
          aria-label={revealed ? "隐藏" : "显示"}
          className={iconBtn}
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "已复制" : "复制"}
            className={iconBtn}
          >
            {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          </button>
        )}
        {actions}
      </span>
    </span>
  );
}
