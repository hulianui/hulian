"use client";
import { memo, useCallback, useMemo, useState } from "react";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { ORG_CLASSROOM_COPY_ZH } from "./copy";
import { Floor } from "./floor";
import { PersonCard } from "./person-card";
import type { OrgClassroomProps } from "./org-classroom.types";
import { ZoneTile } from "./zone-tile";

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

  const selectSeat = useCallback(
    (seatId: string) => {
      if (!selectionControlled) setUncontrolledSelected(seatId);
      onSeatSelect?.(seatId);
    },
    [onSeatSelect, selectionControlled],
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
    <div data-slot="org-classroom" className={cn("flex flex-col gap-4 lg:flex-row lg:items-start", className)}>
      <div className="min-w-0 flex-1">
        <Floor label={copy.floor}>
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
      />
    </div>
  );
}

export const OrgClassroom = memo(OrgClassroomImpl);
OrgClassroom.displayName = "OrgClassroom";
