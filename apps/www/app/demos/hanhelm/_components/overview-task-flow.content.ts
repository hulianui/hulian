import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "inLine": "排队中",
    "inExecution": "执行中",
    "completed": "已完成",
    "failure": "失败",
    "theAppointedTimeApproached": "临期",
    "assignIt": "· 派给",
  },
  en: {
    "inLine": "In line",
    "inExecution": "In execution",
    "completed": "Completed",
    "failure": "Failure",
    "theAppointedTimeApproached": "SLA deadline approaching",
    "assignIt": "· Assign it",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-overview-task-flow",
  content: t(content),
};

export default dictionary;
