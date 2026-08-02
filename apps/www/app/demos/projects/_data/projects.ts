import { copy } from "./projects.content";
import type { Milestone, Project, ProjectEvent, ScheduleTask } from "./types";

// 8 个工程项目，覆盖各阶段/状态，贯穿报价·开票·照片三模块的关联 ID。
export const projects: Project[] = [
  {
    id: "p1",
    code: "PRJ-2026-001",
    name: copy("yunqiDataCenterMechanicalAndElectricalInstallation"),
    client: copy("yunqiTechnologyCoLtd"),
    crew: copy("hongjiElectromechanicalTeam"),
    owner: copy("chenGong"),
    stage: "施工",
    status: "进行中",
    progress: 62,
    contractAmount: 2860000,
    startAt: "2026-03-10",
    dueAt: "2026-07-20",
    address: copy("noYunqiTownYuhangDistrictHangzhouCity"),
    region: copy("zhejiangHangzhou"),
    tags: [copy("electromechanical"), copy("keyProjects")],
  },
  {
    id: "p2",
    code: "PRJ-2026-002",
    name: copy("ruikangPharmaceuticalGmpCleanWorkshopDecorationProject"),
    client: copy("ruikangPharmaceuticalCoLtd"),
    crew: copy("goldenDomeDecorationTeam"),
    owner: copy("zhouLei"),
    stage: "验收",
    status: "进行中",
    progress: 88,
    contractAmount: 1740000,
    startAt: "2026-02-18",
    dueAt: "2026-06-15",
    address: copy("suzhouIndustrialParkBiomedicalIndustrialParkC3"),
    region: copy("jiangsuSuzhou"),
    tags: [copy("decoration"), copy("clean")],
  },
  {
    id: "p3",
    code: "PRJ-2026-003",
    name: copy("auroraNewEnergyChargingStationElectricalInstallation"),
    client: copy("auroraNewEnergyTechnologyCompany"),
    crew: copy("hengtongInstallationTeam"),
    owner: copy("highSensitivity"),
    stage: "施工",
    status: "进行中",
    progress: 45,
    contractAmount: 980000,
    startAt: "2026-04-02",
    dueAt: "2026-06-30",
    address: copy("ningboYinzhouDistrictSmartIndustrialPark"),
    region: copy("zhejiangNingbo"),
    tags: [copy("electrical"), copy("newEnergy")],
  },
  {
    id: "p4",
    code: "PRJ-2026-004",
    name: copy("chenguangCommercialComplexHeatingAndVentilationProject"),
    client: copy("chenguangRealEstateGroup"),
    crew: copy("yuandaHvacTeam"),
    owner: copy("suJianguo"),
    stage: "进场",
    status: "进行中",
    progress: 22,
    contractAmount: 3260000,
    startAt: "2026-05-08",
    dueAt: "2026-09-10",
    address: copy("noJiangdongMiddleRoadJianyeDistrictNanjing"),
    region: copy("jiangsuNanjing"),
    tags: [copy("hvac"), copy("large")],
  },
  {
    id: "p5",
    code: "PRJ-2026-005",
    name: copy("zhixingEducationExperimentalBuildingWeakCurrentIntelligentizatio"),
    client: copy("zhixingEducationTechnologyCompany"),
    crew: copy("hengtongInstallationTeam2"),
    owner: copy("liTao"),
    stage: "报价",
    status: "待开工",
    progress: 0,
    contractAmount: 760000,
    startAt: "2026-06-20",
    dueAt: "2026-08-30",
    address: copy("noInnovationAvenueHighTechZoneHefei"),
    region: copy("anhuiHefei"),
    tags: [copy("weakCurrent"), copy("intelligent")],
  },
  {
    id: "p6",
    code: "PRJ-2026-006",
    name: copy("greenfieldAgriculturalColdChainStorageAndRefrigeration"),
    client: copy("greenfieldAgriculturalDevelopmentCorp"),
    crew: copy("yuandaHvacTeam2"),
    owner: copy("chenGong2"),
    stage: "结算",
    status: "已完工",
    progress: 100,
    contractAmount: 1520000,
    startAt: "2026-01-12",
    dueAt: "2026-04-28",
    address: copy("weifangShouguangVegetableLogisticsPark"),
    region: copy("shandongWeifang"),
    tags: [copy("refrigeration"), copy("coldChain")],
  },
  {
    id: "p7",
    code: "PRJ-2026-007",
    name: copy("heyuHotelCentralAirConditioningRenovation"),
    client: copy("heyuHotelManagementCompany"),
    crew: copy("yuandaHvacTeam3"),
    owner: copy("zhouLei2"),
    stage: "结算",
    status: "已结算",
    progress: 100,
    contractAmount: 640000,
    startAt: "2025-12-05",
    dueAt: "2026-03-10",
    address: copy("noNanjingEastRoadHuangpuDistrictShanghai"),
    region: copy("shanghai"),
    tags: [copy("airConditioning"), copy("transformation")],
  },
  {
    id: "p8",
    code: "PRJ-2026-008",
    name: copy("xinghaiSquareLandscapeLightingProject"),
    client: copy("xinghaiCulturalTourismInvestmentCompany"),
    crew: copy("jianfaCivilEngineeringTeam"),
    owner: copy("highSensitivity2"),
    stage: "勘测",
    status: "待开工",
    progress: 0,
    contractAmount: 1180000,
    startAt: "2026-06-25",
    dueAt: "2026-09-30",
    address: copy("xinghaiPlazaShahekouDistrictDalianCity"),
    region: copy("liaoningDalian"),
    tags: [copy("lighting"), copy("landscape")],
  },
];

