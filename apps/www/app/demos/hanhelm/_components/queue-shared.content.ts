import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "text": "文本",
    "code": "代码",
    "image": "图像",
    "translation": "翻译",
    "retrievalEnhancement": "检索增强",
    "structuralExtraction": "结构抽取",
    "contentReview": "内容审核",
    "multiAgentOrchestration": "多 Agent 编排",
    "inLine": "排队中",
    "inExecution": "执行中",
    "completed": "已完成",
    "failure": "失败",
    "theAppointedTimeApproached": "临期",
    "meetsTheStandard": "达标",
    "theAppointedTimeApproached2": "临期",
    "breachOfContract": "违约",
    "yuValue": "余 {0}",
    "superValue": "超 {0}",
  },
  en: {
    "text": "Text",
    "code": "Code",
    "image": "Image",
    "translation": "Translation",
    "retrievalEnhancement": "Retrieval enhancement",
    "structuralExtraction": "Structural extraction",
    "contentReview": "Content review",
    "multiAgentOrchestration": "Multi-agent orchestration",
    "inLine": "In line",
    "inExecution": "In execution",
    "completed": "Completed",
    "failure": "Failure",
    "theAppointedTimeApproached": "The appointed time approached",
    "meetsTheStandard": "Meets the standard",
    "theAppointedTimeApproached2": "The appointed time approached",
    "breachOfContract": "Breach of contract",
    "yuValue": "Yu {0}",
    "superValue": "Super {0}",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-queue-shared",
  content: t(content),
};

export default dictionary;
