import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "all": "全部",
    "project": "项目",
    "partyATeam": "甲方 / 班组",
    "personInCharge": "负责人",
    "stage": "阶段",
    "progress": "进度",
    "contractAmount": "合同额",
    "status": "状态",
    "plannedCompletion": "计划竣工",
    "operation": "操作",
    "view": "查看",
    "list": "列表",
    "kanban": "看板",
    "tryAgain": "重试",
    "projectTracking": "项目追踪",
    "projectTracking2": "项目追踪",
    "keywords": "关键词",
    "projectNoPartyA": "项目 / 编号 / 甲方",
    "stage2": "阶段",
    "status2": "状态",
    "personInCharge2": "负责人",
  },
  en: {
    "all": "All",
    "project": "Project",
    "partyATeam": "Client / team",
    "personInCharge": "person in charge",
    "stage": "stage",
    "progress": "Progress",
    "contractAmount": "Contract amount",
    "status": "Status",
    "plannedCompletion": "Planned completion",
    "operation": "Operation",
    "view": "View",
    "list": "list",
    "kanban": "Kanban",
    "tryAgain": "Try again",
    "projectTracking": "Project Tracking",
    "projectTracking2": "Project Tracking",
    "keywords": "keywords",
    "projectNoPartyA": "Project / ID / client",
    "stage2": "stage",
    "status2": "Status",
    "personInCharge2": "person in charge",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-app-tracking-page",
  content: t(content),
};

export default dictionary;
