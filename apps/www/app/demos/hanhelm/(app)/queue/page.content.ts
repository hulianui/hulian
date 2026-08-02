import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "allOfThem": "全部",
    "inLine": "排队中",
    "inExecution": "执行中",
    "theAppointedTimeApproached": "临期",
    "failure": "失败",
    "fullCapacity": "全部能力",
    "allPriorities": "全部优先级",
    "allTheStates": "全部状态",
    "mission": "任务",
    "ability": "能力",
    "priority": "优先级",
    "status": "状态",
    "assignIt": "派给",
    "wait": "等待",
    "cost": "成本",
    "operation": "操作",
    "seeDetails": "查看详情",
    "swimlaneBoardView": "泳道板视图",
    "swimLaneBoard": "泳道板",
    "listView": "列表视图",
    "list": "列表",
    "taskQueue": "任务队列",
    "priorityLaneQueueBoardListViewReal": "优先级泳道队列板 ⇄ 列表视图 · 队列深度 / 平均等待 / SLA 倒计时实时监视",
    "together": "共",
    "tasksAreDistributedAcrossFourPriorityLanes": "个任务在四条优先级泳道",
    "taskList": "任务列表",
    "keywords": "关键词",
    "titleTypeAuthor": "标题 / 类型 / 提交人",
    "ability2": "能力",
    "priority2": "优先级",
    "status2": "状态",
  },
  en: {
    "allOfThem": "All of them",
    "inLine": "In line",
    "inExecution": "In execution",
    "theAppointedTimeApproached": "SLA deadline approaching",
    "failure": "Failure",
    "fullCapacity": "Full capacity",
    "allPriorities": "All priorities",
    "allTheStates": "All the states",
    "mission": "Task",
    "ability": "Ability",
    "priority": "Priority",
    "status": "Status",
    "assignIt": "Assign it",
    "wait": "Wait",
    "cost": "Cost",
    "operation": "Operation",
    "seeDetails": "See details",
    "swimlaneBoardView": "Swimlane board view",
    "swimLaneBoard": "Swim lane board",
    "listView": "List view",
    "list": "List",
    "taskQueue": "Task queue",
    "priorityLaneQueueBoardListViewReal": "Priority lane queue board ⇄ List view · Real-time monitoring of queue depth / average wait / SLA countdown",
    "together": "Together",
    "tasksAreDistributedAcrossFourPriorityLanes": "Tasks are distributed across four priority lanes",
    "taskList": "Task list",
    "keywords": "Keywords",
    "titleTypeAuthor": "Title / Type / Author",
    "ability2": "Ability",
    "priority2": "Priority",
    "status2": "Status",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-app-queue-page",
  content: t(content),
};

export default dictionary;
