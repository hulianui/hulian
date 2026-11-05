import type { SeatStatus } from "./org-classroom.types";

/**
 * 工位平面的内置文案。
 * 状态气泡的中文是产品锁定的默认值：在岗 / 忙碌 / 会议中 / 休假 / 面试中。
 * 英文只在 ConfigProvider locale={enUS} 时出现，不替换这份默认。
 */
export interface OrgClassroomCopy {
  floor: string;
  department: string;
  status: string;
  changeStatus: string;
  emptySeat: string;
  emptySeatHint: string;
  selectPrompt: string;
  personCard: string;
  focusZone: (name: string) => string;
  clearFocus: (name: string) => string;
  seatLabel: (name: string, status: string) => string;
  emptySeatLabel: (row: number, col: number) => string;
  statuses: Record<SeatStatus, string>;
}

export const ORG_CLASSROOM_COPY_ZH = {
  floor: "工位平面",
  department: "部门",
  status: "状态",
  changeStatus: "更改状态",
  emptySeat: "空位",
  emptySeatHint: "这个座位还没有人",
  selectPrompt: "点选一个座位查看人员",
  personCard: "人员",
  focusZone: (name) => `聚焦${name}`,
  clearFocus: (name) => `取消聚焦${name}`,
  seatLabel: (name, status) => `${name}，${status}`,
  emptySeatLabel: (row, col) => `空位 ${row}-${col}`,
  statuses: {
    idle: "在岗",
    busy: "忙碌",
    meeting: "会议中",
    leave: "休假",
    interview: "面试中",
  },
} satisfies OrgClassroomCopy;

export const ORG_CLASSROOM_COPY_EN = {
  floor: "Seat floor",
  department: "Department",
  status: "Status",
  changeStatus: "Change status",
  emptySeat: "Empty seat",
  emptySeatHint: "Nobody is sitting here",
  selectPrompt: "Select a seat to see who is here",
  personCard: "Person",
  focusZone: (name) => `Focus ${name}`,
  clearFocus: (name) => `Clear focus on ${name}`,
  seatLabel: (name, status) => `${name}, ${status}`,
  emptySeatLabel: (row, col) => `Empty seat ${row}-${col}`,
  statuses: {
    idle: "On duty",
    busy: "Busy",
    meeting: "In a meeting",
    leave: "On leave",
    interview: "Interviewing",
  },
} satisfies OrgClassroomCopy;
