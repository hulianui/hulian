import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    today: "今天",
    yesterday: "昨天",
    withinSevenDays: "7 天内",
    weatherToday: "今天的天气",
    quickSortImplementation: "快速排序实现",
    whatIsAClosure: "闭包是什么",
    weeklyDraft: "周报草稿",
  },
  en: {
    today: "Today",
    yesterday: "Yesterday",
    withinSevenDays: "Previous 7 days",
    weatherToday: "Weather today",
    quickSortImplementation: "Implement quicksort",
    whatIsAClosure: "What is a closure?",
    weeklyDraft: "Weekly update draft",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-ai-chat-conversations",
  content: t(content),
};

export default dictionary;
