"use client";
import { useEffect, useRef, useState } from "react";
import { Alert } from "../alert";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { Skeleton } from "../skeleton";
import { Text } from "../text";
import { MATH_FIELD_LOCALE_ZH } from "./math-field.locale";
import type { MathFieldProps } from "./math-field.types";
import { loadMathLive, MATHLIVE_INSTALL_HINT, type MathfieldLike } from "./mathlive-loader";

type Status = "loading" | "ready" | "unavailable";

// MathLive 通过 CSS 变量取色，自定义属性能从宿主继承进 shadow DOM。这里把它们钉到本库 token，
// 亮 / 暗主题随 token 切换，不另写一份。变量名来自 mathlive.mjs 实际读取的清单。
const THEME_VARS = cn(
  "[--caret-color:var(--color-primary)]",
  "[--selection-background-color:color-mix(in_oklch,var(--color-primary)_18%,transparent)]",
  "[--selection-color:var(--color-foreground)]",
  "[--contains-highlight-background-color:color-mix(in_oklch,var(--color-primary)_10%,transparent)]",
  "[--placeholder-color:var(--color-muted-foreground)]",
  "[--smart-fence-color:var(--color-muted-foreground)]",
  "[--latex-color:var(--color-foreground)]",
  "[--highlight-text:var(--color-foreground)]",
  "[--correct-color:var(--color-success)]",
  "[--incorrect-color:var(--color-danger)]",
);

// 宿主里那个 <math-field> 的外观：与 Input 同一套静止态 / 聚焦态（照抄 inputShellVariants 的 default 档）。
const HOST_CLASS = cn(
  "[&>math-field]:block [&>math-field]:w-full [&>math-field]:min-h-10",
  "[&>math-field]:rounded-[var(--radius)] [&>math-field]:border [&>math-field]:border-border [&>math-field]:bg-surface",
  "[&>math-field]:px-3 [&>math-field]:py-1.5 [&>math-field]:text-base [&>math-field]:text-foreground",
  "[&>math-field:focus-within]:outline-none [&>math-field:focus-within]:ring-2 [&>math-field:focus-within]:ring-ring",
  "[&>math-field:focus-within]:ring-offset-2 [&>math-field:focus-within]:ring-offset-bg",
  "[&>math-field[disabled]]:pointer-events-none [&>math-field[disabled]]:opacity-50",
  // 内置右键菜单已在 JS 里清空（menuItems = []）；键盘切换钮按 virtualKeyboard 决定。
  "[&>math-field::part(menu-toggle)]:hidden",
);
const KEYBOARD_OFF_CLASS = "[&>math-field::part(virtual-keyboard-toggle)]:hidden";

/**
 * MathLive 驱动的可视化公式输入框。值是不带 `$` 的 LaTeX。
 * 服务端与首帧渲染骨架；`mathlive` 在 effect 里动态加载，没装时显示安装提示而不是抛错。
 */
export function MathField({
  value,
  onChange,
  onSubmit,
  virtualKeyboard = "auto",
  keyboardLayouts,
  readOnly = false,
  disabled = false,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: MathFieldProps) {
  const L = useComponentLocale().mathField ?? MATH_FIELD_LOCALE_ZH;
  const hostRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<MathfieldLike | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // 最新回调放 ref：监听器只在挂元素时绑一次，不随每次渲染重绑。
  const latest = useRef({ onChange, onSubmit });
  latest.current = { onChange, onSubmit };
  // 初值也走 ref：挂元素的 effect 不依赖 value，否则每次输入都会重建元素。
  const initialValue = useRef(value);
  initialValue.current = value;

  useEffect(() => {
    let cancelled = false;
    loadMathLive().then(
      () => {
        if (!cancelled) setStatus("ready");
      },
      (error: unknown) => {
        if (cancelled) return;
        warnOnce("math-field:mathlive-missing", error instanceof Error ? error.message : String(error));
        setStatus("unavailable");
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // 挂真元素（ready 后一次）。
  useEffect(() => {
    if (status !== "ready") return;
    const host = hostRef.current;
    if (!host) return;
    const el = document.createElement("math-field") as MathfieldLike;
    // 先连上 DOM 再动它：MathLive 的 setValue / menuItems 在元素未挂载时会抛 "Mathfield not mounted"。
    host.appendChild(el);
    el.menuItems = [];
    el.setValue(initialValue.current, { silenceNotifications: true });
    fieldRef.current = el;

    const onInput = () => latest.current.onChange(el.getValue("latex"));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey || !latest.current.onSubmit) return;
      event.preventDefault();
      latest.current.onSubmit(el.getValue("latex"));
    };
    el.addEventListener("input", onInput);
    el.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("input", onInput);
      el.removeEventListener("keydown", onKeyDown);
      el.remove();
      fieldRef.current = null;
    };
  }, [status]);

  // 受控同步：父层 value 变了且与元素当前值不同才写，写时静默（不触发 input → 不回环 onChange）。
  useEffect(() => {
    const el = fieldRef.current;
    if (!el || el.getValue("latex") === value) return;
    el.setValue(value, { silenceNotifications: true });
  }, [value, status]);

  // 属性透传。
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.disabled = disabled;
    el.readOnly = readOnly;
    el.placeholder = placeholder ?? "";
    el.mathVirtualKeyboardPolicy = virtualKeyboard === "off" ? "manual" : virtualKeyboard;
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    else el.removeAttribute("aria-label");
  }, [status, disabled, readOnly, placeholder, virtualKeyboard, ariaLabel]);

  // 键盘布局是页面级单例（window.mathVirtualKeyboard），给了才动它。
  useEffect(() => {
    if (status !== "ready" || !keyboardLayouts) return;
    const keyboard = (window as { mathVirtualKeyboard?: { layouts: readonly unknown[] } }).mathVirtualKeyboard;
    if (keyboard) keyboard.layouts = keyboardLayouts;
  }, [status, keyboardLayouts]);

  return (
    <div
      data-slot="math-field"
      data-status={status}
      data-keyboard={virtualKeyboard}
      className={cn("relative w-full", THEME_VARS, className)}
    >
      {/* <math-field> 是这个 host 的直接子级：HOST_CLASS 里的 `&>math-field` 选择器只在这一层成立。 */}
      <div
        ref={hostRef}
        className={cn(HOST_CLASS, virtualKeyboard === "off" && KEYBOARD_OFF_CLASS, status !== "ready" && "hidden")}
      />
      {status === "loading" && <Skeleton shape="rect" className="h-10 w-full" aria-label={L.loading} />}
      {status === "unavailable" && (
        <Alert tone="warning" title={L.missing}>
          <Text as="span" size="sm">
            {L.missingHint}{" "}
          </Text>
          <code className="font-mono text-sm">{MATHLIVE_INSTALL_HINT}</code>
        </Alert>
      )}
    </div>
  );
}
