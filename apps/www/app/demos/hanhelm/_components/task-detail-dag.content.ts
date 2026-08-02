import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "pendingExecution": "待执行",
    "inExecution": "执行中",
    "downgrading": "降级中",
    "failure": "失败",
    "done": "完成",
    "text": "文本",
    "code": "代码",
    "image": "图像",
    "translation": "翻译",
    "search": "检索",
    "extract": "抽取",
    "review": "审核",
    "arrangement": "编排",
    "input": "输入",
    "output": "输出",
  },
  en: {
    "pendingExecution": "Pending execution",
    "inExecution": "Running",
    "downgrading": "Using fallback",
    "failure": "Failed",
    "done": "Done",
    "text": "Text",
    "code": "Code",
    "image": "Image",
    "translation": "Translation",
    "search": "Search",
    "extract": "Extraction",
    "review": "Review",
    "arrangement": "Orchestration",
    "input": "Input",
    "output": "Output",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-task-detail-dag",
  content: t(content),
};

export default dictionary;
