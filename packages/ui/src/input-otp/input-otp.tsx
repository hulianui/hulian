"use client";
import { Fragment, useRef, useState, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from "react";
import { cn } from "../lib/cn";
import type { InputOTPProps } from "./input-otp.types";

// 分段验证码输入（自动跳格/退格回退/整段粘贴，含状态故 "use client"）。
// 槽位用空格占位保留位置（中间清空不左移），对外 join 时 trim 尾部空格。
export function InputOTP({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  type = "numeric",
  disabled = false,
  invalid = false,
  groupGap = false,
  className,
  "aria-label": ariaLabel = "验证码",
}: InputOTPProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const raw = isControlled ? value! : internal;
  const chars = Array.from({ length }, (_, i) => {
    const c = raw[i];
    return c === undefined || c === " " ? "" : c;
  });
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const accept = (s: string) => (type === "numeric" ? s.replace(/\D/g, "") : s.replace(/\s/g, ""));
  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const commit = (arr: string[]) => {
    const next = arr.map((c) => (c === "" ? " " : c)).join("").replace(/\s+$/g, "");
    if (!isControlled) setInternal(next);
    onChange?.(next);
    if (next.length === length && !next.includes(" ")) onComplete?.(next);
  };

  const onInput = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = accept(e.target.value);
    const arr = chars.slice();
    if (!cleaned) {
      arr[i] = "";
      commit(arr);
      return;
    }
    arr[i] = cleaned.slice(-1);
    commit(arr);
    if (i < length - 1) focusAt(i + 1);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = chars.slice();
      if (chars[i]) {
        arr[i] = "";
        commit(arr);
      } else if (i > 0) {
        arr[i - 1] = "";
        commit(arr);
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = accept(e.clipboardData.getData("text"));
    if (!text) return;
    const arr = chars.slice();
    for (let k = 0; k < text.length && i + k < length; k++) arr[i + k] = text[k];
    commit(arr);
    focusAt(Math.min(i + text.length, length - 1));
  };

  return (
    <div role="group" aria-label={ariaLabel} className={cn("inline-flex items-center gap-2", className)}>
      {chars.map((ch, i) => (
        <Fragment key={i}>
          {groupGap && i === Math.floor(length / 2) && (
            <span aria-hidden="true" className="mx-1 h-0.5 w-3 rounded-full bg-border" />
          )}
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode={type === "numeric" ? "numeric" : "text"}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            value={ch}
            onChange={(e) => onInput(i, e)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={(e) => onPaste(i, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              "size-10 rounded-[var(--radius)] border bg-surface text-center font-mono text-base text-foreground outline-none transition-colors",
              "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring",
              invalid ? "border-danger" : "border-border",
              disabled && "cursor-not-allowed opacity-50",
            )}
          />
        </Fragment>
      ))}
    </div>
  );
}
