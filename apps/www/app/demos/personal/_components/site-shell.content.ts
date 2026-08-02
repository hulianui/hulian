import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    work: "作品",
    about: "关于",
    journey: "历程",
    guestbook: "留言板",
    lin: "林",
    contactMe: "联系我",
    thisSiteIsBuiltEntirelyWithAllPeopleAndProductsAreFictional: "本站 100% 由 @hulianui/ui 搭建，人物与产品均为虚构。",
    backToDemos: "返回示例库",
  },
  en: {
    work: "Work",
    about: "About",
    journey: "Journey",
    guestbook: "Guestbook",
    lin: "Lin",
    contactMe: "Contact me",
    thisSiteIsBuiltEntirelyWithAllPeopleAndProductsAreFictional: "This site is built entirely with @hulianui/ui. All people and products are fictional.",
    backToDemos: "Back to demos",
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
  key: "demo-personal-components-site-shell",
  content: t(content),
};

export default dictionary;
