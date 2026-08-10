"use client";
import { memo, useMemo } from "react";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import type { GanttProps, GanttTask, GanttUnit } from "./gantt.types";

// 纯皮肤 · 零额外依赖（不引 dayjs/date-fns，自带日期数学）·只读甘特图。取舍说明：
// 1) 为何只读：拖拽改期需要 pointer 捕获 + 受控回写 + 吸附 + 撤销栈，复杂度远超「展示排期」
//    的本职诉求；多数中后台甘特只需把工序/进度可视化。拖拽编辑列为未来增强（届时在条形上
//    叠 pointer 手柄并新增 onChange，不破坏现有只读 API）。
// 2) 为何纯 CSS grid + 百分比定位：行用 CSS grid（左固定列 + 右轴区）天然对齐表头与条形；
//    条形以 left%/width% = (相对起点天数 / 总天数) 绝对定位，无需测量像素、无 JS 布局回路，
//    SSR 即可出正确比例，缩放/横向滚动下比例恒定。本体含 useMemo 派生 → 标记 "use client"。
// 3) 为何 UTC parseDate：仅日期（无时分）按本地时区 new Date 会因夏令时/时区在跨日差值上漂移；
//    用 Date.UTC 锁定到零点 UTC，daysBetween 用毫秒整除 86400000 得稳定整数天差。

const MS_PER_DAY = 86_400_000;

/** "YYYY-MM-DD" → UTC 零点 Date（避免本地时区漂移）。非法输入回退到 epoch。 */
function parseDate(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return new Date(0);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

/** a→b 相差的整天数（b - a），可负。两端均为 UTC 零点故结果为整数。 */
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/** UTC 日期加 n 天，返回新 Date。 */
function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

/** 该 UTC 日期所在周的周一（ISO 周，周一=1）。 */
function startOfISOWeek(d: Date): Date {
  const dow = d.getUTCDay(); // 0=周日..6=周六
  const back = dow === 0 ? 6 : dow - 1;
  return addDays(d, -back);
}

interface Tick {
  /** 距 rangeStart 的天偏移（刻度左缘） */
  offset: number;
  /** 刻度宽度（天） */
  span: number;
  /** 表头文案 */
  label: string;
}

/** 按 unit 在 [start, end] 闭区间上切刻度；每刻度落到天偏移 + 跨度（天）。 */
function buildTicks(
  start: Date,
  totalDays: number,
  unit: GanttUnit,
  monthLabel: (month: number) => string,
): Tick[] {
  const ticks: Tick[] = [];
  if (unit === "day") {
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(start, i);
      ticks.push({ offset: i, span: 1, label: String(d.getUTCDate()) });
    }
    return ticks;
  }
  if (unit === "week") {
    // 从 start 当周周一起步，逐周推进；首/尾刻度按落在范围内的部分裁剪跨度。
    let cursor = startOfISOWeek(start);
    while (daysBetween(start, cursor) < totalDays) {
      const off = daysBetween(start, cursor); // 可能为负（首周周一在 start 之前）
      const left = Math.max(off, 0);
      const right = Math.min(off + 7, totalDays);
      const span = right - left;
      if (span > 0) {
        const mondayShown = addDays(start, left);
        ticks.push({
          offset: left,
          span,
          label: `${mondayShown.getUTCMonth() + 1}/${mondayShown.getUTCDate()}`,
        });
      }
      cursor = addDays(cursor, 7);
    }
    return ticks;
  }
  // month：按自然月切，首/尾月裁剪。
  let y = start.getUTCFullYear();
  let mo = start.getUTCMonth();
  let cursor = new Date(Date.UTC(y, mo, 1));
  while (daysBetween(start, cursor) < totalDays) {
    const off = daysBetween(start, cursor);
    const next = new Date(Date.UTC(mo === 11 ? y + 1 : y, mo === 11 ? 0 : mo + 1, 1));
    const left = Math.max(off, 0);
    const right = Math.min(daysBetween(start, next), totalDays);
    const span = right - left;
    if (span > 0) ticks.push({ offset: left, span, label: monthLabel(mo + 1) });
    cursor = next;
    if (mo === 11) {
      mo = 0;
      y += 1;
    } else {
      mo += 1;
    }
  }
  return ticks;
}

/** 轴区最小宽度。
 * week/month：返回 0 → 不强制最小宽，时间轴自适应容器铺满（条形/刻度均为百分比定位，1fr 撑满
 *   即填满）→ 永不溢出、永不裁切、无需横滚。这是绝大多数甘特的诉求（看全排期，而非横拖）。
 * day：逐日刻度密集，按「天数 × 每天像素」撑开；范围长则横向溢出，由常显滚动条 + 原生横滚兜底。 */
