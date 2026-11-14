import type { SeatStatus, ViewAngle } from "@hulianui/ui";
import { copy } from "./labels.content";
import type { InterviewStage, InterviewStatus } from "../_data/types";

export const STATUS_LABEL: Record<SeatStatus, string> = {
  idle: copy("idle"),
  busy: copy("busy"),
  meeting: copy("meeting"),
  leave: copy("leave"),
  interview: copy("interview"),
};

export const STATUS_TONE = {
  idle: "success",
  busy: "warning",
  meeting: "brand",
  leave: "neutral",
  interview: "info",
} as const;

/** 图例/圆点用。必须是带 --color- 前缀的变量，裸 token 在 SVG 与内联样式里不解析。 */
export const STATUS_COLOR: Record<SeatStatus, string> = {
  idle: "var(--color-success)",
  busy: "var(--color-warning)",
  meeting: "var(--color-primary)",
  leave: "var(--color-muted-foreground)",
  interview: "var(--color-info)",
};

export const STATUS_ORDER: readonly SeatStatus[] = ["idle", "busy", "meeting", "leave", "interview"];

export const STAGE_LABEL: Record<InterviewStage, string> = {
  screen: copy("screen"),
  tech: copy("tech"),
  final: copy("final"),
};

export const INTERVIEW_STATUS_LABEL: Record<InterviewStatus, string> = {
  scheduled: copy("scheduled"),
  ongoing: copy("ongoing"),
  done: copy("done"),
  canceled: copy("canceled"),
};

export const INTERVIEW_STATUS_TONE = {
  scheduled: "info",
  ongoing: "warning",
  done: "success",
  canceled: "neutral",
} as const;

export const FACING_LABEL = {
  up: copy("up"),
  right: copy("right"),
  down: copy("down"),
  left: copy("left"),
} as const;

export const VIEW_LABEL: Record<ViewAngle, string> = {
  0: "0°",
  90: "90°",
  180: "180°",
  270: "270°",
};

export function formatSeat(accentName: string, row: number, col: number): string {
  return copy("seatLabel", accentName, row, col);
}

export const SEAT_UNASSIGNED = copy("unassigned");
