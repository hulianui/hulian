import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    aboutMe: "关于我",
    aMakerWhoTurnsPersonalPainPointsIntoProducts: "一个把自己的痒处做成产品的人",
    lin: "林",
  },
  en: {
    aboutMe: "About me",
    aMakerWhoTurnsPersonalPainPointsIntoProducts: "A maker who turns personal pain points into products",
    lin: "Lin",
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
  key: "demo-personal-components-sections-about",
  content: t(content),
};

export default dictionary;
