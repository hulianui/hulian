export type SeatStatus = "idle" | "busy" | "meeting" | "leave" | "interview";

/** 人在平面图上面朝哪边。`down` 是平面图下方，也是默认视角里朝向观众的一侧。 */
export type ZoneFacing = "up" | "right" | "down" | "left";

/** 观察视角，度。每加 90，楼层在屏幕上顺时针转 90°。 */
export type ViewAngle = 0 | 90 | 180 | 270;

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
  /** 这一区的人面朝平面图的哪边，桌子跟着转。默认 `down`。 */
  facing?: ZoneFacing;
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
  /** 受控的观察视角。不传则组件自己记住，从 0 开始。 */
  view?: ViewAngle;
  /** 点指南针旁的旋转按钮时得到新视角。 */
  onViewChange?: (view: ViewAngle) => void;
  /** 真北相对平面图上方顺时针转过的角度，只影响指南针。默认 0（平面图上方就是北）。 */
  northDeg?: number;
  className?: string;
}
