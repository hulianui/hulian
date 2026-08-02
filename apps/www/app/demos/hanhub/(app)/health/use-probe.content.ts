import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "justNow": "刚刚",
    "okDelayIsHigh": "200 OK · 延迟偏高",
  },
  en: {
    "justNow": "just now",
    "okDelayIsHigh": "200 OK · Delay is high",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-app-health-use-probe",
  content: t(content),
};

export default dictionary;
