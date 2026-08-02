import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "completed": "已完成",
    "underReview": "审查中",
    "failure": "失败",
    "inLine": "排队中",
    "serious": "严重",
    "important": "重要",
    "secondary": "次要",
    "tip": "提示",
    "overview": "概览",
    "aiCodeReviewStatusAsOf": "AI 代码审查态势 · 截至 06-05 14:30",
    "ofTheAiReviewBudgetHasAlready": "AI 审查预算本月已使用 64%，按当前节奏预计月底用满，可在「路由策略」中下调高价模型权重。",
    "numberOfReviewsThisWeek": "本周审查数",
    "averageMassScore": "平均质量分",
    "issuesToBeAddressed": "待处理问题",
    "accessControlClearanceRate": "门禁通过率",
    "qualityTrendNearlyDays": "质量分趋势 · 近 30 日",
    "maximumScore": "满分 100",
    "qualityPoints": "质量分",
    "distributionOfProblemSeverity": "问题严重度分布",
    "codeHotspotsModulesWeeks": "代码热点（模块 × 周）",
    "theHigherTheValueTheMoreNumerous": "数值越高问题越密集",
    "valueValueValueQuestions": "{0} · {1}：{2} 个问题",
    "aiReviewCostsThisMonth": "AI 审查成本（本月）",
    "times": "次",
    "recentReview": "最近审查",
    "viewAll": "查看全部",
    "points": "分",
    "pass": "通过",
    "blocking": "阻断",
  },
  en: {
    "completed": "Completed",
    "underReview": "Under review",
    "failure": "Failed",
    "inLine": "Queued",
    "serious": "Critical",
    "important": "Major",
    "secondary": "Minor",
    "tip": "Info",
    "overview": "Overview",
    "aiCodeReviewStatusAsOf": "AI code review status · As of June 5, 14:30",
    "ofTheAiReviewBudgetHasAlready": "64% of this month's AI review budget has been used. At the current rate, it will be exhausted before month-end. Reduce the weight of higher-cost models in Routing strategy.",
    "numberOfReviewsThisWeek": "Reviews this week",
    "averageMassScore": "Average quality score",
    "issuesToBeAddressed": "Open findings",
    "accessControlClearanceRate": "Gate pass rate",
    "qualityTrendNearlyDays": "Quality trend · Last 30 days",
    "maximumScore": "Maximum score: 100",
    "qualityPoints": "Quality points",
    "distributionOfProblemSeverity": "Distribution of problem severity",
    "codeHotspotsModulesWeeks": "Code hotspots (modules × weeks)",
    "theHigherTheValueTheMoreNumerous": "Higher values indicate more findings",
    "valueValueValueQuestions": "{0} · {1}: {2} findings",
    "aiReviewCostsThisMonth": "AI review costs (this month)",
    "times": "Reviews",
    "recentReview": "Recent review",
    "viewAll": "View all",
    "points": "Points",
    "pass": "Pass",
    "blocking": "Blocking",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-app-page",
  content: t(content),
};

export default dictionary;
