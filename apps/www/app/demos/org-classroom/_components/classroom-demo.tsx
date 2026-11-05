"use client";
import { useCallback, useState } from "react";
import { OrgClassroom, updateSeatStatus, type Seat, type SeatStatus, type Zone } from "@hulianui/ui";
import { copy } from "./classroom-demo.content";

function occupied(id: string, name: string, status: SeatStatus, row: number, col: number): Seat {
  return { id, row, col, person: { id, name, status } };
}

function buildZone(): Zone {
  return {
    id: "design",
    name: copy("department"),
    accent: "var(--color-primary)",
    seats: [
      occupied("s1", copy("lin"), "idle", 1, 1),
      occupied("s2", copy("chen"), "busy", 1, 2),
      occupied("s3", copy("zhou"), "meeting", 1, 3),
      occupied("s4", copy("zhao"), "leave", 2, 1),
      occupied("s5", copy("sun"), "interview", 2, 2),
      occupied("s6", copy("wu"), "idle", 2, 3),
      { id: "s7", row: 3, col: 1 },
      occupied("s8", copy("zheng"), "busy", 3, 2),
      occupied("s9", copy("he"), "meeting", 3, 3),
      occupied("s10", copy("xu"), "leave", 4, 1),
      { id: "s11", row: 4, col: 2 },
      occupied("s12", copy("shen"), "interview", 4, 3),
    ],
  };
}

export function ClassroomDemo() {
  const [zones, setZones] = useState<Zone[]>(() => [buildZone()]);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);
  const onSeatSelect = useCallback((seatId: string | null) => {
    setSelectedSeatId(seatId);
  }, []);
  const onZoneFocus = useCallback((zoneId: string | null) => {
    setFocusedZoneId(zoneId);
  }, []);
  const onStatusChange = useCallback((seatId: string, status: SeatStatus) => {
    setZones((current) => updateSeatStatus(current, seatId, status));
  }, []);

  return (
    <OrgClassroom
      zones={zones}
      selectedSeatId={selectedSeatId}
      onSeatSelect={onSeatSelect}
      focusedZoneId={focusedZoneId}
      onZoneFocus={onZoneFocus}
      onStatusChange={onStatusChange}
    />
  );
}
