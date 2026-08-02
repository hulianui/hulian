import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    timeline: "时间线",
    fromTheFirstLineOfCodeToFullTimeIndependence: "从写下第一行代码到全职独立",
    notACarefullyPlannedPathButATrailOfIdeasIWantedToUseMyself: "不是一条规划好的路，而是一连串「想自己用」的念头串起来的轨迹。",
    moreIsOnTheWay: "还有更多正在路上 …",
  },
  en: {
    timeline: "Timeline",
    fromTheFirstLineOfCodeToFullTimeIndependence: "From the first line of code to full-time independence",
    notACarefullyPlannedPathButATrailOfIdeasIWantedToUseMyself: "Not a carefully planned path, but a trail of ideas I wanted to use myself.",
    moreIsOnTheWay: "More is on the way...",
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
  key: "demo-personal-components-sections-journey",
  content: t(content),
};

export default dictionary;
