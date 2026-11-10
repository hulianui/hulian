"use client";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { ORG_CLASSROOM_COPY_ZH } from "./copy";
import { Floor } from "./floor";
import { PersonCard } from "./person-card";
import type { OrgClassroomProps, ViewAngle } from "./org-classroom.types";
import { ViewControls } from "./view-controls";

function OrgClassroomImpl({
  zones,
  selectedSeatId,
  onSeatSelect,
  onStatusChange,
  focusedZoneId,
  onZoneFocus,
  view: viewProp,
  onViewChange,
  northDeg = 0,
  className,
}: OrgClassroomProps) {
  const copy = useComponentLocale().orgClassroom ?? ORG_CLASSROOM_COPY_ZH;
  const selectionControlled = selectedSeatId !== undefined;
  const focusControlled = focusedZoneId !== undefined;
  const [uncontrolledSelected, setUncontrolledSelected] = useState<string | null>(null);
  const [uncontrolledFocus, setUncontrolledFocus] = useState<string | null>(null);
  const selectedId = selectionControlled ? selectedSeatId ?? null : uncontrolledSelected;
  const focusedId = focusControlled ? focusedZoneId ?? null : uncontrolledFocus;
  const [uncontrolledView, setUncontrolledView] = useState<ViewAngle>(0);
  const view = viewProp ?? uncontrolledView;
  const changeView = useCallback(
    (next: ViewAngle) => {
      if (viewProp === undefined) setUncontrolledView(next);
      onViewChange?.(next);
    },
    [onViewChange, viewProp],
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const restoreSeatId = useRef<string | null>(null);

  const selectSeat = useCallback(
    (seatId: string) => {
      restoreSeatId.current = null;
      if (!selectionControlled) setUncontrolledSelected(seatId);
      onSeatSelect?.(seatId);
    },
    [onSeatSelect, selectionControlled],
  );

  const requestClose = useCallback(() => {
    if (!selectedId) return;
    restoreSeatId.current = selectedId;
    if (!selectionControlled) setUncontrolledSelected(null);
    onSeatSelect?.(null);
  }, [onSeatSelect, selectedId, selectionControlled]);

  useLayoutEffect(() => {
    if (selectedId != null) return;
    const seatId = restoreSeatId.current;
    const root = rootRef.current;
    if (!seatId || !root) return;
    restoreSeatId.current = null;
    const escaped = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(seatId) : seatId;
    root.querySelector<HTMLButtonElement>(`[data-seat-id="${escaped}"] button`)?.focus();
  }, [selectedId]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape" || !selectedId || event.defaultPrevented) return;
      event.preventDefault();
      requestClose();
    },
    [requestClose, selectedId],
  );

  const toggleZone = useCallback(
    (zoneId: string) => {
      const next = focusedId === zoneId ? null : zoneId;
      if (!focusControlled) setUncontrolledFocus(next);
      onZoneFocus?.(next);
    },
    [focusControlled, focusedId, onZoneFocus],
  );

  const selected = useMemo(() => {
    if (!selectedId) return null;
    for (const zone of zones) {
      const seat = zone.seats.find((item) => item.id === selectedId);
      if (seat) return { zone, seat };
    }
    return null;
  }, [selectedId, zones]);

  return (
    // container-type 让元素不再由内容撑宽：在 flex / 收缩包裹的父级里必须自己占满宽度，否则会塌成 0
    <div
      ref={rootRef}
      data-slot="org-classroom"
      className={cn("@container w-full min-w-0", className)}
      onKeyDown={onKeyDown}
    >
      {/* 按组件自己的宽度换排布，而不是视口：宽页面里的窄栏也能拿到手机排布。 */}
      <div className="flex flex-col-reverse gap-4 @3xl:flex-row @3xl:items-start">
        <div className="flex min-w-0 w-full flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ul data-slot="org-classroom-zones" className="flex flex-wrap gap-2">
              {zones.map((zone) => (
                <li
                  key={zone.id}
                  data-zone-label={zone.id}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface/95 px-2 py-0.5 text-xs font-medium text-foreground shadow-sm ring-1 ring-border"
                  style={{ "--zone-accent": zone.accent } as CSSProperties}
                >
                  <span aria-hidden className="size-2 rounded-full bg-[var(--zone-accent)]" />
                  {zone.name}
                </li>
              ))}
            </ul>
            <ViewControls copy={copy} view={view} northDeg={northDeg} onViewChange={changeView} />
          </div>
          <Floor
            zones={zones}
            copy={copy}
            focusedZoneId={focusedId}
            selectedSeatId={selectedId}
            onSeatSelect={selectSeat}
            onZoneToggle={toggleZone}
            view={view}
          />
        </div>
        <PersonCard
          copy={copy}
          zone={selected?.zone ?? null}
          seatId={selected?.seat.id ?? null}
          person={selected?.seat.person ?? null}
          onStatusChange={onStatusChange}
          onClose={selectedId ? requestClose : undefined}
        />
      </div>
    </div>
  );
}

export const OrgClassroom = memo(OrgClassroomImpl);
OrgClassroom.displayName = "OrgClassroom";
