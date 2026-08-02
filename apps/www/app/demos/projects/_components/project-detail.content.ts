import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "projectDoesNotExist": "项目不存在",
    "theProjectMayHaveBeenDeletedDemo": "该项目可能已被删除（demo 内存态，刷新还原）。",
    "returnToProjectList": "返回项目列表",
    "completeValue": "完成 {0}",
    "planValue": "计划 {0}",
    "return": "返回",
    "contractIssuingPartyA": "发包甲方",
    "takingOverTheTeam": "承接班组",
    "projectLeader": "项目负责人",
    "contractAmount": "合同额",
    "startDate": "开工日期",
    "plannedCompletion": "计划竣工",
    "projectAddress": "项目地址",
    "currentProgress": "当前进度",
    "projectMilestones": "项目里程碑",
    "constructionSchedule": "施工排期",
    "weeklyViewProgressFilling": "周视图 · 进度填充",
    "noScheduleYet": "暂无排期",
    "projectNews": "项目动态",
    "noNewsYet": "暂无动态",
    "relatedDocuments": "关联单据",
    "quotation": "报价单",
    "invoice": "发票",
    "workPhotos": "工作照片",
  },
  en: {
    "projectDoesNotExist": "Project does not exist",
    "theProjectMayHaveBeenDeletedDemo": "The project may have been deleted (stored in memory for this demo; reload to restore).",
    "returnToProjectList": "Return to project list",
    "completeValue": "Complete {0}",
    "planValue": "Plan {0}",
    "return": "Return",
    "contractIssuingPartyA": "Contracting client",
    "takingOverTheTeam": "Taking over the team",
    "projectLeader": "Project leader",
    "contractAmount": "Contract amount",
    "startDate": "Start date",
    "plannedCompletion": "Planned completion",
    "projectAddress": "Project address",
    "currentProgress": "Current progress",
    "projectMilestones": "Project Milestones",
    "constructionSchedule": "Construction schedule",
    "weeklyViewProgressFilling": "Weekly view · Progress filling",
    "noScheduleYet": "No schedule yet",
    "projectNews": "Project news",
    "noNewsYet": "No news yet",
    "relatedDocuments": "Related documents",
    "quotation": "quote",
    "invoice": "invoice",
    "workPhotos": "work photos",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-components-project-detail",
  content: t(content),
};

export default dictionary;
