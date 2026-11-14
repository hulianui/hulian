import type { SeatStatus, ViewAngle } from "@hulianui/ui";

/** 部门分区：对应 OrgClassroom 的 Zone，但只存主数据，座位由 SeatRecord 关联。 */
export interface DepartmentRecord {
  id: string;
  name: string;
  /** CSS 颜色，必须带 --color- 前缀，直接喂给 OrgClassroom 的 Zone.accent。 */
  accent: string;
  /** 这一区的人面朝平面图哪边。 */
  facing: "up" | "right" | "down" | "left";
  /** 楼层/区域文案。 */
  floor: string;
  /** 部门负责人，指向 PersonRecord.id。 */
  leadId: string;
}

export interface PersonRecord {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  email: string;
  phone: string;
  /** 入职日期，ISO 日期串。 */
  joinedOn: string;
  status: SeatStatus;
  /** 当前工位 id；未分配时没有这个字段。 */
  seatId?: string;
}

export interface SeatRecord {
  id: string;
  departmentId: string;
  row: number;
  col: number;
  personId?: string;
}

export interface RoomRecord {
  id: string;
  name: string;
  floor: string;
  capacity: number;
}

export type InterviewStage = "screen" | "tech" | "final";
export type InterviewStatus = "scheduled" | "ongoing" | "done" | "canceled";

export interface InterviewRecord {
  id: string;
  candidate: string;
  role: string;
  stage: InterviewStage;
  status: InterviewStatus;
  roomId: string;
  /** 面试官，指向 PersonRecord.id。 */
  interviewerId: string;
  /** ISO datetime，本地时区。 */
  start: string;
  end: string;
}

export type ActivityKind = "status" | "seat" | "interview" | "join";
export type SeatActivityNote = "assigned" | "released";
export type InterviewActivityNote = "scheduled" | "canceled" | "done";

export interface ActivityRecord {
  id: string;
  /** ISO datetime。 */
  at: string;
  kind: ActivityKind;
  personId?: string;
  seatId?: string;
  status?: SeatStatus;
  note?: SeatActivityNote | InterviewActivityNote;
  /** 面试动态用：候选人不一定在人员名录里，因此存快照。 */
  candidate?: string;
}

export interface OrgSettings {
  northDeg: number;
  defaultView: ViewAngle;
  dayStart: string;
  dayEnd: string;
  showLegend: boolean;
  notifyStatus: boolean;
}

export interface OrgData {
  departments: DepartmentRecord[];
  seats: SeatRecord[];
  people: PersonRecord[];
  rooms: RoomRecord[];
  interviews: InterviewRecord[];
  activity: ActivityRecord[];
  settings: OrgSettings;
}
