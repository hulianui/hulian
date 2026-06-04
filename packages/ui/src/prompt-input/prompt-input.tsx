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
  trailing,
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
        // flex-col：textarea 整行铺满在上 + 底部工具栏(actions 左 / trailing+发送 右)。
        // 文本区始终满宽，操作不挤压输入；工具栏填满底部不显空（DeepSeek/ChatGPT 式）。
        "flex flex-col gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-sm transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
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
        className="w-full resize-none border-0 bg-transparent px-1 py-0.5 shadow-none focus-visible:ring-0"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">{actions}</div>
        <div className="flex shrink-0 items-center gap-1">
          {trailing}
          {loading ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onStop}
              aria-label="停止生成"
              className="size-8 shrink-0 rounded-full px-0"
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
              className="size-8 shrink-0 rounded-full px-0"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
