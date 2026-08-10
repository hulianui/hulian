"use client";
import { memo } from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import { cn } from "../lib/cn";
import type { MeterProps } from "./meter.types";

// 度量条：表达「静态量占比」(磁盘/电量/评分占比)，role=meter（区别于 Progress 的 role=progressbar）。
// 几何禁区：Indicator 宽度由 Base UI 内联自算，皮肤只给外观（禁写 width/left/transform）。

/** 归一化成 0–100 的百分数。max === min 时没有可表达的比例，按 0 处理。 */
function toPercent(value: number, min: number, max: number): number {
  if (!(max > min)) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

/** 默认文案：最多一位小数（78.6254% → 78.6%），整数不带小数点。 */
function defaultText(percent: number): string {
  return `${Math.round(percent * 10) / 10}%`;
}

function MeterImpl({
  value,
  min = 0,
  max = 100,
  label,
  showValue = false,
  formatValue,
  className,
}: MeterProps) {
  // Base UI 的默认文案与默认 aria-valuetext 都是「原始 value 直接拼 %」（MeterRoot 里写死的
  // `${value}%`），max ≠ 100 时它与指示条宽度自相矛盾 —— 1041/1324 的条形是 78.6%，
  // 印出来的字却是「1,041%」（hulianui/hulian#108）。所以文案由这里统一算，
  // 并通过 getAriaValueText 让读屏念到同一句：可见与可听不允许有两套说法。
  const percent = toPercent(value, min, max);
  const text = formatValue ? formatValue({ value, min, max, percent }) : defaultText(percent);
  return (
    <BaseMeter.Root
      value={value}
      min={min}
      max={max}
      getAriaValueText={() => text}
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label ? <BaseMeter.Label className="text-muted-foreground">{label}</BaseMeter.Label> : <span />}
          {showValue && (
            <BaseMeter.Value className="tabular-nums text-foreground">{() => text}</BaseMeter.Value>
          )}
        </div>
      )}
      <BaseMeter.Track className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        <BaseMeter.Indicator className="h-full rounded-full bg-primary" />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
MeterImpl.displayName = "Meter";

// 度量条常成组出现（资源面板一屏十几条），props 全是稳定原语时 React 无法自己 bailout，
// 只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。value 是 prop，变了照常重渲染。
export const Meter = memo(MeterImpl);
Meter.displayName = "Meter";
