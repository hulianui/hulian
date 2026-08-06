"use client";
import { memo, useCallback } from "react";
import { Button } from "../button";
import { ChevronLeft, ChevronRight } from "../_icons";
import { Segmented } from "../segmented";
import { dayjs } from "../lib/date";
import { cn } from "../lib/cn";
import { type ComponentLocale } from "../config/locale";
import { useComponentLocale } from "../config/locale-context";
import { MonthView } from "./scheduler-month";
import { TimeGrid } from "./scheduler-time-grid";
import { dayColumns, resourceColumns, startOfWeekISO, weekColumns } from "./scheduler-geometry";
import type { SchedulerEvent, SchedulerProps, SchedulerView } from "./scheduler.types";

type SchedulerLabels = NonNullable<ComponentLocale["scheduler"]>;

const DEFAULT_LABELS: SchedulerLabels = {
  views: { month: "月", week: "周", day: "日", resource: "资源" },
  previous: "上一个",
  next: "下一个",
  today: "今天",
  viewSwitcher: "视图切换",
  weekdays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  monthTitle: (year: number, month: number) => `${year} 年 ${month} 月`,
  weekDate: (month: number, day: number) => `${month}/${day}`,
  dayTitle: (year: number, month: number, day: number) => `${year} 年 ${month} 月 ${day} 日`,
  dayColumn: (month: number, day: number) => `${month}月${day}日`,
  more: (count: number) => `+${count} 更多`,
};

function titleFor(view: SchedulerView, date: string, labels: SchedulerLabels): string {
  const d = dayjs(date);
  if (view === "month") return labels.monthTitle(d.year(), d.month() + 1);
  if (view === "week") {
    const monday = dayjs(startOfWeekISO(date));
    const sunday = monday.add(6, "day");
    return `${labels.weekDate(monday.month() + 1, monday.date())} – ${labels.weekDate(
      sunday.month() + 1,
      sunday.date(),
    )}`;
  }
  return labels.dayTitle(d.year(), d.month() + 1, d.date());
}

/** 焦点日按视图步进。 */
function step(view: SchedulerView, date: string, dir: 1 | -1): string {
  const d = dayjs(date);
  if (view === "month") return d.add(dir, "month").format("YYYY-MM-DD");
  if (view === "week") return d.add(dir * 7, "day").format("YYYY-MM-DD");
  return d.add(dir, "day").format("YYYY-MM-DD");
}

function SchedulerImpl({
  events,
  view,
  date,
  resources: resourcesProp,
  onViewChange,
  onDateChange,
  onEventsChange,
  onSlotDragCreate,
  onSlotClick,
  onEventClick,
  dayStartHour = 8,
  dayEndHour = 20,
  slotMinutes = 30,
  hourHeight = 56,
  toolbar = true,
  renderEvent,
  className,
}: SchedulerProps) {
  const resources = resourcesProp ?? [];
  const labels = useComponentLocale().scheduler ?? DEFAULT_LABELS;
  const viewItems = (Object.keys(labels.views) as SchedulerView[]).map((value) => ({
    value,
    label: labels.views[value],
  }));
  const todayISO = dayjs().format("YYYY-MM-DD");
  const nowISO = dayjs().format("YYYY-MM-DDTHH:mm:ss");

  // 单事件改动 → 回吐整组（照 Kanban 受控范式）
  const onEventCommit = useCallback(
    (updated: SchedulerEvent) => {
      onEventsChange?.(events.map((e) => (e.id === updated.id ? updated : e)));
    },
    [events, onEventsChange],
  );

  const columns =
    view === "week"
      ? weekColumns(date, todayISO, labels)
      : view === "day"
      ? dayColumns(date, todayISO, labels)
      : view === "resource"
      ? resourceColumns(date, resources)
      : [];

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface text-foreground",
        className,
      )}
    >
      {toolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="iconSm"
              aria-label={labels.previous}
              title={labels.previous}
              onClick={() => onDateChange?.(step(view, date, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDateChange?.(todayISO)}>
              {labels.today}
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              aria-label={labels.next}
              title={labels.next}
              onClick={() => onDateChange?.(step(view, date, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
            <span className="ml-1 text-sm font-medium tabular-nums">
              {titleFor(view, date, labels)}
            </span>
          </div>
          <Segmented
            items={viewItems}
            value={view}
            onValueChange={(v) => onViewChange?.(v as SchedulerView)}
            size="sm"
            aria-label={labels.viewSwitcher}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {view === "month" ? (
          <MonthView
            date={date}
            events={events}
            nowISO={nowISO}
            dayStartHour={dayStartHour}
            slotMinutes={slotMinutes}
            onSlotClick={onSlotClick}
            onEventClick={onEventClick}
            onDayPick={(iso) => {
              onDateChange?.(iso);
              onViewChange?.("day");
            }}
            weekdays={labels.weekdays}
            moreLabel={labels.more}
          />
        ) : (
          <TimeGrid
            columns={columns}
            events={events}
            isResourceView={view === "resource"}
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
            slotMinutes={slotMinutes}
            hourHeight={hourHeight}
            nowISO={nowISO}
            renderEvent={renderEvent}
            onSlotDragCreate={onSlotDragCreate}
            onSlotClick={onSlotClick}
            onEventClick={onEventClick}
            onEventCommit={onEventCommit}
          />
        )}
      </div>
    </div>
  );
}

export const Scheduler = memo(SchedulerImpl);
Scheduler.displayName = "Scheduler";
