import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    goLive: "开播",
    liveConsole: "直播中控",
    operations: "运营",
    shoppingPanel: "小黄车",
    performanceReview: "数据复盘",
  },
  en: {
    goLive: "Go live",
    liveConsole: "Live console",
    operations: "Operations",
    shoppingPanel: "Shopping panel",
    performanceReview: "Performance review",
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
  key: "demo-live-components-nav-config",
  content: t(content),
};

export default dictionary;
