"use client";
import { useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "../_icons";
import { cn } from "../lib/cn";
import { Button } from "../button";
import { Textarea } from "../textarea";
import type { PromptInputProps } from "./prompt-input.types";

// 提示输入：复用瑚琏 Textarea(autoResize 自增高) + 发送/停止键。
// Enter 提交、Shift+Enter 换行、IME 合成中不误触发。受控/非受控两用。
export function PromptInput({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  placeholder = "发消息…",
  loading,
  onStop,
  disabled,
  maxRows = 8,
  actions,
  className,
}: PromptInputProps) {
  const [inner, setInner] = useState(defaultValue);
  const isControlled = value !== undefined;
  const text = isControlled ? value : inner;

  const setText = (v: string) => {
    if (!isControlled) setInner(v);
    onValueChange?.(v);
  };

  const submit = () => {
    const t = text.trim();
    if (!t || disabled || loading) return;
    onSubmit?.(t);
    if (!isControlled) setInner("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME（中文/日文）合成确认的 Enter 不应提交
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-surface p-2 transition-colors focus-within:border-primary",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoResize
        rows={1}
        style={{ maxHeight: `${maxRows * 1.5}rem` }}
        className="resize-none border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-0"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">{actions}</div>
        {loading ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onStop}
            aria-label="停止生成"
            className="size-8 shrink-0 px-0"
          >
            <Square className="size-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={submit}
            disabled={disabled || !text.trim()}
            aria-label="发送"
            className="size-8 shrink-0 px-0"
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
