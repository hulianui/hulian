import { memo } from "react";
import { Tag } from "../tag";
import type { TagTone } from "../tag";
import { cn } from "../lib/cn";
import type { OrgClassroomCopy } from "./copy";
import { SEAT_STATUSES, type SeatStatus } from "./org-classroom.types";

const STATUS_TONE: Record<SeatStatus, TagTone> = {
  idle: "success",
  busy: "warning",
  meeting: "brand",
  leave: "neutral",
  interview: "info",
};

/** 场景缩小时人名收成圆点，圆点用和气泡同一档色。 */
const STATUS_DOT: Record<SeatStatus, string> = {
  idle: "bg-success",
  busy: "bg-warning",
  meeting: "bg-primary",
  leave: "bg-muted-foreground",
  interview: "bg-info",
};

const FADE_CLASS =
  "col-start-1 row-start-1 transition-opacity duration-200 ease-out motion-reduce:transition-none";

/**
 * 状态气泡。五档文案叠在同一格里交叉淡入，避免状态切换时整颗气泡卸载重来。
 * 空座位不渲染这个组件。
 */
function StatusChipImpl({
  status,
  labels,
}: {
  status: SeatStatus;
  labels: OrgClassroomCopy["statuses"];
}) {
  return (
    <span data-slot="status-chip" className="inline-grid" aria-hidden>
      {SEAT_STATUSES.map((item) => {
        const visible = item === status;
        return (
          <Tag
            key={item}
            tone={STATUS_TONE[item]}
            size="sm"
            variant="soft"
            data-visible={visible ? "true" : "false"}
            className={cn(FADE_CLASS, visible ? "opacity-100" : "pointer-events-none opacity-0")}
          >
            {labels[item]}
          </Tag>
        );
      })}
    </span>
  );
}

export const StatusChip = memo(StatusChipImpl);
StatusChip.displayName = "StatusChip";

export { STATUS_DOT, STATUS_TONE };