function trackMinWidth(ticksCount: number, unit: GanttUnit): number {
  if (unit === "day") return ticksCount * 32;
  return 0;
}

function GanttImpl({
  tasks,
  rangeStart,
  rangeEnd,
  unit = "day",
  today,
  rowHeight = 36,
  className,
  ...props
}: GanttProps) {
  const locale = useComponentLocale().gantt;
  const model = useMemo(() => {
    if (tasks.length === 0) {
      return null;
    }
    // 自动范围：取 tasks min(start)/max(end)，各留 padding（day:1d / week:3d / month:5d）。
    let minStart = parseDate(tasks[0].start);
    let maxEnd = parseDate(tasks[0].end);
    for (const t of tasks) {
      const s = parseDate(t.start);
      const e = parseDate(t.end);
      if (s.getTime() < minStart.getTime()) minStart = s;
      if (e.getTime() > maxEnd.getTime()) maxEnd = e;
    }
    const pad = unit === "day" ? 1 : unit === "week" ? 3 : 5;
    const start = rangeStart ? parseDate(rangeStart) : addDays(minStart, -pad);
    const end = rangeEnd ? parseDate(rangeEnd) : addDays(maxEnd, pad);

    // 闭区间总天数（含首尾两端）→ +1。下限 1 防止退化。
    const totalDays = Math.max(daysBetween(start, end) + 1, 1);
    const ticks = buildTicks(start, totalDays, unit, locale?.month ?? ((month) => `${month}月`));

    // today 竖线位置（落在范围内才返回 0-100 的百分比）。
    let todayPct: number | null = null;
    if (today) {
      const td = parseDate(today);
      const off = daysBetween(start, td);
      // 有效日偏移为 0..totalDays-1（闭区间含首尾共 totalDays 天）；off===totalDays 时
      // todayPct=((totalDays+0.5)/totalDays)*100>100，竖线会被画到轴区右缘外（覆盖层裁切/溢出）。
      if (off >= 0 && off < totalDays) {
        // 取当日正午对应位置（off + 0.5）让竖线落在格子中线，视觉更准。
        todayPct = ((off + 0.5) / totalDays) * 100;
      }
    }

    // 行：按出现顺序保留；分组小标题在 group 变化处插入（不强制把同组聚拢，尊重传入顺序）。
    interface Row {
      kind: "group" | "task";
      key: string;
      label?: string;
      task?: GanttTask;
    }
    const rows: Row[] = [];
    let lastGroup: string | undefined | null = null;
    tasks.forEach((t, i) => {
      if (t.group != null && t.group !== lastGroup) {
        rows.push({ kind: "group", key: `g-${i}-${t.group}`, label: t.group });
        lastGroup = t.group;
      }
      if (t.group == null) lastGroup = null;
      rows.push({ kind: "task", key: t.id, task: t });
    });

    return { start, totalDays, ticks, todayPct, rows };
  }, [tasks, rangeStart, rangeEnd, unit, today, locale]);

  if (!model) {
    return (
      <div
        className={cn(
          "rounded-[var(--radius)] border border-border bg-surface p-8 text-center text-sm text-muted-foreground",
          className,
        )}
        {...props}
      >
        {locale?.empty ?? "暂无排期数据"}
      </div>
    );
  }

  const { start, totalDays, ticks, todayPct, rows } = model;
  const minWidth = trackMinWidth(ticks.length, unit);
  // 左固定列宽 + 右时间轴区（min-width 撑开 → 容器横向滚动）。
  const gridCols = "180px 1fr";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius)] border border-border bg-surface text-foreground",
        className,
      )}
      role="table"
      aria-label={locale?.chart ?? "项目排期甘特图"}
      {...props}
    >
      {/* 横向滚动：纯原生 overflow-x-auto + overscroll-x-contain（对齐库内 carousel 写法）。
          overscroll-x-contain 阻止触控板两指横滑被浏览器抢去做「前进/后退」页面手势 → 横滑真正滚动甘特图；
          纵向滚轮/手势不拦截，自然滚动页面（不再 JS 劫持 deltaY→横向，避免「上下也滚不动」）。
          常显可见滚动条：定义 ::-webkit-scrollbar 让 Chrome/macOS 退出 overlay 隐藏模式、强制常显，
          给「可横滑」明确视觉与可拖拽抓手；Firefox 走 scrollbar-width/color；轨道透明、滑块 muted 半透明悬停加深。 */}
      <div
        className={cn(
          "overflow-x-auto overscroll-x-contain",
          "[scrollbar-width:thin] [scrollbar-color:var(--color-muted-foreground)_transparent]",
          "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/50",
          "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/80",
        )}
      >
        <div style={{ minWidth: `calc(180px + ${minWidth}px)` }}>
          {/* 表头：左列占位 + 右轴刻度 */}
          <div
            className="sticky top-0 z-10 grid border-b border-border bg-surface"
            style={{ gridTemplateColumns: gridCols }}
            role="row"
          >
            <div
              className="flex items-center border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground"
              role="columnheader"
            >
              {locale?.process ?? "工序"}
            </div>
            <div className="relative" role="columnheader">
              <div className="flex h-full" style={{ minWidth }}>
                {ticks.map((tk, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-center border-r border-border/60 py-2 text-[11px] tabular-nums text-muted-foreground",
                      i === ticks.length - 1 && "border-r-0",
                    )}
                    style={{ flex: `${tk.span} 1 0`, minWidth: 0 }}
                    title={tk.label}
                  >
                    <span className="truncate px-1">{tk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 行体 */}
          <div className="relative">
            {/* today 竖线：覆盖层只占轴区（left=左列宽 180px，right=0），竖线在其内按 todayPct% 定位 */}
            {todayPct != null && (
              <div
                className="pointer-events-none absolute bottom-0 right-0 top-0 z-[5]"
                style={{ left: 180 }}
                aria-hidden="true"
              >
                <div
                  className="absolute bottom-0 top-0 w-px bg-danger"
                  style={{ left: `${todayPct}%` }}
                />
              </div>
            )}

            {rows.map((row) => {
              if (row.kind === "group") {
                return (
                  <div
                    key={row.key}
                    className="grid border-b border-border bg-subtle"
                    style={{ gridTemplateColumns: gridCols }}
                    role="row"
                  >
                    <div
                      className="col-span-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      role="cell"
                    >
                      {row.label}
                    </div>
                  </div>
                );
              }
              const t = row.task as GanttTask;
              const s = parseDate(t.start);
              const e = parseDate(t.end);
              const offset = daysBetween(start, s);
              const durDays = Math.max(daysBetween(s, e) + 1, 1); // 闭区间含首尾
              // clamp 到 [0,100]：条形绝对定位，若浮点让 left+width 越过右缘会撑出 scrollWidth → 幽灵横滚。
              const leftPct = Math.max(Math.min((offset / totalDays) * 100, 100), 0);
              const widthPct = Math.min((durDays / totalDays) * 100, 100 - leftPct);
              const progress = Math.min(Math.max(t.progress ?? 0, 0), 100);

              return (
                <div
                  key={row.key}
                  className="grid border-b border-border last:border-b-0 hover:bg-subtle"
                  style={{ gridTemplateColumns: gridCols }}
                  role="row"
                >
                  <div
                    className="flex items-center gap-2 border-r border-border px-3 text-sm"
                    style={{ height: rowHeight }}
                    role="rowheader"
                  >
                    <span className="truncate" title={t.name}>
                      {t.name}
                    </span>
                  </div>
                  <div className="relative" style={{ height: rowHeight, minWidth }} role="cell">
                    {/* 条形：底层 primary/20 全宽 + 内层 progress 深色填充。task.color 覆盖底色。 */}
                    <div
                      className="absolute top-1/2 flex -translate-y-1/2 items-center overflow-hidden rounded-[var(--radius)]"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        height: Math.max(rowHeight - 14, 12),
                        backgroundColor: t.color ?? undefined,
                      }}
                      title={`${t.name} · ${t.start} ~ ${t.end}${
                        t.progress != null ? ` · ${progress}%` : ""
                      }`}
                    >
                      {/* 底色：无 color 时走 token bg-primary/20 */}
                      {t.color == null && (
                        <span className="absolute inset-0 bg-primary/20" aria-hidden="true" />
                      )}
                      {/* 进度填充层（更深）：有 color 时叠半透明黑使其更深，否则走 bg-primary */}
                      <span
                        className={cn("absolute inset-y-0 left-0", t.color == null && "bg-primary")}
                        style={{
                          width: `${progress}%`,
                          backgroundColor: t.color != null ? "rgba(0,0,0,0.28)" : undefined,
                        }}
                        aria-hidden="true"
                      />
                      {/* 进度文字（条够宽时显示） */}
                      {progress > 0 && widthPct > 8 && (
                        <span className="relative z-[1] truncate px-2 text-[11px] font-medium tabular-nums text-primary-foreground">
                          {progress}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Gantt = memo(GanttImpl);
Gantt.displayName = "Gantt";
