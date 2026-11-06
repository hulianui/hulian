import { memo, type MouseEvent as ReactMouseEvent } from "react";
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

function DeskBody({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <span data-desk-body className="pointer-events-none relative z-20 block h-14 w-[5.1rem] [transform-style:preserve-3d]">
      <span className="absolute -bottom-1 left-3 right-3 h-2 rounded-full bg-foreground/15" />
      <span data-desk-front className={cn(FRONT, "bottom-0.5 left-1 right-1 h-4")} />
      <span data-desk-side className={cn(SIDE, "bottom-0.5 right-1 top-3 w-4")} />
      <button
        type="button"
        data-desk-top
        data-desk-hit
        className={cn(TOP, "pointer-events-auto inset-x-0 top-1.5 h-8 cursor-pointer border-0 p-0 [transform:translateZ(16px)]")}
        data-selected={selected ? "true" : "false"}
        aria-pressed={selected}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      />
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

function SeatedFigure({ onSelect }: { onSelect: () => void }) {
  const select = (event: ReactMouseEvent) => {
    event.stopPropagation();
    onSelect();
  };
  return (
    <span data-seat-figure className="pointer-events-none relative z-10 -mb-6 h-[4.5rem] w-[4.4rem] [transform-style:preserve-3d]">
      <span
        data-seat-lap
        className="pointer-events-auto absolute bottom-0 left-1/2 flex w-[3.4rem] -translate-x-1/2 justify-between"
        style={{ transform: "scale(var(--lap-scale, 1))", transformOrigin: "center bottom" }}
        aria-hidden
        onClick={select}
      >
        <span className="h-8 w-[1.35rem] rounded-full bg-foreground" />
        <span className="h-8 w-[1.35rem] rounded-full bg-foreground" />
      </span>
      <span
        data-seat-torso
        className="pointer-events-none absolute bottom-5 left-1/2 w-14 -translate-x-1/2 [transform-style:preserve-3d]"
        style={{
          transformOrigin: "center bottom",
          transform: "scale(var(--figure-scale, 1)) rotateZ(42deg) rotateX(-58deg)",
        }}
      >
        <Avatar onSelect={select} />
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
      className="group pointer-events-none relative flex items-end justify-center [transform-style:preserve-3d]"
      data-selected={selected ? "true" : "false"}
      style={{ gridColumn: Math.max(seat.col, 1), gridRow: Math.max(seat.row, 1) }}
      data-seat-id={seat.id}
      data-anchor={seat.id}
    >
      <span
        data-seat-lift
        className={cn(
          SEAT_LIFT_CLASS,
          "pointer-events-none relative flex w-[5.1rem] flex-col items-center justify-end",
          "group-hover:outline group-hover:outline-2 group-hover:outline-primary/50",
          "group-data-[selected=true]:outline group-data-[selected=true]:outline-2 group-data-[selected=true]:outline-primary",
        )}
      >
        {person ? <SeatedFigure onSelect={() => onSelect(seat.id)} /> : null}
        <Chair />
        <DeskBody label={label} selected={selected} onSelect={() => onSelect(seat.id)} />
      </span>
    </div>
  );
}

export const Desk = memo(DeskImpl);
Desk.displayName = "Desk";
