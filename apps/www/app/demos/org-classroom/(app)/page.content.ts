import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "组织总览",
    subtitle: "今天的在岗状态、部门分布与面试安排。所有数字都来自同一份工位数据。",
    weekLabel: "2026 年 11 月 16 日 · 周一",
    openFloor: "打开工位图",
    kpiPeople: "在册员工",
    kpiOnDuty: "当前在岗",
    kpiOccupancy: "工位使用率",
    kpiInterviews: "今日面试",
    kpiPeopleHint: "{0} 人待分配工位",
    onDutyDeltaLabel: "较昨日",
    kpiOccupancyHint: "{0} / {1} 个工位",
    kpiInterviewsHint: "{0} 场进行中",
    deptChartTitle: "部门在岗分布",
    deptChartDesc: "按状态堆叠，鼠标移到柱子上看细分。",
    todayInterviews: "今日面试",
    todayInterviewsDesc: "按开始时间排序",
    noInterviews: "今天没有面试安排",
    statusDistribution: "状态分布",
    statusDistributionDesc: "当前已入驻成员的在岗状态占比。",
    recentActivity: "最近动态",
    recentActivityDesc: "状态、工位与面试变更都会留痕。",
    viewAllInterviews: "全部面试",
    loadFailed: "总览加载失败",
    retry: "重试",
  },
  en: {
    title: "Organization overview",
    subtitle:
      "Today's presence, department mix and interview schedule. Every number comes from the same seat data.",
    weekLabel: "Monday, November 16, 2026",
    openFloor: "Open seat map",
    kpiPeople: "Employees",
    kpiOnDuty: "On duty",
    kpiOccupancy: "Seat occupancy",
    kpiInterviews: "Interviews today",
    kpiPeopleHint: "{0} waiting for a seat",
    onDutyDeltaLabel: "vs. yesterday",
    kpiOccupancyHint: "{0} / {1} seats",
    kpiInterviewsHint: "{0} in progress",
    deptChartTitle: "Presence by department",
    deptChartDesc: "Stacked by status. Hover a bar for the breakdown.",
    todayInterviews: "Today's interviews",
    todayInterviewsDesc: "Sorted by start time",
    noInterviews: "No interviews today",
    statusDistribution: "Status mix",
    statusDistributionDesc: "Share of seated members by current status.",
    recentActivity: "Recent activity",
    recentActivityDesc: "Status, seat and interview changes are all recorded.",
    viewAllInterviews: "All interviews",
    loadFailed: "Failed to load the overview",
    retry: "Retry",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-org-classroom-app-page",
  content: t(content),
};

export default dictionary;
