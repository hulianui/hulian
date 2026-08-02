import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "serious": "严重",
    "important": "重要",
    "secondary": "次要",
    "tip": "提示",
    "recommendationsHaveBeenAdopted": "已采纳建议",
    "valueValueModificationSuggestionsHaveBeenWritten": "{0}:{1} 的修改建议已写入工作区。",
    "resubmittedForReview": "已重新提交审查",
    "reExamin": "重新审查",
    "forcedMergeBypassAccessControl": "已强制合并（绕过门禁）",
    "merged": "已合并",
    "thisMergerBypassedAccessControlBlockingAnd": "本次合并跳过了门禁阻断，已记入审计日志。",
    "valueAlreadyIn": "{0} 已合入。",
    "forcedMerger": "强制合并",
    "merged2": "合并",
    "theGateWasBlockedAndBlocked": "门禁阻断",
    "accessControlPassed": "门禁通过",
    "qualityPoints": "质量分",
    "coverageRate": "· 覆盖率",
    "seriousIssueCanBeSafelyMerged": "% · 严重问题 0，可安全合并。",
    "editFiles": "改动文件",
    "thereWereNoDocumentChangesDuringThis": "本次审查无文件改动。",
    "aiReviewProcess": "AI 审查过程",
    "qualityPoints2": "质量分",
    "summaryOfIssues": "问题汇总",
    "leadReviewerModel": "主审模型",
    "codeCoverage": "代码覆盖率",
    "thisTimeTheCost": "本次成本",
    "reviewThePlan": "审查计划",
  },
  en: {
    "serious": "Serious",
    "important": "Important",
    "secondary": "Secondary",
    "tip": "Tip",
    "recommendationsHaveBeenAdopted": "Suggestion applied",
    "valueValueModificationSuggestionsHaveBeenWritten": "The suggested change for {0}:{1} was written to the workspace.",
    "resubmittedForReview": "Resubmitted for review",
    "reExamin": "Run review again",
    "forcedMergeBypassAccessControl": "Force merge (bypass quality gate)",
    "merged": "Merged",
    "thisMergerBypassedAccessControlBlockingAnd": "This merge bypassed a blocking quality gate and was recorded in the audit log.",
    "valueAlreadyIn": "Already merged into {0}.",
    "forcedMerger": "Force merge",
    "merged2": "Merged",
    "theGateWasBlockedAndBlocked": "Quality gate blocked",
    "accessControlPassed": "Quality gate passed",
    "qualityPoints": "Quality score",
    "coverageRate": "· Coverage rate",
    "seriousIssueCanBeSafelyMerged": "% · 0 critical findings; safe to merge.",
    "editFiles": "Changed files",
    "thereWereNoDocumentChangesDuringThis": "This review has no changed files.",
    "aiReviewProcess": "AI review process",
    "qualityPoints2": "Quality score",
    "summaryOfIssues": "Summary of issues",
    "leadReviewerModel": "Lead reviewer model",
    "codeCoverage": "Code coverage",
    "thisTimeTheCost": "Review cost",
    "reviewThePlan": "Review the plan",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-components-review-detail",
  content: t(content),
};

export default dictionary;
