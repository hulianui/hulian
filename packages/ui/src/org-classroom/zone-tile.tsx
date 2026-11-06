import { memo } from "react";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { OrgClassroomCopy } from "./copy";
import { Desk } from "./desk";
import type { Zone } from "./org-classroom.types";

const ZONE_WASH = "bg-[color-mix(in_oklab,var(--zone-accent)_16%,var(--color-surface))]";

function ZoneTileImpl({
  zone,
  copy,
  focused,
  quiet,
  selectedSeatId,
  onSeatSelect,
  onZoneToggle,
}: {
  zone: Zone;
  copy: OrgClassroomCopy;
  focused: boolean;
  quiet: boolean;
  selectedSeatId: string | null;
  onSeatSelect: (seatId: string) => void;
  onZoneToggle: (zoneId: string) => void;
}) {
  const columns = Math.max(1, ...zone.seats.map((seat) => seat.col));
  const rows = Math.max(1, ...zone.seats.map((seat) => seat.row));
  const style = { "--zone-accent": zone.accent } as CSSProperties;

  return (
    <div
      data-zone-id={zone.id}
      data-anchor={zone.id}
      data-focused={focused ? "true" : "false"}
      data-quiet={quiet ? "true" : "false"}
      className={cn(
        "pointer-events-auto relative rounded-[32px] border border-border px-4 pt-4 pb-4 shadow-[0_22px_36px_-20px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.72)] [transform-style:preserve-3d]",
        "transition-opacity duration-300 ease-out motion-reduce:transition-none",
        "data-[quiet=true]:opacity-40 data-[focused=true]:ring-2 data-[focused=true]:ring-primary/40",
        ZONE_WASH,
      )}
      style={style}
    >
      <button
        type="button"
        data-zone-floor
        className="absolute inset-0 z-0 cursor-pointer rounded-[28px] border-0 bg-transparent p-0"
        aria-pressed={focused}
        aria-label={focused ? copy.clearFocus(zone.name) : copy.focusZone(zone.name)}
        onClick={(event) => {
          event.stopPropagation();
          onZoneToggle(zone.id);
        }}
      />
      <div
        className="relative z-10 grid gap-x-5 gap-y-10 pointer-events-none [transform-style:preserve-3d]"
        style={{
          gridTemplateColumns: `repeat(${columns}, 5.6rem)`,
          gridTemplateRows: `repeat(${rows}, 7.5rem)`,
        }}
      >
        {zone.seats.map((seat) => (
          <Desk
            key={seat.id}
            seat={seat}
            copy={copy}
            selected={seat.id === selectedSeatId}
            onSelect={onSeatSelect}
          />
        ))}
      </div>
    </div>
  );
}

export const ZoneTile = memo(ZoneTileImpl);
ZoneTile.displayName = "ZoneTile";
