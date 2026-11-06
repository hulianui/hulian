"use client";
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { ORG_CLASSROOM_COPY_ZH, type OrgClassroomCopy } from "./copy";
import { Floor, type FloorAnnotation } from "./floor";
import { PersonCard } from "./person-card";
import type { OrgClassroomProps, Zone } from "./org-classroom.types";
import { StatusChip } from "./status-chip";
import { ZoneTile } from "./zone-tile";

function layoutKeyFor(zones: Zone[]) {
  return zones
    .map(
      (zone) =>
        `${zone.id}:${zone.name}:${zone.seats
          .map((seat) => `${seat.id}.${seat.row}.${seat.col}.${seat.person?.name ?? ""}.${seat.person?.status ?? ""}`)
          .join(",")}`,
    )
    .join("|");
}

function annotationsFor(zones: Zone[], copy: OrgClassroomCopy): FloorAnnotation[] {
  const annotations: FloorAnnotation[] = [];
  for (const zone of zones) {
    annotations.push({
      id: `zone-${zone.id}`,
      anchor: zone.id,
      node: (
        <span className="whitespace-nowrap rounded-full bg-surface/95 px-2 py-0.5 text-xs font-medium text-foreground shadow-sm ring-1 ring-border">
          {zone.name}
        </span>
      ),
    });
    for (const seat of zone.seats) {
      if (!seat.person) continue;
      annotations.push({
        id: seat.id,
        anchor: seat.id,
        node: (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface/95 py-0.5 pl-0.5 pr-2 shadow-sm ring-1 ring-border">
            <StatusChip status={seat.person.status} labels={copy.statuses} />
            <span className="whitespace-nowrap text-xs font-medium leading-none text-foreground">{seat.person.name}</span>
          </span>
        ),
      });
    }
  }
  return annotations;
}

function OrgClassroomImpl({
  zones,
  selectedSeatId,
  onSeatSelect,
  onStatusChange,
  focusedZoneId,
  onZoneFocus,
  className,
}: OrgClassroomProps) {
  const copy = useComponentLocale().orgClassroom ?? ORG_CLASSROOM_COPY_ZH;
  const selectionControlled = selectedSeatId !== undefined;
  const focusControlled = focusedZoneId !== undefined;
  const [uncontrolledSelected, setUncontrolledSelected] = useState<string | null>(null);
  const [uncontrolledFocus, setUncontrolledFocus] = useState<string | null>(null);
  const selectedId = selectionControlled ? (selectedSeatId ?? null) : uncontrolledSelected;
  const focusedId = focusControlled ? (focusedZoneId ?? null) : uncontrolledFocus;
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
    <div
      ref={rootRef}
      data-slot="org-classroom"
      className={cn("flex flex-col gap-4 lg:flex-row lg:items-start", className)}
      onKeyDown={onKeyDown}
    >
      <div className="min-w-0 flex-1">
        <Floor label={copy.floor} layoutKey={layoutKeyFor(zones)} annotations={annotationsFor(zones, copy)}>
          {zones.map((zone) => (
            <ZoneTile
              key={zone.id}
              zone={zone}
              copy={copy}
              focused={focusedId === zone.id}
              quiet={focusedId != null && focusedId !== zone.id}
              selectedSeatId={selectedId}
              onSeatSelect={selectSeat}
              onZoneToggle={toggleZone}
            />
          ))}
        </Floor>
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
  );
}

export const OrgClassroom = memo(OrgClassroomImpl);
OrgClassroom.displayName = "OrgClassroom";
