import type { SeatStatus } from "@hulianui/ui";
import { copy } from "./org.content";
import type {
  ActivityRecord,
  DepartmentRecord,
  InterviewRecord,
  OrgData,
  OrgSettings,
  PersonRecord,
  RoomRecord,
  SeatRecord,
} from "./types";

/**
 * 固定演示周。渲染期不读系统时钟：静态导出时服务端发生在构建时刻、客户端发生在访问时刻，
 * 跨天会算出不同的「今天」→ hydration 失败。Scheduler 与 RelativeTime 都吃这个基准。
 */
export const DEMO_DAY = "2026-11-16";
export const DEMO_NOW = "2026-11-16T11:15:00";

/** 部门分区色可选值。value 是喂给 OrgClassroom 的 CSS 颜色。 */
export const ACCENT_COLORS = [
  "var(--color-primary)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
] as const;

export const DEFAULT_SETTINGS: OrgSettings = {
  northDeg: 28,
  defaultView: 0,
  dayStart: "09:00",
  dayEnd: "18:00",
  showLegend: true,
  notifyStatus: true,
};

const DEPARTMENTS: DepartmentRecord[] = [
  {
    id: "design",
    name: copy("designName"),
    accent: "var(--color-primary)",
    facing: "down",
    floor: copy("designFloor"),
    leadId: "p01",
  },
  {
    id: "engineering",
    name: copy("engineeringName"),
    accent: "var(--color-info)",
    facing: "down",
    floor: copy("engineeringFloor"),
    leadId: "p11",
  },
  {
    id: "success",
    name: copy("successName"),
    accent: "var(--color-success)",
    facing: "down",
    floor: copy("successFloor"),
    leadId: "p21",
  },
];

const ROOMS: RoomRecord[] = [
  { id: "room-a", name: copy("roomCamellia"), floor: "3F", capacity: 4 },
  { id: "room-b", name: copy("roomOak"), floor: "4F", capacity: 3 },
  { id: "room-c", name: copy("roomElm"), floor: "4F", capacity: 2 },
];

interface PersonSeed {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  email: string;
  phone: string;
  joinedOn: string;
  status: SeatStatus;
}

