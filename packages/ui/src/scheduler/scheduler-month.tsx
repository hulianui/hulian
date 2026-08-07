"use client";
import { dayjs } from "../lib/date";
import { cn } from "../lib/cn";
import { dateOf, minutesOfDay, minutesToISO, monthMatrix } from "./scheduler-geometry";
import type { SchedulerEvent, SchedulerSlot, SchedulerTone } from "./scheduler.types";

const CHIP_TONE: Record<SchedulerTone, string> = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  neutral: "bg-surface-hover text-foreground",
};

const MAX_CHIPS = 3;

interface MonthViewProps {
  date: string;
  events: SchedulerEvent[];
  nowISO?: string;
  dayStartHour: number;
  slotMinutes: number;
  onSlotClick?: (slot: SchedulerSlot) => void;
  onEventClick?: (event: SchedulerEvent) => void;
  onDayPick?: (iso: string) => void;
  weekdays: readonly string[];
  moreLabel: (count: number) => string;
}

export function MonthView({
  date,
  events,
  nowISO,
  dayStartHour,
  slotMinutes,
  onSlotClick,
  onEventClick,
  onDayPick,
  weekdays,
  moreLabel,
}: MonthViewProps) {
  const weeks = monthMatrix(date);
  const focalMonth = dayjs(date).month();
  const todayISO = nowISO ? dateOf(nowISO) : null;

  // 按日期分桶并按起始时间排序
  const byDay = new Map<string, SchedulerEvent[]>();
  for (const e of events) {
    const k = dateOf(e.start);
    (byDay.get(k) ?? byDay.set(k, []).get(k)!).push(e);
  }
  for (const list of byDay.values()) list.sort((a, b) => minutesOfDay(a.start) - minutesOfDay(b.start));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 星期表头 */}
      <div className="grid grid-cols-7 border-b border-border bg-surface">
        {weekdays.map((w) => (
          <div key={w} className="px-2 py-2 text-center text-xs font-medium text-muted">
            {w}
          </div>
        ))}
      </div>
      {/* 6 周 */}
      <div className="grid flex-1 grid-rows-6">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((dISO) => {
              const d = dayjs(dISO);
              const inMonth = d.month() === focalMonth;
              const isToday = dISO === todayISO;
              const list = byDay.get(dISO) ?? [];
              const shown = list.slice(0, MAX_CHIPS);
              const more = list.length - shown.length;
              return (
                <div
                  key={dISO}
                  className={cn(
                    "group flex min-h-0 flex-col gap-0.5 border-b border-l border-border p-1 text-left",
                    !inMonth && "bg-subtle/60",
                  )}
                  onClick={() =>
                    onSlotClick?.({
                      start: minutesToISO(dISO, dayStartHour * 60),
                      end: minutesToISO(dISO, dayStartHour * 60 + slotMinutes),
                    })
                  }
                >
                  <button
                    type="button"
                    className={cn(
                      "mb-0.5 inline-flex size-6 shrink-0 items-center justify-center self-start rounded-full text-xs tabular-nums transition-colors",
                      isToday && "bg-primary font-medium text-primary-foreground",
                      !isToday && inMonth && "text-foreground hover:bg-surface-hover",
                      !isToday && !inMonth && "text-muted",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayPick?.(dISO);
                    }}
                  >
                    {d.date()}
                  </button>
                  <div className="flex min-h-0 flex-col gap-0.5 overflow-hidden">
                    {shown.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-left text-[11px] leading-tight",
                          CHIP_TONE[ev.tone ?? "primary"],
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(ev);
                        }}
                        title={ev.title}
                      >
                        <span className="tabular-nums opacity-70">
                          {String(Math.floor(minutesOfDay(ev.start) / 60)).padStart(2, "0")}:
                          {String(minutesOfDay(ev.start) % 60).padStart(2, "0")}
                        </span>{" "}
                        {ev.title}
                      </button>
                    ))}
                    {more > 0 && (
                      <span className="px-1 text-[11px] text-muted">{moreLabel(more)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