const STAGE_LABELS: Record<string, string> = {
  勘测: copy("siteSurvey"),
  报价: copy("quotationConfirmation"),
  进场: copy("enteringTheMarketToExplain"),
  施工: copy("mainConstruction"),
  验收: copy("completionAcceptance"),
  结算: copy("settlementAndInvoicing"),
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
  { id: "e1", projectId: "p1", at: "2026-06-03 14:20", type: "照片", text: copy("eventPhotoUpload"), by: copy("hongjiElectromechanicalTeam") },
  { id: "e2", projectId: "p1", at: "2026-06-01 09:10", type: "里程碑", text: copy("eventTrayInstalled"), by: copy("chenGong") },
  { id: "e3", projectId: "p1", at: "2026-05-20 16:40", type: "回款", text: copy("eventSecondPayment"), by: copy("finance") },
  { id: "e4", projectId: "p1", at: "2026-05-06 11:00", type: "开票", text: copy("eventInvoiceIssued"), by: copy("finance") },
  { id: "e5", projectId: "p1", at: "2026-03-12 10:30", type: "报价", text: copy("eventQuoteAccepted"), by: copy("chenGong") },
  { id: "e6", projectId: "p2", at: "2026-06-02 15:00", type: "里程碑", text: copy("eventCleanlinessPassed"), by: copy("zhouLei") },
  { id: "e7", projectId: "p2", at: "2026-05-28 13:20", type: "照片", text: copy("eventVentPhotos"), by: copy("goldenDomeDecorationTeam") },
  { id: "e8", projectId: "p3", at: "2026-06-03 10:05", type: "备注", text: copy("eventGroundingIssue"), by: copy("highSensitivity") },
  { id: "e9", projectId: "p4", at: "2026-05-09 08:50", type: "里程碑", text: copy("eventSiteBriefing"), by: copy("suJianguo") },
];

export function eventsFor(projectId: string): ProjectEvent[] {
  return projectEvents.filter((e) => e.projectId === projectId);
}

// 施工排期（Gantt 用），给前几个项目编排工序。
export const schedules: ScheduleTask[] = [
  { id: "s1", projectId: "p1", name: copy("siteSurvey2"), start: "2026-03-10", end: "2026-03-16", progress: 100, group: copy("earlyStage") },
  { id: "s2", projectId: "p1", name: copy("deepenDesignAndQuotation"), start: "2026-03-14", end: "2026-03-28", progress: 100, group: copy("earlyStage2") },
  { id: "s3", projectId: "p1", name: copy("bridgeAndPipelineLaying"), start: "2026-03-30", end: "2026-05-10", progress: 100, group: copy("construction4") },
  { id: "s4", projectId: "p1", name: copy("equipmentInstalledInPlace"), start: "2026-05-08", end: "2026-06-20", progress: 55, group: copy("construction5") },
  { id: "s5", projectId: "p1", name: copy("systemDebugging"), start: "2026-06-18", end: "2026-07-08", progress: 0, group: copy("construction6") },
  { id: "s6", projectId: "p1", name: copy("completionAcceptanceAndSettlement"), start: "2026-07-06", end: "2026-07-20", progress: 0, group: copy("finishing") },
];

export function scheduleFor(projectId: string): ScheduleTask[] {
  return schedules.filter((s) => s.projectId === projectId);
}