function peopleSeed(): PersonSeed[] {
  return [
    {
      id: "p01",
      name: copy("linYuhan"),
      title: copy("productDesignLead"),
      departmentId: "design",
      email: "linyuhan@hanseat.dev",
      phone: "138 0013 8001",
      joinedOn: "2021-03-08",
      status: "idle",
    },
    {
      id: "p02",
      name: copy("chenKe"),
      title: copy("seniorProductDesigner"),
      departmentId: "design",
      email: "chenke@hanseat.dev",
      phone: "138 0013 8002",
      joinedOn: "2021-07-19",
      status: "busy",
    },
    {
      id: "p03",
      name: copy("zhouNing"),
      title: copy("interactionDesigner"),
      departmentId: "design",
      email: "zhouning@hanseat.dev",
      phone: "138 0013 8003",
      joinedOn: "2022-02-14",
      status: "meeting",
    },
    {
      id: "p04",
      name: copy("zhaoQiming"),
      title: copy("visualDesigner"),
      departmentId: "design",
      email: "zhaoqiming@hanseat.dev",
      phone: "138 0013 8004",
      joinedOn: "2022-05-30",
      status: "idle",
    },
    {
      id: "p05",
      name: copy("sunWan"),
      title: copy("uxResearcher"),
      departmentId: "design",
      email: "sunwan@hanseat.dev",
      phone: "138 0013 8005",
      joinedOn: "2022-09-05",
      status: "leave",
    },
    {
      id: "p06",
      name: copy("wuTong"),
      title: copy("productDesigner"),
      departmentId: "design",
      email: "wutong@hanseat.dev",
      phone: "138 0013 8006",
      joinedOn: "2023-01-09",
      status: "busy",
    },
    {
      id: "p07",
      name: copy("zhengCheng"),
      title: copy("designIntern"),
      departmentId: "design",
      email: "zhengcheng@hanseat.dev",
      phone: "138 0013 8007",
      joinedOn: "2025-07-07",
      status: "idle",
    },
    {
      id: "p08",
      name: copy("heAn"),
      title: copy("brandDesigner"),
      departmentId: "design",
      email: "hean@hanseat.dev",
      phone: "138 0013 8008",
      joinedOn: "2023-04-17",
      status: "interview",
    },
    {
      id: "p09",
      name: copy("xuZhixia"),
      title: copy("productDesigner"),
      departmentId: "design",
      email: "xuzhixia@hanseat.dev",
      phone: "138 0013 8009",
      joinedOn: "2023-08-21",
      status: "idle",
    },
    {
      id: "p10",
      name: copy("shenZhuo"),
      title: copy("motionDesigner"),
      departmentId: "design",
      email: "shenzhuo@hanseat.dev",
      phone: "138 0013 8010",
      joinedOn: "2024-03-11",
      status: "busy",
    },
    {
      id: "p11",
      name: copy("guXingzhou"),
      title: copy("engineeringDirector"),
      departmentId: "engineering",
      email: "guxingzhou@hanseat.dev",
      phone: "138 0013 8011",
      joinedOn: "2020-11-02",
      status: "idle",
    },
    {
      id: "p12",
      name: copy("tangTang"),
      title: copy("frontendEngineer"),
      departmentId: "engineering",
      email: "tangtang@hanseat.dev",
      phone: "138 0013 8012",
      joinedOn: "2021-06-15",
      status: "busy",
    },
    {
      id: "p13",
      name: copy("liangSiyuan"),
      title: copy("frontendEngineer"),
      departmentId: "engineering",
      email: "liangsiyuan@hanseat.dev",
      phone: "138 0013 8013",
      joinedOn: "2022-01-10",
      status: "idle",
    },
    {
      id: "p14",
      name: copy("hanXue"),
      title: copy("backendEngineer"),
      departmentId: "engineering",
      email: "hanxue@hanseat.dev",
      phone: "138 0013 8014",
      joinedOn: "2022-04-18",
      status: "busy",
    },
    {
      id: "p15",
      name: copy("caoYe"),
      title: copy("backendEngineer"),
      departmentId: "engineering",
      email: "caoye@hanseat.dev",
      phone: "138 0013 8015",
      joinedOn: "2022-10-24",
      status: "meeting",
    },
    {
      id: "p16",
      name: copy("xieZhiyao"),
      title: copy("qaEngineer"),
      departmentId: "engineering",
      email: "xiezhiyao@hanseat.dev",
      phone: "138 0013 8016",
      joinedOn: "2023-02-27",
      status: "idle",
    },
    {
      id: "p17",
      name: copy("luoYizhou"),
      title: copy("architect"),
      departmentId: "engineering",
      email: "luoyizhou@hanseat.dev",
      phone: "138 0013 8017",
      joinedOn: "2021-09-13",
      status: "busy",
    },
    {
      id: "p18",
      name: copy("jiangQing"),
      title: copy("dataEngineer"),
      departmentId: "engineering",
      email: "jiangqing@hanseat.dev",
      phone: "138 0013 8018",
      joinedOn: "2023-06-05",
      status: "idle",
    },
    {
      id: "p19",
      name: copy("fuXiao"),
      title: copy("sre"),
      departmentId: "engineering",
      email: "fuxiao@hanseat.dev",
      phone: "138 0013 8019",
      joinedOn: "2023-11-20",
      status: "leave",
    },
    {
      id: "p20",
      name: copy("luYao"),
      title: copy("frontendIntern"),
      departmentId: "engineering",
      email: "luyao@hanseat.dev",
      phone: "138 0013 8020",
      joinedOn: "2025-08-04",
      status: "idle",
    },
    {
      id: "p21",
      name: copy("suNian"),
      title: copy("customerSuccessLead"),
      departmentId: "success",
      email: "sunian@hanseat.dev",
      phone: "138 0013 8021",
      joinedOn: "2021-05-06",
      status: "idle",
    },
    {
      id: "p22",
      name: copy("baiLu"),
      title: copy("customerSuccessManager"),
      departmentId: "success",
      email: "bailu@hanseat.dev",
      phone: "138 0013 8022",
      joinedOn: "2022-03-14",
      status: "meeting",
    },
    {
      id: "p23",
      name: copy("jiangYu"),
      title: copy("customerSuccessManager"),
      departmentId: "success",
      email: "jiangyu@hanseat.dev",
      phone: "138 0013 8023",
      joinedOn: "2022-08-01",
      status: "idle",
    },
    {
      id: "p24",
      name: copy("yaoKe"),
      title: copy("implementationConsultant"),
      departmentId: "success",
      email: "yaoke@hanseat.dev",
      phone: "138 0013 8024",
      joinedOn: "2023-03-20",
      status: "busy",
    },
    {
      id: "p25",
      name: copy("cuiMing"),
      title: copy("implementationConsultant"),
      departmentId: "success",
      email: "cuiming@hanseat.dev",
      phone: "138 0013 8025",
      joinedOn: "2023-07-10",
      status: "idle",
    },
    {
      id: "p26",
      name: copy("duanRan"),
      title: copy("supportSpecialist"),
      departmentId: "success",
      email: "duanran@hanseat.dev",
      phone: "138 0013 8026",
      joinedOn: "2024-01-15",
      status: "leave",
    },
    {
      id: "p27",
      name: copy("wenYan"),
      title: copy("supportSpecialist"),
      departmentId: "success",
      email: "wenyan@hanseat.dev",
      phone: "138 0013 8027",
      joinedOn: "2024-06-03",
      status: "idle",
    },
    {
      id: "p28",
      name: copy("chengXing"),
      title: copy("customerOperations"),
      departmentId: "success",
      email: "chengxing@hanseat.dev",
      phone: "138 0013 8028",
      joinedOn: "2024-10-21",
      status: "interview",
    },
    {
      id: "p29",
      name: copy("fangXiao"),
      title: copy("productDesigner"),
      departmentId: "design",
      email: "fangxiao@hanseat.dev",
      phone: "138 0013 8029",
      joinedOn: "2026-11-10",
      status: "idle",
    },
    {
      id: "p30",
      name: copy("shaoChuan"),
      title: copy("frontendEngineer"),
      departmentId: "engineering",
      email: "shaochuan@hanseat.dev",
      phone: "138 0013 8030",
      joinedOn: "2026-11-12",
      status: "idle",
    },
    {
      id: "p31",
      name: copy("mengQiu"),
      title: copy("customerSuccessManager"),
      departmentId: "success",
      email: "mengqiu@hanseat.dev",
      phone: "138 0013 8031",
      joinedOn: "2025-12-01",
      status: "idle",
    },
    {
      id: "p32",
      name: copy("quFei"),
      title: copy("dataAnalyst"),
      departmentId: "engineering",
      email: "qufei@hanseat.dev",
      phone: "138 0013 8032",
      joinedOn: "2025-09-08",
      status: "idle",
    },
  ];
}

