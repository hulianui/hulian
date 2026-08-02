import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "p0Emergency": "P0 紧急",
    "p1IsHigh": "P1 高",
    "p2IsAverage": "P2 普通",
    "p3IsLow": "P3 低",
    "depth": "深度",
    "equal": "均等",
    "onTheRoad": "在途",
  },
  en: {
    "p0Emergency": "P0 Emergency",
    "p1IsHigh": "P1 is high",
    "p2IsAverage": "P2 is average",
    "p3IsLow": "P3 is low",
    "depth": "Depth",
    "equal": "Equal",
    "onTheRoad": "On the road",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-queue-board",
  content: t(content),
};

export default dictionary;
