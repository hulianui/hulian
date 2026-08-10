"use client";
import { memo, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { Clock, X } from "../_icons";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import {
  clampTime,
  EMPTY_PARTS,
  formatTime,
  parseTime,
  SEGMENT_MAX,
  SEGMENT_ORDER,
  segmentText,
  stepSegment,
  type TimeParts,
  type TimeSegment,
  typeDigit,
} from "./time-field-core";
import type { TimeFieldProps } from "./time-field.types";

// 零依赖分段时间输入：时/分/秒各是一个 role="spinbutton"，键盘直接录入，不弹浮层。
// 要「点着选」用 TimePicker（列选式、带步进与此刻）；这里换的是另一种效率 ——
// 录一屏表单时手不离键盘。
//
// 段是 span 而不是 <input>：三个真 input 会各自吃掉浏览器的输入法/自动填充/校验行为，
// 而这里要的恰恰是完全自定义的两位缓冲逻辑（见 time-field-core 的 typeDigit）。

const segClass =
  "rounded px-0.5 tabular-nums outline-none transition-colors focus:bg-primary focus:text-primary-foreground";

// 外壳刻度与 Input 外壳逐字一致（32/40/48）：分段时间输入几乎总是和 Input/Select 并排落在
// 同一行表单里，任何自创档位都会当场露出高度差。min-w 是本组件的内容宽度，不随档位变。
const shellVariants = cva(
  [
    "relative inline-flex min-w-[7.5rem] items-center gap-2 rounded-[var(--radius)] border border-border bg-bg text-foreground transition-colors",
    "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
  ],
  {
    variants: {
      size: { sm: "h-8 px-2.5 text-sm", md: "h-10 px-3 text-sm", lg: "h-12 px-3.5 text-base" },
    },
    defaultVariants: { size: "md" },
  },
);

const shellIconVariants = cva("shrink-0 text-muted-foreground", {
  variants: { size: { sm: "size-3.5", md: "size-4", lg: "size-5" } },
  defaultVariants: { size: "md" },
});

function TimeFieldImpl({
  value: valueProp,
  defaultValue,
  onValueChange,
  withSeconds = false,
  size = "md",
  minTime,
  maxTime,
  clearable = true,
  disabled,
  readOnly,
  "aria-label": ariaLabelProp,
  className,
  ...rest
}: TimeFieldProps) {
  const labels = useComponentLocale().timeField ?? {
    time: "时间",
    hour: "小时",
    minute: "分钟",
    second: "秒",
    empty: "空",
    clear: "清除",
  };
  const ariaLabel = ariaLabelProp ?? labels.time;
  const segmentLabels: Record<TimeSegment, string> = {
    hour: labels.hour,
    minute: labels.minute,
    second: labels.second,
  };
  const isControlled = valueProp !== undefined;
  const [parts, setParts] = useState<TimeParts>(() => parseTime(valueProp ?? defaultValue));
  // 当前段还没输满两位时暂存首位。切段/失焦即清 —— 否则「1」会跨段黏到下一次输入上。
  const [buffer, setBuffer] = useState("");

  // 受控值被外部改掉时把编辑态拽回来。分段输入必须有内部态（输了时还没输分的中间态
  // 没法用外部 value 表达），所以这里只在 value **真的变了**的那一帧同步，而不是每帧派生。
  const [syncedValue, setSyncedValue] = useState<string | null>(valueProp ?? defaultValue ?? null);
  if (isControlled && (valueProp ?? null) !== syncedValue) {
    setSyncedValue(valueProp ?? null);
    setParts(parseTime(valueProp));
    setBuffer("");
  }

  const segRefs = useRef<Partial<Record<TimeSegment, HTMLSpanElement | null>>>({});
  const segments = withSeconds ? SEGMENT_ORDER : SEGMENT_ORDER.slice(0, 2);

  const locked = disabled || readOnly;
  const currentValue = formatTime(parts, withSeconds);
  const showClear = clearable && currentValue != null && !disabled && !readOnly;

  function focusSegment(seg: TimeSegment) {
    segRefs.current[seg]?.focus();
  }

  /** 写入分段值；整段输完才对外提交（并在此刻做一次 min/max 钳制）。 */
  function applyParts(next: TimeParts) {
    const raw = formatTime(next, withSeconds);
    if (raw == null) {
      setParts(next);
      return;
    }
    const clamped = clampTime(raw, withSeconds, minTime, maxTime);
    // 钳制真的改了值就把显示也拉到边界上，否则会出现「框里 23:00、值是 18:00」的错位
    setParts(clamped === raw ? next : parseTime(clamped));
    // 记下「这个值是我自己刚提交的」，**受控与否都要记**。少了这一步，受控用法下
    // 父组件把值回传下来时会被上面的同步分支当成「外部改了值」，连带把两位缓冲清空 ——
    // 表现是输 3 再输 0 得到 00 而不是 30（jsdom 里用 defaultValue 测不出来，得真键盘）。
    setSyncedValue(clamped);
    onValueChange?.(clamped);
  }

  function clearAll(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (locked) return;
    setParts({ ...EMPTY_PARTS });
    setBuffer("");
    setSyncedValue(null);
    onValueChange?.(null);
  }

  function handleKeyDown(e: React.KeyboardEvent, seg: TimeSegment) {
    if (disabled) return;
    const idx = segments.indexOf(seg);

    // 导航在 readOnly 下也放行 —— 只读不等于不能看、不能移焦点。
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = e.key === "ArrowLeft" ? idx - 1 : idx + 1;
      if (nextIdx >= 0 && nextIdx < segments.length) {
        setBuffer("");
        focusSegment(segments[nextIdx]);
      }
      return;
    }
    if (readOnly) return;

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      setBuffer("");
      applyParts({ ...parts, [seg]: stepSegment(parts[seg], seg, e.key === "ArrowUp" ? 1 : -1) });
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      setBuffer("");
      const next = { ...parts, [seg]: null };
      setParts(next);
      // 从「完整」退到「不完整」也是一次语义变化：值没了就得回传 null
      if (currentValue != null) {
        setSyncedValue(null);
        onValueChange?.(null);
      }
      return;
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const r = typeDigit(buffer, e.key, seg);
      setBuffer(r.buffer);
      applyParts({ ...parts, [seg]: r.value });
      // 这一段满了就自动往下走，跟原生日期输入一个手感
      if (r.complete && idx < segments.length - 1) focusSegment(segments[idx + 1]);
      return;
    }
  }

  return (
    <div
      {...rest}
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        shellVariants({ size }),
        disabled && "cursor-not-allowed opacity-50",
        showClear && "pr-8",
        className,
      )}
    >
      <Clock className={shellIconVariants({ size })} aria-hidden />
      <span className="inline-flex items-center">
        {segments.map((seg, i) => (
          <span key={seg} className="inline-flex items-center">
            {i > 0 && <span className="px-0.5 text-muted-foreground">:</span>}
            <span
              ref={(el) => {
                segRefs.current[seg] = el;
              }}
              role="spinbutton"
              tabIndex={disabled ? -1 : 0}
              aria-label={segmentLabels[seg]}
              aria-valuenow={parts[seg] ?? undefined}
              aria-valuemin={0}
              aria-valuemax={SEGMENT_MAX[seg]}
              aria-valuetext={parts[seg] == null ? labels.empty : segmentText(parts, seg)}
              aria-readonly={readOnly || undefined}
              onKeyDown={(e) => handleKeyDown(e, seg)}
              onBlur={() => setBuffer("")}
              className={cn(segClass, parts[seg] == null && "text-muted-foreground")}
            >
              {segmentText(parts, seg)}
            </span>
          </span>
        ))}
      </span>
      {showClear && (
        <button
          type="button"
          aria-label={labels.clear}
          onClick={clearAll}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
TimeFieldImpl.displayName = "TimeField";

// 时间字段常和一排 Input/Select 并列在同一张表单里，父级一动就整排重算。props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const TimeField = memo(TimeFieldImpl);
TimeField.displayName = "TimeField";
