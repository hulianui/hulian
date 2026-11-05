import { memo } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "./avatar";
import type { OrgClassroomCopy } from "./copy";
import { ISO_BILLBOARD_CENTER_CLASS, ISO_BILLBOARD_CLASS, SEAT_LIFT_CLASS } from "./iso";
import type { Seat } from "./org-classroom.types";
import { StatusChip } from "./status-chip";

function DeskSurface() {
  return (
    <svg viewBox="0 0 96 64" className="h-14 w-[5.25rem]" aria-hidden>
      <ellipse cx="48" cy="56" rx="30" ry="5.5" fill="var(--color-foreground)" opacity="0.12" />
      <rect x="18" y="34" width="60" height="12" rx="6" fill="var(--color-muted)" />
      <rect
        x="12"
        y="14"
        width="72"
        height="28"
        rx="10"
        fill="var(--color-surface)"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      <rect x="22" y="20" width="52" height="5" rx="2.5" fill="var(--color-foreground)" opacity="0.05" />
    </svg>
  );
}

function DeskImpl({
  seat,
  copy,
  selected,
  onSelect,
}: {
  seat: Seat;
  copy: OrgClassroomCopy;
  selected: boolean;
  onSelect: (seatId: string) => void;
}) {
  const person = seat.person;
  const label = person
    ? copy.seatLabel(person.name, copy.statuses[person.status])
    : copy.emptySeatLabel(seat.row, seat.col);

  return (
    <div
      className="pointer-events-auto relative"
      style={{ gridColumn: Math.max(seat.col, 1), gridRow: Math.max(seat.row, 1) }}
      data-seat-id={seat.id}
    >
      <button
        type="button"
        className="group relative flex h-[7.25rem] w-[5.75rem] cursor-pointer items-end justify-center border-0 bg-transparent p-0 [transform-style:preserve-3d]"
        data-selected={selected ? "true" : "false"}
        aria-pressed={selected}
        aria-label={label}
        onClick={() => onSelect(seat.id)}
      >
        <span
          data-seat-lift
          className={cn(
            SEAT_LIFT_CLASS,
            "flex flex-col items-center rounded-[1.25rem]",
            "group-hover:outline group-hover:outline-2 group-hover:outline-primary/50",
            "group-data-[selected=true]:outline group-data-[selected=true]:outline-2 group-data-[selected=true]:outline-primary",
          )}
        >
          {person ? (
            <span className={cn(ISO_BILLBOARD_CLASS, "mb-[-1.35rem] flex flex-col items-center")}>
              <Avatar />
              <span className="mt-0.5 max-w-[4.75rem] truncate rounded-full bg-surface px-1.5 py-0.5 text-[11px] font-medium text-foreground shadow-sm ring-1 ring-border">
                {person.name}
              </span>
            </span>
          ) : null}
          <DeskSurface />
        </span>
        {person ? (
          <span className={ISO_BILLBOARD_CENTER_CLASS}>
            <StatusChip status={person.status} labels={copy.statuses} />
          </span>
        ) : null}
      </button>
    </div>
  );
}

export const Desk = memo(DeskImpl);
Desk.displayName = "Desk";
