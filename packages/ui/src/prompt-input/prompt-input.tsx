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
        // 内联单行：actions(左) + textarea(中·自增高) + 发送/停止(右)，底对齐 → 单行紧凑(~48px)、多行按钮跟随底部。
        "flex items-end gap-1.5 rounded-[1.25rem] border border-border bg-surface py-2 pl-3.5 pr-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      {actions ? (
        <div className="flex shrink-0 items-center gap-0.5 self-end pb-0.5">{actions}</div>
      ) : null}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoResize
        rows={1}
        style={{ maxHeight: `${maxRows * 1.5}rem` }}
        className="flex-1 resize-none border-0 bg-transparent px-0 py-1 shadow-none focus-visible:ring-0"
      />
      {loading ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onStop}
          aria-label="停止生成"
          className="size-8 shrink-0 self-end rounded-full px-0"
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
          className="size-8 shrink-0 self-end rounded-full px-0"
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
    </div>
  );
}
