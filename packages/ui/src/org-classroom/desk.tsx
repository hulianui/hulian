import { memo, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
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
  lap,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  lap?: ReactNode;
}) {
  return (
    <span data-desk-body className="pointer-events-none relative z-20 block h-14 w-[5.1rem] [transform-style:preserve-3d]">
      <span className="absolute -bottom-1 left-3 right-3 h-2 rounded-full bg-foreground/15" />
      <Chair />
      <span data-desk-front className={cn(FRONT, "bottom-0.5 left-1 right-1 h-3")} />
      <span data-desk-side className={cn(SIDE, "bottom-0.5 right-1 top-3 w-4")} />
      {lap}
      <button
        type="button"
        data-desk-top
        data-desk-hit
        className={cn(
          TOP,
          "pointer-events-auto inset-x-0 top-1.5 z-30 h-8 cursor-pointer border-0 p-0 [transform:translateZ(16px)]",
        )}
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
    <span
      data-chair
      className="pointer-events-none absolute left-1/2 -top-5 h-7 w-8 -translate-x-1/2 [transform-style:preserve-3d]"
      aria-hidden
    >
      <span
        data-chair-seat
        className="absolute inset-x-1 bottom-0 h-2 rounded-md bg-muted [transform:translateZ(6px)]"
      />
      <span
        data-chair-back
        className="absolute inset-x-0.5 top-0 h-4 rounded-t-md bg-[color-mix(in_oklab,var(--color-muted)_40%,var(--color-foreground))] [transform:translateZ(6px)]"
      />
    </span>
  );
}

/**
 * 骨盆和两条略扁的腿留在椅子和桌面远沿之间，高度低于桌面。
 * 它们沿桌深伸到远沿下面，被 translateZ(16px) 的整块桌面盖住伸进去的一段。
 * 近端停在近沿之前，底边是平的，也不贴桌面两侧。
 */
function SeatedLap({ onSelect }: { onSelect: () => void }) {
  const select = (event: ReactMouseEvent) => {
    event.stopPropagation();
    onSelect();
  };
  return (
    <span
      data-seat-lap
      className="pointer-events-auto absolute left-1/2 z-[5] w-[2.3rem] -translate-x-1/2"
      style={{ top: "-1.35rem", height: "2.15rem", transform: "translateZ(9px)" }}
      aria-hidden
      onClick={select}
    >
      <span
        data-seat-pelvis
        className="absolute inset-x-0 top-1.5 h-[0.85rem] rounded-[0.7rem] bg-foreground"
      />
      <span data-seat-thigh className="absolute bottom-0 left-0 h-[1.55rem] w-[0.62rem] rounded-t-md bg-foreground" />
      <span data-seat-thigh className="absolute bottom-0 right-0 h-[1.55rem] w-[0.62rem] rounded-t-md bg-foreground" />
    </span>
  );
}

function SeatedTorso({ onSelect }: { onSelect: () => void }) {
  const select = (event: ReactMouseEvent) => {
    event.stopPropagation();
    onSelect();
  };
  return (
    <span
      data-seat-figure
      className="pointer-events-none absolute left-1/2 top-[-4.15rem] z-10 w-[4.6rem] -translate-x-1/2 [transform-style:preserve-3d]"
    >
      <span
        data-seat-torso
        className="pointer-events-none block w-[4.6rem] [transform-style:preserve-3d]"
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
        {person ? <SeatedTorso onSelect={() => onSelect(seat.id)} /> : null}
        <DeskBody
          label={label}
          selected={selected}
          onSelect={() => onSelect(seat.id)}
          lap={person ? <SeatedLap onSelect={() => onSelect(seat.id)} /> : undefined}
        />
      </span>
    </div>
  );
}

export const Desk = memo(DeskImpl);
Desk.displayName = "Desk";
