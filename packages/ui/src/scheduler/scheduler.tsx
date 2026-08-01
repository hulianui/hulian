"use client";
import { memo, useCallback } from "react";
import { Button } from "../button";
import { ChevronLeft, ChevronRight } from "../_icons";
import { Segmented } from "../segmented";
import { dayjs } from "../lib/date";
import { cn } from "../lib/cn";
import { MonthView } from "./scheduler-month";
import { TimeGrid } from "./scheduler-time-grid";
import { dayColumns, resourceColumns, startOfWeekISO, weekColumns } from "./scheduler-geometry";
import type { SchedulerEvent, SchedulerProps, SchedulerView } from "./scheduler.types";

const VIEW_ITEMS = [
  { value: "month", label: "月" },
  { value: "week", label: "周" },
  { value: "day", label: "日" },
  { value: "resource", label: "资源" },
];

function titleFor(view: SchedulerView, date: string): string {
  const d = dayjs(date);
  if (view === "month") return d.format("YYYY 年 M 月");
  if (view === "week") {
    const monday = dayjs(startOfWeekISO(date));
    const sunday = monday.add(6, "day");
    return `${monday.format("M/D")} – ${sunday.format("M/D")}`;
  }
  return d.format("YYYY 年 M 月 D 日");
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
  resources = [],
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
      ? weekColumns(date, todayISO)
      : view === "day"
        ? dayColumns(date, todayISO)
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
              size="icon"
              aria-label="上一个"
              title="上一个"
              onClick={() => onDateChange?.(step(view, date, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDateChange?.(todayISO)}>
              今天
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="下一个"
              title="下一个"
              onClick={() => onDateChange?.(step(view, date, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
            <span className="ml-1 text-sm font-medium tabular-nums">{titleFor(view, date)}</span>
          </div>
          <Segmented
            items={VIEW_ITEMS}
            value={view}
            onValueChange={(v) => onViewChange?.(v as SchedulerView)}
            size="sm"
            aria-label="视图切换"
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
