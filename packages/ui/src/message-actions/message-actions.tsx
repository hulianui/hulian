"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown } from "../_icons";
import { cn } from "../lib/cn";
import type { MessageActionsProps } from "./message-actions.types";
import { useComponentLocale } from "../config/locale-context";

// 消息操作条：复制(剪贴板+Check反馈) / 重新生成 / 赞 / 踩。各键仅在对应回调或 content 存在时渲染。
function IconBtn({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-[var(--radius)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-3.5",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function MessageActions({
  content,
  onCopy,
  onRegenerate,
  onLike,
  onDislike,
  className,
  children,
  ...props
}: MessageActionsProps) {
  const labels = useComponentLocale().messageActions ?? {
    copy: "复制",
    copied: "已复制",
    regenerate: "重新生成",
    like: "赞",
    dislike: "踩",
  };
  const [copied, setCopied] = useState(false);
  const [feeling, setFeeling] = useState<"like" | "dislike" | null>(null);
  const showCopy = content != null || !!onCopy;
  // 复制反馈复位计时器：用 ref 持有以便重复点击时去抖、卸载时清理，避免对已卸载组件 setState
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const copy = async () => {
    if (content != null) {
      try {
        await navigator.clipboard.writeText(content);
      } catch {
        // 剪贴板不可用（非安全上下文等）时静默，仍触发回调与反馈
      }
    }
    onCopy?.();
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)} {...props}>
      {showCopy && (
        <IconBtn label={copied ? labels.copied : labels.copy} onClick={copy}>
          {copied ? <Check className="text-success" /> : <Copy />}
        </IconBtn>
      )}
      {onRegenerate && (
        <IconBtn label={labels.regenerate} onClick={onRegenerate}>
          <RefreshCw />
        </IconBtn>
      )}
      {onLike && (
        <IconBtn
          label={labels.like}
          active={feeling === "like"}
          onClick={() => {
            setFeeling((f) => (f === "like" ? null : "like"));
            onLike();
          }}
        >
          <ThumbsUp />
        </IconBtn>
      )}
      {onDislike && (
        <IconBtn
          label={labels.dislike}
          active={feeling === "dislike"}
          onClick={() => {
            setFeeling((f) => (f === "dislike" ? null : "dislike"));
            onDislike();
          }}
        >
          <ThumbsDown />
        </IconBtn>
      )}
      {children}
    </div>
  );
}
