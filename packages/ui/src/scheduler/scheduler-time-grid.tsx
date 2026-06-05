"use client";
import { useCallback, useRef, useState } from "react";
import { cn } from "../lib/cn";
import {
  clamp,
  dateOf,
  eventRect,
  hourLines,
  layoutColumns,
  minutesOfDay,
  minutesToISO,
  snap,
  yToMinutes,
} from "./scheduler-geometry";
import type {
  SchedulerColumn,
  SchedulerEvent,
  SchedulerSlot,
  SchedulerTone,
} from "./scheduler.types";

const TONE: Record<SchedulerTone, { block: string; accent: string }> = {
  primary: { block: "bg-primary/15 text-primary border-primary/30", accent: "bg-primary" },
  success: { block: "bg-success/15 text-success border-success/30", accent: "bg-success" },
  warning: { block: "bg-warning/15 text-warning border-warning/30", accent: "bg-warning" },
  danger: { block: "bg-danger/15 text-danger border-danger/30", accent: "bg-danger" },
  neutral: { block: "bg-surface-hover text-foreground border-border", accent: "bg-muted" },
};

const TIME_GUTTER = 56; // 左侧时间轴宽
const DRAG_THRESHOLD = 4; // px，区分点选与拖拽

interface TimeGridProps {
  columns: SchedulerColumn[];
  events: SchedulerEvent[];
  isResourceView: boolean;
  dayStartHour: number;
  dayEndHour: number;
  slotMinutes: number;
  hourHeight: number;
  nowISO?: string;
  renderEvent?: (event: SchedulerEvent) => React.ReactNode;
  onSlotDragCreate?: (slot: SchedulerSlot) => void;
  onSlotClick?: (slot: SchedulerSlot) => void;
  onEventClick?: (event: SchedulerEvent) => void;
  onEventCommit?: (event: SchedulerEvent) => void;
}

type Drag =
  | { kind: "create"; colIdx: number; anchorMin: number; curMin: number }
  | { kind: "move"; event: SchedulerEvent; durMin: number; grabMin: number; colIdx: number; curMin: number }
  | { kind: "resize"; event: SchedulerEvent; startMin: number; colIdx: number; curMin: number };

