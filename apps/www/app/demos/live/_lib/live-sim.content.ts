import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    welcomeToHanselectLiveShopResponsiblyAndKeepTheChatRespectful: "欢迎来到瀚选直播间，理性消费，文明发言~",
    me: "我",
    host: "主播",
  },
  en: {
    welcomeToHanselectLiveShopResponsiblyAndKeepTheChatRespectful: "Welcome to HanSelect Live. Shop responsibly and keep the chat respectful.",
    me: "me",
    host: "Host",
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
  key: "demo-live-lib-live-sim",
  content: t(content),
};

export default dictionary;
