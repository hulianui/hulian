import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "allOfThem": "全部",
    "underReview": "审查中",
    "blocked": "已阻断",
    "passed": "已通过",
    "done": "完成",
    "underReview2": "审查中",
    "failure": "失败",
    "queue": "排队",
    "serious": "严重",
    "important": "重要",
    "secondary": "次要",
    "tip": "提示",
    "warehouse": "仓库",
    "title": "标题",
    "author": "作者",
    "scaleOfChanges": "改动规模",
    "aiStatus": "AI 状态",
    "qualityPoints": "质量分",
    "numberOfQuestions": "问题数",
    "none": "无",
    "gateControl": "门禁",
    "pass": "通过",
    "blocking": "阻断",
    "leadReviewerModel": "主审模型",
    "operation": "操作",
    "seeDetails": "查看详情",
    "reviewStatusScreening": "审查状态筛选",
    "queueReview": "审查队列",
    "warehouse2": "仓库",
    "allWarehouses": "全部仓库",
    "keywords": "关键词",
    "titleBranchAuthor": "标题 / 分支 / 作者",
  },
  en: {
    "allOfThem": "All",
    "underReview": "Under review",
    "blocked": "Blocked",
    "passed": "Passed",
    "done": "Done",
    "underReview2": "Under review",
    "failure": "Failed",
    "queue": "Queued",
    "serious": "Critical",
    "important": "Major",
    "secondary": "Minor",
    "tip": "Info",
    "warehouse": "Repository",
    "title": "Title",
    "author": "Author",
    "scaleOfChanges": "Scale of changes",
    "aiStatus": "AI status",
    "qualityPoints": "Quality score",
    "numberOfQuestions": "Findings",
    "none": "None",
    "gateControl": "Quality gate",
    "pass": "Pass",
    "blocking": "Blocking",
    "leadReviewerModel": "Lead reviewer model",
    "operation": "Operation",
    "seeDetails": "See details",
    "reviewStatusScreening": "Filter by review status",
    "queueReview": "Review queue",
    "warehouse2": "Repository",
    "allWarehouses": "All repositories",
    "keywords": "Keywords",
    "titleBranchAuthor": "Title / Branch / Author",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-app-reviews-page",
  content: t(content),
};

export default dictionary;
