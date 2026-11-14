"use client";
import { copy } from "./activity-feed.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../_components/demo-locale";
import { useMemo } from "react";
import { Empty, RelativeTime, Timeline, type TimelineItemProps } from "@hulianui/ui";
import { useOrg } from "../_lib/org-store";
import { DEMO_NOW } from "../_data/org";
import { STATUS_LABEL, formatSeat } from "../_lib/labels";
import type { ActivityRecord } from "../_data/types";

const TONE: Record<ActivityRecord["kind"], NonNullable<TimelineItemProps["color"]>> = {
  status: "primary",
  seat: "success",
  interview: "primary",
  join: "default",
};

export function ActivityFeed({ items, limit }: { items: ActivityRecord[]; limit?: number }) {
  const { peopleById, seatsById, departmentsById } = useOrg();
  const rows = useMemo(() => {
    const slice = typeof limit === "number" ? items.slice(0, limit) : items;
    return slice.map<TimelineItemProps>((item) => {
      const person = item.personId ? peopleById.get(item.personId) : undefined;
      const personName = person?.name ?? copy("unknownPerson");
      const seat = item.seatId ? seatsById.get(item.seatId) : undefined;
      const department = seat ? departmentsById.get(seat.departmentId) : undefined;
      const seatName =
        seat && department
          ? formatSeat(department.name, seat.row, seat.col)
          : copy("unknownSeat");

      let text: string;
      let color: NonNullable<TimelineItemProps["color"]> = TONE[item.kind];
      if (item.kind === "status" && item.status) {
        text = copy("statusChanged", personName, STATUS_LABEL[item.status]);
      } else if (item.kind === "seat") {
        text =
          item.note === "released"
            ? copy("seatReleased", personName, seatName)
            : copy("seatAssigned", personName, seatName);
        color = item.note === "released" ? "warning" : "success";
      } else if (item.kind === "join") {
        text = copy("joined", personName);
      } else if (item.note === "canceled") {
        text = copy("interviewCanceled", item.candidate ?? "");
        color = "danger";
      } else if (item.note === "done") {
        text = copy("interviewDone", item.candidate ?? "");
        color = "success";
      } else {
        text = copy("interviewScheduled", item.candidate ?? "");
      }

      return {
        children: text,
        color,
        label: (
          <RelativeTime
            value={item.at}
            base={DEMO_NOW}
            locale={DEMO_RELATIVE_TIME_LOCALE}
            updateInterval={0}
          />
        ),
      };
    });
  }, [items, limit, peopleById, seatsById, departmentsById]);

  if (rows.length === 0) return <Empty size="sm" title={copy("empty")} />;
  return <Timeline items={rows} />;
}
