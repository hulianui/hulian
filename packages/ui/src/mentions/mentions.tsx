"use client";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale";
import { textareaVariants } from "../textarea/textarea";
import {
  findTrigger,
  insertMention,
  defaultFilter,
  segmentMentions,
  type ActiveTrigger,
} from "./mentions.logic";
import { getCaretCoordinates } from "./mentions.caret";
import type { MentionsProps, MentionOption } from "./mentions.types";

// 高亮背板与 textarea 必须逐像素对齐：字号/行高/内边距同源（与 textareaVariants 的 size 映射一致）。
const BACKDROP_PAD: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2.5 py-1.5 text-sm",
  md: "px-3 py-2 text-sm",
  lg: "px-3.5 py-2.5 text-base",
};

// 自研 @提及 输入（零依赖·"use client"）：
//  - 基于受控/非受控 textarea，复用 Textarea 的 `textareaVariants` 皮肤。
//  - 键入触发符(prefix·默认 "@")后弹候选浮层；浮层锚到光标像素坐标(镜像 div 测，见 mentions.caret.ts)。
//  - 候选列表借 listbox 视觉皮肤，但焦点恒留在 textarea（mention 必须能边选边打字）→
//    用 aria-activedescendant 虚拟焦点 + textarea onKeyDown 漫游，而非 Listbox 的 roving DOM focus
//    （roving 会把焦点夺离 textarea 中断输入，故此处不直接挂 Listbox 组件，只沿用其皮肤）。
export function Mentions({
  value,
  defaultValue,
  onChange,
  options,
  prefix = "@",
  onSearch,
  filter,
  onSelect,
  size,
  invalid,
  rows = 3,
  disabled,
  className,
  popupClassName,
  onKeyDown,
  onClick,
  onKeyUp,
  ...rest
}: MentionsProps) {
  const labels = useComponentLocale().mentions ?? { suggestions: "提及候选" };
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const text = isControlled ? value! : internal;

  const taRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const [trigger, setTrigger] = useState<ActiveTrigger | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [active, setActive] = useState(0);
  // Esc 关闭后记下该 prefix 起点，避免同一次提及继续打字又弹回。
  const dismissedRef = useRef<number | null>(null);
  // 选中后待恢复的光标位置（值 commit 重渲后由 effect 落位）。
  const pendingCaret = useRef<number | null>(null);

  const candidates = useMemo(() => {
    if (!trigger) return [];
    if (filter === false) return options;
    const fn = typeof filter === "function" ? filter : defaultFilter;
    return options.filter((o) => fn(o, trigger.query));
  }, [trigger, options, filter]);

  const open = trigger !== null && candidates.length > 0;

  // 高亮背板分段：已提交的 @提及 套色 chip；背板随 textarea 内部滚动平移保持对齐。
  const segments = useMemo(() => segmentMentions(text, prefix), [text, prefix]);
  const syncScroll = () => {
    const el = taRef.current;
    const bd = backdropRef.current;
    if (el && bd) bd.style.transform = `translateY(${-el.scrollTop}px)`;
  };

  const commit = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const close = () => {
    setTrigger(null);
    dismissedRef.current = null;
  };

  const syncTrigger = (nextText: string, caret: number) => {
    const t = findTrigger(nextText, caret, prefix);
    if (!t || t.start === dismissedRef.current) {
      setTrigger(null);
      if (!t) dismissedRef.current = null;
      return;
    }
    setTrigger(t);
    setActive(0);
    onSearch?.(t.query);
    const el = taRef.current;
    if (el) {
      const c = getCaretCoordinates(el, caret);
      setCoords({ top: c.top + c.height - el.scrollTop, left: c.left - el.scrollLeft });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    commit(next);
    syncTrigger(next, e.target.selectionStart ?? next.length);
    syncScroll();
  };

  const select = (opt: MentionOption | undefined) => {
    if (!trigger || !opt || opt.disabled) return;
    const el = taRef.current;
    const caret = el?.selectionStart ?? text.length;
    const { value: next, caret: nextCaret } = insertMention(text, trigger.start, caret, prefix, opt.label);
    commit(next);
    close();
    pendingCaret.current = nextCaret;
    onSelect?.(opt);
  };

  // 选中后把光标落到插入文本之后（在值 commit 触发的重渲之后执行，避免被旧值覆盖）。
  // 同时每次渲染后校正背板滚动位移（受控值变更 / resize 等路径也覆盖）。
  useEffect(() => {
    if (pendingCaret.current != null && taRef.current) {
      const el = taRef.current;
      el.focus();
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
    syncScroll();
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => (a + 1) % candidates.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => (a - 1 + candidates.length) % candidates.length);
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        select(candidates[active]);
        break;
      case "Escape":
        e.preventDefault();
        dismissedRef.current = trigger?.start ?? null;
        setTrigger(null);
        break;
    }
  };

  // 光标因点击/左右移动而变位时，重新判定是否落入某次提及（打字路径已由 onChange 覆盖）。
  const refreshFromCaret = () => {
    const el = taRef.current;
    if (el) syncTrigger(text, el.selectionStart ?? text.length);
  };
  const handleClick = (e: MouseEvent<HTMLTextAreaElement>) => {
    onClick?.(e);
    refreshFromCaret();
  };
  const handleKeyUp = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyUp?.(e);
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) refreshFromCaret();
  };

  const pad = BACKDROP_PAD[size ?? "md"];

  return (
    <div className={cn("relative w-full", className)}>
      {/* 高亮背板：与 textarea 同字号/行高/内边距镜像文本，已提交 @提及 套色 chip。
          textarea 文本透明、仅留光标，故真正可见的彩色字形来自这一层（背板在下、textarea 在上）。 */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--radius)] border border-transparent bg-surface",
          disabled && "opacity-50",
        )}
      >
        <div
          ref={backdropRef}
          className={cn("whitespace-pre-wrap break-words text-foreground", pad)}
        >
          {segments.map((seg, i) =>
            seg.mention ? (
              <mark
                key={i}
                className="rounded-[0.25rem] bg-primary/12 text-primary"
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
          {/* 末行为换行时补一字符，保证背板末行高度与 textarea 一致（pre-wrap 末尾空行不撑高）。 */}
          {text.endsWith("\n") ? " " : null}
        </div>
      </div>

      <textarea
        {...rest}
        ref={taRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-autocomplete="list"
        value={text}
        rows={rows}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        onScroll={syncScroll}
        onBlur={(e) => {
          rest.onBlur?.(e);
          // 失焦关闭（候选项用 onMouseDown 抢在 blur 前选中，故不丢选择）。
          close();
        }}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        // 文本透明、背景透明（露出背板），仅保留光标色；彩色字形交给背板渲染。
        className={cn(textareaVariants({ size }), "relative resize-y bg-transparent text-transparent caret-foreground")}
      />

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={labels.suggestions}
          style={{ top: coords.top, left: coords.left }}
          className={cn(
            "absolute z-50 flex max-h-60 w-56 flex-col gap-0.5 overflow-y-auto rounded-[var(--radius)] border border-hairline bg-surface p-1 shadow-lg",
            popupClassName,
          )}
        >
          {candidates.map((opt, i) => {
            const isActive = i === active;
            return (
              <div
                key={opt.value}
                id={optionId(i)}
                role="option"
                aria-selected={isActive}
                aria-disabled={opt.disabled || undefined}
                // onMouseDown 抢在 textarea blur 之前触发选中，防失焦关闭把选择吞掉。
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(opt);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-sm outline-none transition-colors",
                  opt.disabled
                    ? "cursor-not-allowed text-muted opacity-50"
                    : isActive
                      ? "bg-surface-hover text-foreground"
                      : "text-foreground",
                )}
              >
                {opt.startContent && <span className="shrink-0">{opt.startContent}</span>}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{opt.label}</span>
                  {opt.description != null && (
                    <span className="truncate text-xs text-muted">{opt.description}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
