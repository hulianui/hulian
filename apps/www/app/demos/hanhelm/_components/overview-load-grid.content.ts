import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "health": "健康",
    "downgrade": "降级",
    "offline": "离线",
    "surplus": "富余",
    "moderate": "适中",
    "relativelyHigh": "偏高",
    "saturated": "饱和",
    "model": "模型",
    "currentLoad": "当前负载",
    "andIssuedThemSimultaneously": "并发",
  },
  en: {
    "health": "Health",
    "downgrade": "Downgrade",
    "offline": "Offline",
    "surplus": "Surplus",
    "moderate": "Moderate",
    "relativelyHigh": "Relatively high",
    "saturated": "Saturated",
    "model": "Model",
    "currentLoad": "Current load",
    "andIssuedThemSimultaneously": "and issued them simultaneously",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-overview-load-grid",
  content: t(content),
};

export default dictionary;
