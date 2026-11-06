import { memo } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "./avatar";
import type { OrgClassroomCopy } from "./copy";
import { SEAT_LIFT_CLASS } from "./iso";
import type { Seat } from "./org-classroom.types";

const TOP = "absolute rounded-[7px] bg-surface ring-1 ring-border";
const FRONT =
  "absolute origin-bottom bg-[color-mix(in_oklab,var(--color-surface)_64%,var(--color-foreground))] [transform:rotateX(-90deg)]";
const SIDE =
  "absolute origin-right bg-[color-mix(in_oklab,var(--color-surface)_78%,var(--color-foreground))] [transform:rotateY(90deg)]";

function DeskBody() {
  return (
    <span data-desk-body className="relative block h-11 w-[4.7rem] [transform-style:preserve-3d]" aria-hidden>
      <span data-desk-front className={cn(FRONT, "bottom-1 left-1 right-1 h-3 rounded-b-[6px]")} />
      <span data-desk-side className={cn(SIDE, "bottom-1 right-1 top-3 w-3 rounded-r-[6px]")} />
      <span data-desk-top className={cn(TOP, "inset-x-0 top-2 h-7 [transform:translateZ(12px)]")} />
    </span>
  );
}

function Chair() {
  return (
    <span data-chair className="absolute bottom-8 left-1/2 h-9 w-9 -translate-x-1/2 [transform-style:preserve-3d]" aria-hidden>
      <span
        data-chair-seat
        className="absolute inset-x-1 bottom-0 h-2.5 rounded-[4px] bg-muted [transform:translateZ(8px)]"
      />
      <span
        data-chair-back
        className="absolute inset-x-0 top-0 h-7 rounded-t-[7px] bg-[color-mix(in_oklab,var(--color-muted)_42%,var(--color-foreground))] [transform:translateZ(8px)]"
      />
    </span>
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
      className="pointer-events-auto relative [transform-style:preserve-3d]"
      style={{ gridColumn: Math.max(seat.col, 1), gridRow: Math.max(seat.row, 1) }}
      data-seat-id={seat.id}
      data-anchor={seat.id}
    >
      <button
        type="button"
        className="group relative flex h-[8.25rem] w-[5.6rem] cursor-pointer items-end justify-center border-0 bg-transparent p-0 [transform-style:preserve-3d]"
        data-selected={selected ? "true" : "false"}
        aria-pressed={selected}
        aria-label={label}
        onClick={() => onSelect(seat.id)}
      >
        <span
          data-seat-lift
          className={cn(
            SEAT_LIFT_CLASS,
            "relative flex w-full flex-col items-center justify-end",
            "group-hover:outline group-hover:outline-2 group-hover:outline-primary/50",
            "group-data-[selected=true]:outline group-data-[selected=true]:outline-2 group-data-[selected=true]:outline-primary",
          )}
        >
          {person ? (
            <span
              data-seat-figure
              className="relative z-20 mb-1 [transform-style:preserve-3d]"
              style={{
                transformOrigin: "center bottom",
                transform:
                  "translateY(-52px) rotateZ(42deg) rotateX(-58deg) scale(var(--figure-scale, 1))",
              }}
            >
              <Avatar />
            </span>
          ) : null}
          <Chair />
          <DeskBody />
        </span>
      </button>
    </div>
  );
}

export const Desk = memo(DeskImpl);
Desk.displayName = "Desk";