/** 三个分区：设计 4×3、研发 4×3、客户成功 3×3。排在前面的座位按入职顺序分配。 */
function seatsSeed(people: PersonRecord[]): SeatRecord[] {
  const layout = [
    { departmentId: "design", cols: 3, rows: 4 },
    { departmentId: "engineering", cols: 3, rows: 4 },
    { departmentId: "success", cols: 3, rows: 3 },
  ];
  const seats: SeatRecord[] = [];
  for (const zone of layout) {
    for (let row = 1; row <= zone.rows; row += 1) {
      for (let col = 1; col <= zone.cols; col += 1) {
        seats.push({
          id: `${zone.departmentId}-${String((row - 1) * zone.cols + col).padStart(2, "0")}`,
          departmentId: zone.departmentId,
          row,
          col,
        });
      }
    }
    const members = people.filter(
      (person) => person.departmentId === zone.departmentId && Number(person.id.slice(1)) <= 28,
    );
    const zoneSeats = seats.filter((seat) => seat.departmentId === zone.departmentId);
    members.forEach((person, index) => {
      const seat = zoneSeats[index];
      if (!seat) return;
      seat.personId = person.id;
      person.seatId = seat.id;
    });
  }
  return seats;
}

function interviewsSeed(): InterviewRecord[] {
  return [
    {
      id: "iv-01",
      candidate: copy("heJia"),
      role: copy("frontendEngineer"),
      stage: "screen",
      status: "done",
      roomId: "room-a",
      interviewerId: "p11",
      start: "2026-11-16T09:30:00",
      end: "2026-11-16T10:15:00",
    },
    {
      id: "iv-02",
      candidate: copy("luYi"),
      role: copy("productDesigner"),
      stage: "tech",
      status: "ongoing",
      roomId: "room-b",
      interviewerId: "p01",
      start: "2026-11-16T11:00:00",
      end: "2026-11-16T11:45:00",
    },
    {
      id: "iv-03",
      candidate: copy("mengRan"),
      role: copy("customerSuccessManager"),
      stage: "screen",
      status: "scheduled",
      roomId: "room-c",
      interviewerId: "p21",
      start: "2026-11-16T14:00:00",
      end: "2026-11-16T14:45:00",
    },
    {
      id: "iv-04",
      candidate: copy("zhongLi"),
      role: copy("dataEngineer"),
      stage: "final",
      status: "scheduled",
      roomId: "room-a",
      interviewerId: "p11",
      start: "2026-11-16T16:00:00",
      end: "2026-11-16T16:45:00",
    },
    {
      id: "iv-05",
      candidate: copy("suMu"),
      role: copy("brandDesigner"),
      stage: "tech",
      status: "scheduled",
      roomId: "room-b",
      interviewerId: "p01",
      start: "2026-11-17T10:00:00",
      end: "2026-11-17T10:45:00",
    },
    {
      id: "iv-06",
      candidate: copy("guQing"),
      role: copy("backendEngineer"),
      stage: "final",
      status: "scheduled",
      roomId: "room-a",
      interviewerId: "p11",
      start: "2026-11-17T15:30:00",
      end: "2026-11-17T16:15:00",
    },
    {
      id: "iv-07",
      candidate: copy("shangLu"),
      role: copy("supportSpecialist"),
      stage: "screen",
      status: "scheduled",
      roomId: "room-c",
      interviewerId: "p21",
      start: "2026-11-18T09:30:00",
      end: "2026-11-18T10:15:00",
    },
    {
      id: "iv-08",
      candidate: copy("linYe"),
      role: copy("productDesigner"),
      stage: "final",
      status: "canceled",
      roomId: "room-b",
      interviewerId: "p01",
      start: "2026-11-18T14:00:00",
      end: "2026-11-18T14:45:00",
    },
  ];
}

