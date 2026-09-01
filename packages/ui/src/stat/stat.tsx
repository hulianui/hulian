import { memo } from "react";
import { TrendingUp, TrendingDown } from "../_icons";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import type { StatProps } from "./stat.types";

// KPI 指标卡：纯瑚琏皮肤（无图表库）。升=text-primary / 降=text-danger（无 success）。
//
// 视觉档位（克制提质，不引入任何新颜色）：
// · **有高度**：`border-hairline + shadow-sm`，走库内既定判据「有阴影 → 亮色去 border 改
//   hairline、暗色留 hairline」（同 Card 的 elevated 档）。此前是纯 1px 平面，一排 KPI 卡
//   与背后的内容区在同一个平面上，扫一眼分不出哪层是数据。
// · **不给 hover 抬升**：Stat 本身不可点。给了 hover:shadow-md 等于骗用户这儿能点。
// · **数字等宽**：`tabular-nums`。一排卡片的数字若按比例字距排，位数一变整列就左右跳动
//   —— 这是可读性缺陷，不是审美偏好。
// · **字号梯度拉到 2.1×**：label 14px → value 30px。KPI 卡里数字就是内容本身，
//   此前 24px 与标签只差 1.7 倍，主次不够。
function StatImpl({ label, value, delta, deltaLabel, hint, icon, chart, className, ...props }: StatProps) {
  const hasDelta = typeof delta === "number";
  const up = hasDelta && (delta as number) >= 0;
  // deltaLabel 是趋势行的附属文案，无 delta 时整块趋势不渲染 → 它会被静默吞掉。
  // 这种「配了没用、还不报错」的形态最难查（TS 过、控制台干净、页面只是少一行字），
  // 所以开发期显式点名，并指路到 hint（与趋势无关的注脚该走那条）。
  if (deltaLabel != null && !hasDelta) {
    warnOnce(
      "stat/deltaLabel-without-delta",
      "[hulian] Stat 传了 deltaLabel 但没有 delta，它不会被渲染；若想要与趋势无关的注脚请用 hint。",
    );
  }
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-hairline bg-surface p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      {/*
        min-h-8：标题行无论有没有 icon 都占 32px（icon 底座正是 size-8）。否则同一排 KPI 卡
        一半传 icon 一半不传时，数值行起点差 12px、卡片高矮不齐（#339）——「要么全有 icon
        要么全没有」这条约束该由组件保证，而不是靠消费方记住。
      */}
      <div className="flex min-h-8 items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon ? (
          // 中性图标底座：给角标一个立足点，避免它像一枚浮在留白里的孤零零线条。
          // 用 bg-muted（tokens 0.7.0 起 muted 就是背景色，muted-foreground 才是文字色），
          // 不着任何语义色 —— KPI 卡的注意力该在数字上。
          <span className="grid size-8 shrink-0 place-items-center rounded-[min(var(--radius),0.5rem)] bg-muted text-muted-foreground">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3 truncate text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      {chart ? <div className="mt-3">{chart}</div> : null}
      {hasDelta ? (
        // flex-wrap + 子项 whitespace-nowrap：窄容器下「+x% / 标签」整块换行，
        // 不再把数字或 CJK 标签逐字裂行（健壮自适应）。
        <div
          className={cn(
            "mt-2.5 flex flex-wrap items-center gap-x-1 text-sm font-medium tabular-nums",
            up ? "text-primary" : "text-danger",
          )}
        >
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            {up ? <TrendingUp className="size-4 shrink-0" /> : <TrendingDown className="size-4 shrink-0" />}
            {up ? "+" : ""}
            {delta}%
          </span>
          {deltaLabel ? <span className="whitespace-nowrap text-muted-foreground">{deltaLabel}</span> : null}
        </div>
      ) : null}
      {hint != null ? (
        // 排在趋势行之下：趋势是对数值本身的解读，hint 是整张卡的注脚，语义层级更外。
        // 用 text-xs（比趋势行的 text-sm 小一档）拉开视觉层次，避免两行 muted 文字糊成一片。
        <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
StatImpl.displayName = "Stat";

// KPI 卡永远成行铺（工作台一排 4 张），父级一动就整排重算。props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Stat = memo(StatImpl);
Stat.displayName = "Stat";
