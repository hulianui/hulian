import type { SeatStatus, Zone } from "./org-classroom.types";

/**
 * 把 `onStatusChange` 写回 zones。没人的座位、未知 id、状态没变，都保持原引用。
 */
export function updateSeatStatus(zones: readonly Zone[], seatId: string, status: SeatStatus): Zone[] {
  return zones.map((zone) => {
    let changed = false;
    const seats = zone.seats.map((seat) => {
      if (seat.id !== seatId || !seat.person || seat.person.status === status) return seat;
      changed = true;
      return { ...seat, person: { ...seat.person, status } };
    });
    return changed ? { ...zone, seats } : zone;
  });
}