function activitySeed(): ActivityRecord[] {
  return [
    { id: "act-01", at: "2026-11-16T11:05:00", kind: "status", personId: "p02", status: "busy" },
    { id: "act-02", at: "2026-11-16T10:40:00", kind: "interview", candidate: copy("heJia"), note: "done" },
    { id: "act-03", at: "2026-11-16T10:12:00", kind: "status", personId: "p11", status: "busy" },
    { id: "act-04", at: "2026-11-16T09:46:00", kind: "status", personId: "p22", status: "meeting" },
    { id: "act-05", at: "2026-11-16T09:20:00", kind: "join", personId: "p30" },
    { id: "act-06", at: "2026-11-16T08:58:00", kind: "status", personId: "p05", status: "leave" },
    { id: "act-07", at: "2026-11-15T18:20:00", kind: "interview", candidate: copy("luYi"), note: "scheduled" },
    { id: "act-08", at: "2026-11-15T17:05:00", kind: "seat", personId: "p08", seatId: "design-08", note: "assigned" },
    { id: "act-09", at: "2026-11-15T16:30:00", kind: "join", personId: "p29" },
    { id: "act-10", at: "2026-11-15T15:42:00", kind: "interview", candidate: copy("linYe"), note: "canceled" },
    { id: "act-11", at: "2026-11-15T14:10:00", kind: "status", personId: "p17", status: "busy" },
    { id: "act-12", at: "2026-11-14T11:30:00", kind: "seat", personId: "p28", seatId: "success-08", note: "assigned" },
  ];
}

export function buildSeed(): OrgData {
  const people = peopleSeed();
  const seats = seatsSeed(people);
  return {
    departments: DEPARTMENTS.map((department) => ({ ...department })),
    seats,
    people,
    rooms: ROOMS.map((room) => ({ ...room })),
    interviews: interviewsSeed(),
    activity: activitySeed(),
    settings: { ...DEFAULT_SETTINGS },
  };
}
