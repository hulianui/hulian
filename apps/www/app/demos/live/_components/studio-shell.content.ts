import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    han: "瀚",
    hanlive: "瀚播 HanLive",
    live021408: "直播中 · 02:14:08",
    audienceRoom: "观众端",
    switchToLightTheme: "切换到亮色",
    switchToDarkTheme: "切换到暗色",
    anan: "阿楠",
    commerceHost: "带货主播",
    a: "楠",
  },
  en: {
    han: "Han",
    hanlive: "HanLive",
    live021408: "Live · 02:14:08",
    audienceRoom: "Audience room",
    switchToLightTheme: "Switch to light theme",
    switchToDarkTheme: "Switch to dark theme",
    anan: "Anan",
    commerceHost: "Commerce host",
    a: "A",
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
  key: "demo-live-components-studio-shell",
  content: t(content),
};

export default dictionary;
