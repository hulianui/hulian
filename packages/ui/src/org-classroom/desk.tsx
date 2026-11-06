import { memo } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "./avatar";
import type { OrgClassroomCopy } from "./copy";
import { SEAT_LIFT_CLASS } from "./iso";
import type { Seat } from "./org-classroom.types";

const TOP =
  "absolute rounded-xl bg-surface shadow-[0_10px_16px_-12px_rgba(0,0,0,0.55)] ring-1 ring-border";
const FRONT =
  "absolute origin-bottom rounded-b-lg bg-[color-mix(in_oklab,var(--color-surface)_58%,var(--color-foreground))] [transform:rotateX(-90deg)]";
const SIDE =
  "absolute origin-right rounded-r-lg bg-[color-mix(in_oklab,var(--color-surface)_74%,var(--color-foreground))] [transform:rotateY(90deg)]";

function DeskBody() {
  return (
    <span data-desk-body className="relative z-20 block h-14 w-[5.1rem] [transform-style:preserve-3d]" aria-hidden>
      <span className="absolute -bottom-1 left-3 right-3 h-2 rounded-full bg-foreground/15" />
      <span data-desk-front className={cn(FRONT, "bottom-0.5 left-1 right-1 h-4")} />
      <span data-desk-side className={cn(SIDE, "bottom-0.5 right-1 top-3 w-4")} />
      <span data-desk-top className={cn(TOP, "inset-x-0 top-1.5 h-8 [transform:translateZ(16px)]")} />
    </span>
  );
}

function Chair() {
  return (
    <span data-chair className="absolute bottom-11 left-1/2 h-8 w-8 -translate-x-1/2 [transform-style:preserve-3d]" aria-hidden>
      <span
        data-chair-seat
        className="absolute inset-x-1 bottom-0 h-2.5 rounded-md bg-muted [transform:translateZ(8px)]"
      />
      <span
        data-chair-back
        className="absolute inset-x-0.5 top-0 h-6 rounded-t-lg bg-[color-mix(in_oklab,var(--color-muted)_40%,var(--color-foreground))] [transform:translateZ(8px)]"
      />
    </span>
  );
}

function SeatedFigure() {
  return (
    <span data-seat-figure className="pointer-events-none relative z-10 -mb-8 h-16 w-[4.6rem] [transform-style:preserve-3d]">
      <span
        data-seat-lap
        className="absolute bottom-1 left-1/2 h-4 w-11 -translate-x-1/2 rounded-full bg-foreground"
        aria-hidden
      />
      <span
        data-seat-torso
        className="absolute bottom-5 left-1/2 w-12 -translate-x-1/2 [transform-style:preserve-3d]"
        style={{ transformOrigin: "center bottom", transform: "rotateZ(42deg) rotateX(-58deg)" }}
      >
        <Avatar />
      </span>
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
      className="pointer-events-none relative flex items-end justify-center [transform-style:preserve-3d]"
      style={{ gridColumn: Math.max(seat.col, 1), gridRow: Math.max(seat.row, 1) }}
      data-seat-id={seat.id}
      data-anchor={seat.id}
    >
      <button
        type="button"
        className="pointer-events-auto group relative flex w-[5.4rem] cursor-pointer items-end justify-center border-0 bg-transparent p-0 [transform-style:preserve-3d]"
        data-selected={selected ? "true" : "false"}
        aria-pressed={selected}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(seat.id);
        }}
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
          {person ? <SeatedFigure /> : null}
          <Chair />
          <DeskBody />
        </span>
      </button>
    </div>
  );
}

export const Desk = memo(DeskImpl);
Desk.displayName = "Desk";