function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function TimeGrid({
  columns,
  events,
  isResourceView,
  dayStartHour,
  dayEndHour,
  slotMinutes,
  hourHeight,
  nowISO,
  renderEvent,
  onSlotDragCreate,
  onSlotClick,
  onEventClick,
  onEventCommit,
}: TimeGridProps) {
  const dayStartMin = dayStartHour * 60;
  const dayEndMin = dayEndHour * 60;
  const pxPerMin = hourHeight / 60;
  const bodyHeight = (dayEndMin - dayStartMin) * pxPerMin;
  const cols = columns.length;

  const gridRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  // pending：拖拽意图的权威数据（pointerdown 即写，move 更新，commit 读）。
  // activeDrag：仅用于「渲染幽灵块 + 本体变暗」的可见态——只有真正移动超阈值才置位，
  // 故纯点选（0 位移）不会闪现幽灵/不会让事件块瞬间变全列宽。
  const pending = useRef<Drag | null>(null);
  const [activeDrag, setActiveDrag] = useState<Drag | null>(null);

  // latest ref：window 监听里读最新值，避过期闭包（照 Flow 范式）。
  // 回调 props 也并入，让 commit 空依赖即稳定，up 闭包永远调到最新回调。
  const latest = useRef({
    columns,
    slotMinutes,
    dayStartMin,
    dayEndMin,
    pxPerMin,
    isResourceView,
    onSlotDragCreate,
    onSlotClick,
    onEventClick,
    onEventCommit,
  });
  latest.current = {
    columns,
    slotMinutes,
    dayStartMin,
    dayEndMin,
    pxPerMin,
    isResourceView,
    onSlotDragCreate,
    onSlotClick,
    onEventClick,
    onEventCommit,
  };

  // 从指针位置解出 {列号, 吸附分钟}
  const resolve = useCallback((clientX: number, clientY: number) => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const { columns: cs, slotMinutes: step, dayStartMin: ds, dayEndMin: de, pxPerMin: ppm } =
      latest.current;
    const colW = rect.width / Math.max(cs.length, 1);
    const colIdx = clamp(Math.floor((clientX - rect.left) / colW), 0, cs.length - 1);
    const min = snap(yToMinutes(clientY - rect.top, ds, de, ppm), step);
    return { colIdx, min };
  }, []);

  const handlers = useRef<{ move: (e: PointerEvent) => void; up: (e: PointerEvent) => void } | null>(null);

  const beginDrag = useCallback(
    (e: React.PointerEvent, init: Drag, startX: number, startY: number) => {
      e.preventDefault();
      moved.current = false;
      pending.current = init;

      const move = (ev: PointerEvent) => {
        if (Math.abs(ev.clientX - startX) > DRAG_THRESHOLD || Math.abs(ev.clientY - startY) > DRAG_THRESHOLD) {
          moved.current = true;
        }
        const r = resolve(ev.clientX, ev.clientY);
        if (!r) return;
        const d = pending.current;
        if (!d) return;
        let nd: Drag;
        if (d.kind === "create") {
          nd = { ...d, curMin: r.min };
        } else if (d.kind === "move") {
          nd = { ...d, colIdx: r.colIdx, curMin: r.min };
        } else {
          nd = { ...d, curMin: Math.max(r.min, d.startMin + latest.current.slotMinutes) };
        }
        pending.current = nd;
        // 仅在真正移动后才渲染可见拖拽态（幽灵块 + 本体变暗）；点选不闪
        if (moved.current) setActiveDrag(nd);
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        commit();
      };
      handlers.current = { move, up };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [resolve],
  );

  const commit = useCallback(() => {
    const {
      columns: cs,
      slotMinutes: step,
      dayStartMin: ds,
      dayEndMin: de,
      isResourceView: isRes,
      onSlotClick: onSC,
      onSlotDragCreate: onSDC,
      onEventClick: onEC,
      onEventCommit: onECommit,
    } = latest.current;
    const d = pending.current;
    pending.current = null;
    setActiveDrag(null);
    handlers.current = null;
    if (!d) return;

    if (d.kind === "create") {
      const col = cs[d.colIdx];
      if (!col) return;
      const a = Math.min(d.anchorMin, d.curMin);
      const b = Math.max(d.anchorMin, d.curMin);
      if (!moved.current || b - a < step) {
        // 点选：默认一个 slot 时长
        onSC?.({
          start: minutesToISO(col.dateISO, d.anchorMin),
          end: minutesToISO(col.dateISO, d.anchorMin + step),
          resourceId: col.resourceId,
        });
      } else {
        onSDC?.({
          start: minutesToISO(col.dateISO, a),
          end: minutesToISO(col.dateISO, b),
          resourceId: col.resourceId,
        });
      }
      return;
    }

    if (d.kind === "move") {
      if (!moved.current) {
        onEC?.(d.event);
        return;
      }
      const col = cs[d.colIdx];
      if (!col) return;
      const newStart = clamp(d.curMin - d.grabMin, ds, de - d.durMin);
      onECommit?.({
        ...d.event,
        start: minutesToISO(col.dateISO, newStart),
        end: minutesToISO(col.dateISO, newStart + d.durMin),
        resourceId: isRes ? col.resourceId : d.event.resourceId,
      });
      return;
    }

    if (d.kind === "resize") {
      if (!moved.current) {
        onEC?.(d.event);
        return;
      }
      const col = cs[d.colIdx];
      if (!col) return;
      onECommit?.({
        ...d.event,
        end: minutesToISO(col.dateISO, d.curMin),
      });
    }
  }, []);

  // 空白格按下 → 建
  const onColumnDown = useCallback(
    (e: React.PointerEvent, colIdx: number) => {
      if (e.button !== 0) return;
      const r = resolve(e.clientX, e.clientY);
      if (!r) return;
      beginDrag(e, { kind: "create", colIdx, anchorMin: r.min, curMin: r.min }, e.clientX, e.clientY);
    },
    [beginDrag, resolve],
  );

  // 事件体按下 → 移
  const onEventDown = useCallback(
    (e: React.PointerEvent, event: SchedulerEvent, colIdx: number) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      const r = resolve(e.clientX, e.clientY);
      if (!r) return;
      const s = minutesOfDay(event.start);
      const en = minutesOfDay(event.end);
      beginDrag(
        e,
        { kind: "move", event, durMin: en - s, grabMin: r.min - s, colIdx, curMin: r.min },
        e.clientX,
        e.clientY,
      );
    },
    [beginDrag, resolve],
  );

  // 下缘手柄按下 → 改时长
  const onResizeDown = useCallback(
    (e: React.PointerEvent, event: SchedulerEvent, colIdx: number) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      const r = resolve(e.clientX, e.clientY);
      if (!r) return;
      const s = minutesOfDay(event.start);
      beginDrag(
        e,
        { kind: "resize", event, startMin: s, colIdx, curMin: Math.max(r.min, s + slotMinutes) },
        e.clientX,
        e.clientY,
      );
    },
    [beginDrag, resolve, slotMinutes],
  );

  const hours = hourLines(dayStartHour, dayEndHour);

  // 当前时间红线
  const nowMin = nowISO ? minutesOfDay(nowISO) : null;
  const nowDate = nowISO ? dateOf(nowISO) : null;
  const showNowFor = (col: SchedulerColumn) =>
    nowMin != null && nowDate === col.dateISO && nowMin >= dayStartMin && nowMin <= dayEndMin;

  // 拖拽中的事件：用 ghost 显示新位置，本体半透明
  const draggingId =
    activeDrag && (activeDrag.kind === "move" || activeDrag.kind === "resize") ? activeDrag.event.id : null;

  return (
    <div className="flex flex-col overflow-hidden">
      {/* 列头 */}
      <div className="flex border-b border-border bg-surface" style={{ paddingLeft: TIME_GUTTER }}>
        {columns.map((c) => (
          <div
            key={c.key}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 border-l border-border px-1 py-2",
              c.isToday && "bg-primary/5",
            )}
          >
            <span className={cn("truncate text-xs font-medium", c.isToday ? "text-primary" : "text-foreground")}>
              {c.label}
            </span>
            {c.sublabel && (
              <span className={cn("truncate text-[11px] tabular-nums", c.isToday ? "text-primary" : "text-muted")}>
                {c.sublabel}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 时间轴体（可纵向滚） */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="flex" style={{ height: bodyHeight }}>
          {/* 左时间刻度 */}
          <div className="relative shrink-0" style={{ width: TIME_GUTTER }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-1 -translate-y-1/2 text-[11px] tabular-nums text-muted"
                style={{ top: (h * 60 - dayStartMin) * pxPerMin }}
              >
                {h === dayStartHour ? "" : `${String(h).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>

          {/* 列区 */}
          <div ref={gridRef} className="relative flex flex-1">
            {/* 整点横线 */}
            {hours.map((h) => (
              <div
                key={h}
                className="pointer-events-none absolute inset-x-0 border-t border-border/60"
                style={{ top: (h * 60 - dayStartMin) * pxPerMin }}
                aria-hidden="true"
              />
            ))}

            {columns.map((col, colIdx) => {
              const colEvents = events.filter(
                (e) =>
                  dateOf(e.start) === col.dateISO &&
                  (!isResourceView || e.resourceId === col.resourceId),
              );
              const layout = layoutColumns(colEvents);
              return (
                <div
                  key={col.key}
                  className={cn(
                    "relative min-w-0 flex-1 border-l border-border",
                    col.isToday && "bg-primary/[0.03]",
                  )}
                  onPointerDown={(e) => onColumnDown(e, colIdx)}
                >
                  {/* 当前时间红线 */}
                  {showNowFor(col) && nowMin != null && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-20 h-px bg-danger"
                      style={{ top: (nowMin - dayStartMin) * pxPerMin }}
                      aria-hidden="true"
                    >
                      <span className="absolute left-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-danger" />
                    </div>
                  )}

                  {colEvents.map((ev) => {
                    const s = minutesOfDay(ev.start);
                    const en = minutesOfDay(ev.end);
                    const rect = eventRect(s, en, dayStartMin, pxPerMin);
                    const lay = layout.get(ev.id) ?? { col: 0, cols: 1 };
                    const widthPct = 100 / lay.cols;
                    const tone = TONE[ev.tone ?? "primary"];
                    const tall = rect.height >= 44;
                    return (
                      <div
                        key={ev.id}
                        className={cn(
                          "absolute overflow-hidden rounded-[var(--radius)] border-l-2 px-1.5 py-1 text-left shadow-sm",
                          tone.block,
                          draggingId === ev.id && "opacity-40",
                        )}
                        style={{
                          top: rect.top,
                          height: rect.height,
                          left: `calc(${lay.col * widthPct}% + 1px)`,
                          width: `calc(${widthPct}% - 2px)`,
                        }}
                        onPointerDown={(e) => onEventDown(e, ev, colIdx)}
                        role="button"
                        tabIndex={0}
                        title={`${ev.title} · ${fmtMinutes(s)}–${fmtMinutes(en)}`}
                      >
                        {renderEvent ? (
                          renderEvent(ev)
                        ) : (
                          <>
                            <div className="truncate text-[11px] font-medium leading-tight">{ev.title}</div>
                            {tall && (
                              <div className="truncate text-[10px] tabular-nums opacity-75">
                                {fmtMinutes(s)}–{fmtMinutes(en)}
                                {ev.subtitle ? ` · ${ev.subtitle}` : ""}
                              </div>
                            )}
                          </>
                        )}
                        {/* 下缘改时长手柄 */}
                        <div
                          className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize"
                          onPointerDown={(e) => onResizeDown(e, ev, colIdx)}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* 拖拽幽灵层 */}
            <DragGhost drag={activeDrag} columns={columns} cols={cols} dayStartMin={dayStartMin} pxPerMin={pxPerMin} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DragGhost({
  drag,
  columns,
  cols,
  dayStartMin,
  pxPerMin,
}: {
  drag: Drag | null;
  columns: SchedulerColumn[];
  cols: number;
  dayStartMin: number;
  pxPerMin: number;
}) {
  if (!drag) return null;
  let colIdx: number;
  let a: number;
  let b: number;
  let label: string;
  if (drag.kind === "create") {
    colIdx = drag.colIdx;
    a = Math.min(drag.anchorMin, drag.curMin);
    b = Math.max(drag.anchorMin, drag.curMin);
    label = `${fmtMinutes(a)}–${fmtMinutes(b)}`;
  } else if (drag.kind === "move") {
    colIdx = drag.colIdx;
    const s = minutesOfDay(drag.event.start);
    const en = minutesOfDay(drag.event.end);
    const dur = en - s;
    a = clamp(drag.curMin - drag.grabMin, dayStartMin, Infinity);
    b = a + dur;
    label = `${drag.event.title} · ${fmtMinutes(a)}`;
  } else {
    colIdx = drag.colIdx;
    a = drag.startMin;
    b = drag.curMin;
    label = `${drag.event.title} · ${fmtMinutes(a)}–${fmtMinutes(b)}`;
  }
  const colW = 100 / Math.max(cols, 1);
  const col = columns[colIdx];
  if (!col) return null;
  return (
    <div
      className="pointer-events-none absolute z-30 overflow-hidden rounded-[var(--radius)] border border-primary bg-primary/25 px-1.5 py-1 text-[11px] font-medium text-primary shadow-md"
      style={{
        top: (a - dayStartMin) * pxPerMin,
        height: Math.max((b - a) * pxPerMin, 1),
        left: `calc(${colIdx * colW}% + 1px)`,
        width: `calc(${colW}% - 2px)`,
      }}
    >
      {label}
    </div>
  );
}
