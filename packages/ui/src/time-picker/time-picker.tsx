"use client";
import { useEffect, useRef, useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Clock, X } from "../_icons";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import {
  buildOptions,
  clampTime,
  formatTime,
  isHourDisabled,
  isMinuteDisabled,
  isSecondDisabled,
  pad2,
  parseTime,
  snapToStep,
  type TimeParts,
} from "./time-picker-core";
import type { TimePickerProps } from "./time-picker.types";

// 零依赖时间选择器：Base UI Popover + 三列滚动候选（时/分/秒）。
// 库里此前只有 _mui/TimeField（分段键盘输入、无浮层、无 min/max/step），
// 想要 el-time-picker 那种「点开选」的体验就只能自己搓。
//
// 值是定宽 "HH:mm[:ss]" 文本而非 Date：定宽 → 字典序即时间序，范围比较直接比字符串，
// 也不会像 Date 那样被时区搅进来。

// 与 popover.tsx 同款：transition 简写避免与 Base UI 内联长写混用触发 React shorthand 警告。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

/** 单列候选。选中项在打开时滚入视口——否则 23 点的值要用户自己滚到底去找。 */
function Column({
  label,
  values,
  active,
  isDisabled,
  onPick,
  open,
}: {
  label: string;
  values: number[];
  active: number | null;
  isDisabled: (v: number) => boolean;
  onPick: (v: number) => void;
  open: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = activeRef.current;
    const box = listRef.current;
    // jsdom 无布局，offsetTop 恒 0；这里只做「有就滚」，测不到不影响正确性
    if (el && box) box.scrollTop = el.offsetTop;
  }, [open, active]);

  return (
    <div className="flex min-w-0 flex-col">
      <div className="border-b border-border px-2 py-1 text-center text-xs text-muted">{label}</div>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="h-48 w-14 overflow-y-auto scroll-smooth py-1"
      >
        {values.map((v) => {
          const dis = isDisabled(v);
          const isActive = active === v;
          return (
            <button
              key={v}
              type="button"
              role="option"
              aria-selected={isActive}
              aria-label={`${label} ${pad2(v)}`}
              disabled={dis}
              ref={isActive ? activeRef : undefined}
              onClick={() => onPick(v)}
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                isActive
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-foreground hover:bg-surface-hover",
                dis && "cursor-not-allowed text-muted/40 hover:bg-transparent",
              )}
            >
              {pad2(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  withSeconds = false,
  minuteStep = 1,
  secondStep = 1,
  minTime,
  maxTime,
  placeholder = "选择时间",
  clearable = true,
  showNow = true,
  disabled,
  readOnly,
  "aria-label": ariaLabel,
  className,
}: TimePickerProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const value = isControlled ? (valueProp ?? null) : internal;
  const parsed = parseTime(value);

  const [open, setOpen] = useState(false);

  const hours = buildOptions(23, 1);
  const minutes = buildOptions(59, minuteStep);
  const seconds = buildOptions(59, secondStep);

  function commit(next: string | null) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  // 尚未选值时的隐含基准：把 00:00:00 夹进 [min,max]。
  // 不这么做的话，min="09:30" 下基准小时恒为 0，分钟列会被整列判死——面板看着像坏了，
  // 用户还得先猜到「要先点小时」。夹紧后基准落在 09:30，分钟列立刻可用。
  const base: TimeParts = parsed ?? clampTime({ h: 0, m: 0, s: 0 }, withSeconds, minTime, maxTime);

  /** 改动某一列后重新提交；结果再夹一次，杜绝提交出范围外的值。 */
  function pick(patch: Partial<TimeParts>) {
    if (readOnly) return;
    const next = clampTime({ ...base, ...patch }, withSeconds, minTime, maxTime);
    commit(formatTime(next, withSeconds));
  }

  function pickNow() {
    if (readOnly) return;
    const d = new Date();
    const snapped = snapToStep({ h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() }, minuteStep, secondStep);
    commit(formatTime(clampTime(snapped, withSeconds, minTime, maxTime), withSeconds));
    setOpen(false);
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    commit(null);
  }

  const showClear = clearable && value != null && !disabled && !readOnly;
  const text = parsed ? formatTime(parsed, withSeconds) : "";

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
      }}
    >
      <div className={cn("relative inline-flex", className)}>
        <BasePopover.Trigger
          render={
            <button
              type="button"
              disabled={disabled}
              aria-label={ariaLabel}
              className={cn(
                "inline-flex h-9 min-w-[9rem] items-center gap-2 rounded-[var(--radius)] border border-border bg-bg px-3 text-sm text-foreground outline-none transition-colors",
                "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
                showClear && "pr-8",
              )}
            >
              <Clock className="size-4 shrink-0 text-muted" aria-hidden />
              <span className={cn("truncate tabular-nums", !text && "text-muted")}>{text || placeholder}</span>
            </button>
          }
        />
        {showClear && (
          <button
            type="button"
            aria-label="清除"
            onClick={clearValue}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
          <BasePopover.Popup
            className={cn(
              "rounded-[var(--radius)] border border-hairline bg-surface text-foreground shadow-xl outline-none",
              "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            <div className="flex divide-x divide-border">
              <Column
                label="时"
                values={hours}
                active={parsed?.h ?? null}
                isDisabled={(h) => isHourDisabled(h, minTime, maxTime)}
                onPick={(h) => pick({ h })}
                open={open}
              />
              <Column
                label="分"
                values={minutes}
                active={parsed?.m ?? null}
                isDisabled={(m) => isMinuteDisabled(base.h, m, minTime, maxTime)}
                onPick={(m) => pick({ m })}
                open={open}
              />
              {withSeconds && (
                <Column
                  label="秒"
                  values={seconds}
                  active={parsed?.s ?? null}
                  isDisabled={(s) => isSecondDisabled(base.h, base.m, s, minTime, maxTime)}
                  onPick={(s) => pick({ s })}
                  open={open}
                />
              )}
            </div>
            {showNow && (
              <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
                <button
                  type="button"
                  onClick={pickNow}
                  disabled={readOnly}
                  className="rounded-md px-2 py-1 text-sm text-primary outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  此刻
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-1 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  确定
                </button>
              </div>
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
