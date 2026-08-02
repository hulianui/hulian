import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "serious": "严重",
    "important": "重要",
    "secondary": "次要",
    "tips": "提示",
    "defects": "缺陷",
    "safe": "安全",
    "performance": "性能",
    "style": "风格",
    "complexity": "复杂度",
    "test": "测试",
    "pending": "待处理",
    "fixed": "已修",
    "ignored": "已忽略",
    "falsePositive": "误报",
    "markedValue": "已标记为「{0}」",
    "level": "级别",
    "type": "类型",
    "rules": "规则",
    "fileLine": "文件:行",
    "belongingReview": "所属审查",
    "status": "状态",
    "firstAppearance": "首次出现",
    "view": "查看",
    "problemCenter": "问题中心",
    "allLevels": "全部级别",
    "allTypes": "全部类型",
    "allWarehouses": "全部仓库",
    "allStatus": "全部状态",
    "markedAsModified": "标记已修",
    "ignore": "忽略",
    "falsePositives": "标误报",
    "close": "关闭",
    "problemDescription": "问题描述",
    "problemCode": "问题代码",
    "suggestedFix": "建议修复",
  },
  en: {
    "serious": "serious",
    "important": "important",
    "secondary": "Secondary",
    "tips": "Tips",
    "defects": "Defects",
    "safe": "safe",
    "performance": "Performance",
    "style": "style",
    "complexity": "complexity",
    "test": "test",
    "pending": "Pending",
    "fixed": "Fixed",
    "ignored": "Ignored",
    "falsePositive": "False positive",
    "markedValue": "Marked '{0}'",
    "level": "level",
    "type": "Type",
    "rules": "rules",
    "fileLine": "file:line",
    "belongingReview": "Belonging review",
    "status": "Status",
    "firstAppearance": "first appearance",
    "view": "View",
    "problemCenter": "problem center",
    "allLevels": "All levels",
    "allTypes": "All types",
    "allWarehouses": "All repositories",
    "allStatus": "All status",
    "markedAsModified": "Marked as modified",
    "ignore": "ignore",
    "falsePositives": "False positives",
    "close": "close",
    "problemDescription": "Problem description",
    "problemCode": "problem code",
    "suggestedFix": "Suggested fix",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-app-findings-page",
  content: t(content),
};

export default dictionary;
