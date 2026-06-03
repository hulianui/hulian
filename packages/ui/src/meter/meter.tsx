"use client";
import { Meter as BaseMeter } from "@base-ui-components/react/meter";
import { cn } from "../lib/cn";
import type { MeterProps } from "./meter.types";

// 度量条：表达「静态量占比」(磁盘/电量/评分占比)，role=meter（区别于 Progress 的 role=progressbar）。
// 几何禁区：Indicator 宽度由 Base UI 内联自算，皮肤只给外观（禁写 width/left/transform）。
export function Meter({ value, min = 0, max = 100, label, showValue = false, className }: MeterProps) {
  return (
    <BaseMeter.Root value={value} min={min} max={max} className={cn("flex w-full flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label ? <BaseMeter.Label className="text-muted">{label}</BaseMeter.Label> : <span />}
          {showValue && <BaseMeter.Value className="tabular-nums text-foreground" />}
        </div>
      )}
      <BaseMeter.Track className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        <BaseMeter.Indicator className="h-full rounded-full bg-primary" />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
