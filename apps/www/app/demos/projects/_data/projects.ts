import type { Milestone, Project, ProjectEvent, ScheduleTask } from "./types";

// 8 个工程项目，覆盖各阶段/状态，贯穿报价·开票·照片三模块的关联 ID。
export const projects: Project[] = [
  {
    id: "p1",
    code: "PRJ-2026-001",
    name: "云栖数据中心机电安装工程",
    client: "云栖科技股份有限公司",
    crew: "鸿基机电班组",
    owner: "陈工",
    stage: "施工",
    status: "进行中",
    progress: 62,
    contractAmount: 2860000,
    startAt: "2026-03-10",
    dueAt: "2026-07-20",
    address: "杭州市余杭区云栖小镇 18 号",
    region: "浙江·杭州",
    tags: ["机电", "重点工程"],
  },
  {
    id: "p2",
    code: "PRJ-2026-002",
    name: "瑞康制药 GMP 洁净车间装饰工程",
    client: "瑞康制药有限公司",
    crew: "金顶装饰队",
    owner: "周磊",
    stage: "验收",
    status: "进行中",
    progress: 88,
    contractAmount: 1740000,
    startAt: "2026-02-18",
    dueAt: "2026-06-15",
    address: "苏州市工业园区生物医药产业园 C3",
    region: "江苏·苏州",
    tags: ["装饰", "洁净"],
  },
  {
    id: "p3",
    code: "PRJ-2026-003",
    name: "极光新能源充电站电气安装",
    client: "极光新能源科技公司",
    crew: "恒通安装队",
    owner: "高敏",
    stage: "施工",
    status: "进行中",
    progress: 45,
    contractAmount: 980000,
    startAt: "2026-04-02",
    dueAt: "2026-06-30",
    address: "宁波市鄞州区智慧产业园",
    region: "浙江·宁波",
    tags: ["电气", "新能源"],
  },
  {
    id: "p4",
    code: "PRJ-2026-004",
    name: "晨光商业综合体暖通工程",
    client: "晨光置业集团",
    crew: "远大暖通队",
    owner: "苏建国",
    stage: "进场",
    status: "进行中",
    progress: 22,
    contractAmount: 3260000,
    startAt: "2026-05-08",
    dueAt: "2026-09-10",
    address: "南京市建邺区江东中路 200 号",
    region: "江苏·南京",
    tags: ["暖通", "大型"],
  },
  {
    id: "p5",
    code: "PRJ-2026-005",
    name: "知行教育实验楼弱电智能化",
    client: "知行教育科技公司",
    crew: "恒通安装队",
    owner: "李韬",
    stage: "报价",
    status: "待开工",
    progress: 0,
    contractAmount: 760000,
    startAt: "2026-06-20",
    dueAt: "2026-08-30",
    address: "合肥市高新区创新大道 99 号",
    region: "安徽·合肥",
    tags: ["弱电", "智能化"],
  },
  {
    id: "p6",
    code: "PRJ-2026-006",
    name: "绿野农业冷链仓储制冷工程",
    client: "绿野农业发展公司",
    crew: "远大暖通队",
    owner: "陈工",
    stage: "结算",
    status: "已完工",
    progress: 100,
    contractAmount: 1520000,
    startAt: "2026-01-12",
    dueAt: "2026-04-28",
    address: "潍坊市寿光蔬菜物流园",
    region: "山东·潍坊",
    tags: ["制冷", "冷链"],
  },
  {
    id: "p7",
    code: "PRJ-2026-007",
    name: "和裕酒店中央空调改造",
    client: "和裕酒店管理公司",
    crew: "远大暖通队",
    owner: "周磊",
    stage: "结算",
    status: "已结算",
    progress: 100,
    contractAmount: 640000,
    startAt: "2025-12-05",
    dueAt: "2026-03-10",
    address: "上海市黄浦区南京东路 358 号",
    region: "上海",
    tags: ["空调", "改造"],
  },
  {
    id: "p8",
    code: "PRJ-2026-008",
    name: "星海广场景观照明工程",
    client: "星海文旅投资公司",
    crew: "建发土建队",
    owner: "高敏",
    stage: "勘测",
    status: "待开工",
    progress: 0,
    contractAmount: 1180000,
    startAt: "2026-06-25",
    dueAt: "2026-09-30",
    address: "大连市沙河口区星海广场",
    region: "辽宁·大连",
    tags: ["照明", "景观"],
  },
];

