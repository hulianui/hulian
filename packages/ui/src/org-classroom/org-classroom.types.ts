export type SeatStatus = "idle" | "busy" | "meeting" | "leave" | "interview";

export const SEAT_STATUSES = ["idle", "busy", "meeting", "leave", "interview"] as const satisfies readonly SeatStatus[];

/** 坐在工位上的人。没有人时座位是空的，不渲染状态气泡。 */
export interface SeatPerson {
  id: string;
  name: string;
  status: SeatStatus;
}

/**
 * 一张工位。`row` / `col` 从 1 开始，决定它在分区网格里的位置。
 * 同一层楼里 `id` 必须唯一。
 */
export interface Seat {
  id: string;
  row: number;
  col: number;
  person?: SeatPerson;
}

/** 一块部门地板。`accent` 是 CSS 颜色，主题色要写成 `var(--color-*)`。 */
export interface Zone {
  id: string;
  name: string;
  accent: string;
  seats: Seat[];
}

export interface OrgClassroomProps {
  /** 部门分区。v1 只画中间这块工位平面。 */
  zones: Zone[];
  /**
   * 受控的选中座位。传 `null` 表示没有选中。
   * 不传则组件自己记住最近一次点选。
   */
  selectedSeatId?: string | null;
  /**
   * 点选座位（有人或空位都可以）时得到座位 id。
   * 关闭人员卡（关闭按钮或 Esc）时得到 `null`。
   * 再点已经选中的座位仍得到同一个 id，卡片保持打开。
   */
  onSeatSelect?: (seatId: string | null) => void;
  /**
   * 在人员卡里改状态。组件不自己改 `zones`，
   * 调用方把新状态写回 `Seat.person.status`。
   */
  onStatusChange?: (seatId: string, status: SeatStatus) => void;
  /**
   * 受控的聚焦分区。传 `null` 表示没有聚焦。
   * 不传则组件自己记住。
   */
  focusedZoneId?: string | null;
  /** 点分区空白处聚焦；再点一次已聚焦的空白处清空（`null`）。 */
  onZoneFocus?: (zoneId: string | null) => void;
  className?: string;
}
