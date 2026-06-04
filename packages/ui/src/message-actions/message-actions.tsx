"use client";
import { useState, type ReactNode } from "react";
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown } from "../_icons";
import { cn } from "../lib/cn";
import type { MessageActionsProps } from "./message-actions.types";

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
          : "text-muted hover:bg-surface-hover hover:text-foreground",
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
  const [copied, setCopied] = useState(false);
  const [feeling, setFeeling] = useState<"like" | "dislike" | null>(null);
  const showCopy = content != null || !!onCopy;

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
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)} {...props}>
      {showCopy && (
        <IconBtn label={copied ? "已复制" : "复制"} onClick={copy}>
          {copied ? <Check className="text-success" /> : <Copy />}
        </IconBtn>
      )}
      {onRegenerate && (
        <IconBtn label="重新生成" onClick={onRegenerate}>
          <RefreshCw />
        </IconBtn>
      )}
      {onLike && (
        <IconBtn
          label="赞"
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
          label="踩"
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