const STAGE_LABELS: Record<string, string> = {
  勘测: "现场勘测",
  报价: "报价确认",
  进场: "进场交底",
  施工: "主体施工",
  验收: "竣工验收",
  结算: "结算开票",
};

/** 由项目 stage/进度推导里程碑（已过阶段给 doneAt，当前阶段进行中）。 */
export function milestonesFor(p: Project): Milestone[] {
  const order: Project["stage"][] = ["勘测", "报价", "进场", "施工", "验收", "结算"];
  const curIdx = order.indexOf(p.stage);
  // 在 startAt..dueAt 之间均匀铺计划日期。
  const startMs = Date.parse(`${p.startAt}T00:00:00Z`);
  const dueMs = Date.parse(`${p.dueAt}T00:00:00Z`);
  const span = (dueMs - startMs) / (order.length - 1);
  return order.map((stage, i) => {
    const planned = new Date(startMs + span * i).toISOString().slice(0, 10);
    const done = i < curIdx || (i === curIdx && p.status !== "待开工");
    return {
      stage,
      label: STAGE_LABELS[stage] ?? stage,
      plannedAt: planned,
      doneAt: i < curIdx ? planned : done && i === curIdx ? undefined : undefined,
    };
  });
}

export function projectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

// 项目动态（取前几个在建项目做密集流水，详情页 Timeline 用）。
export const projectEvents: ProjectEvent[] = [
  { id: "e1", projectId: "p1", at: "2026-06-03 14:20", type: "照片", text: "上传 3 张冷冻机房管道安装照片", by: "鸿基机电班组" },
  { id: "e2", projectId: "p1", at: "2026-06-01 09:10", type: "里程碑", text: "桥架敷设完成，进入设备就位阶段", by: "陈工" },
  { id: "e3", projectId: "p1", at: "2026-05-20 16:40", type: "回款", text: "收到第二期进度款 ¥858,000", by: "财务" },
  { id: "e4", projectId: "p1", at: "2026-05-06 11:00", type: "开票", text: "开具增值税专用发票 INV-2026-002", by: "财务" },
  { id: "e5", projectId: "p1", at: "2026-03-12 10:30", type: "报价", text: "报价单 QT-2026-001 经甲方确认", by: "陈工" },
  { id: "e6", projectId: "p2", at: "2026-06-02 15:00", type: "里程碑", text: "洁净度检测通过，准备竣工验收", by: "周磊" },
  { id: "e7", projectId: "p2", at: "2026-05-28 13:20", type: "照片", text: "上传 5 张吊顶高效送风口验收照片", by: "金顶装饰队" },
  { id: "e8", projectId: "p3", at: "2026-06-03 10:05", type: "备注", text: "现场记录配电箱接地隐患待整改", by: "高敏" },
  { id: "e9", projectId: "p4", at: "2026-05-09 08:50", type: "里程碑", text: "完成进场交底，材料分批进场", by: "苏建国" },
];

export function eventsFor(projectId: string): ProjectEvent[] {
  return projectEvents.filter((e) => e.projectId === projectId);
}

// 施工排期（Gantt 用），给前几个项目编排工序。
export const schedules: ScheduleTask[] = [
  { id: "s1", projectId: "p1", name: "现场勘测", start: "2026-03-10", end: "2026-03-16", progress: 100, group: "前期" },
  { id: "s2", projectId: "p1", name: "深化设计与报价", start: "2026-03-14", end: "2026-03-28", progress: 100, group: "前期" },
  { id: "s3", projectId: "p1", name: "桥架与管线敷设", start: "2026-03-30", end: "2026-05-10", progress: 100, group: "施工" },
  { id: "s4", projectId: "p1", name: "设备就位安装", start: "2026-05-08", end: "2026-06-20", progress: 55, group: "施工" },
  { id: "s5", projectId: "p1", name: "系统调试", start: "2026-06-18", end: "2026-07-08", progress: 0, group: "施工" },
  { id: "s6", projectId: "p1", name: "竣工验收与结算", start: "2026-07-06", end: "2026-07-20", progress: 0, group: "收尾" },
];

export function scheduleFor(projectId: string): ScheduleTask[] {
  return schedules.filter((s) => s.projectId === projectId);
}
