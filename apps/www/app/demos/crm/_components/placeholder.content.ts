import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "valueUnderConstruction": "{0} · 建设中",
    "thisPageWillBeBuiltUsingThe": "该页面将在后续切片用 @hulianui/ui 组件搭建。",
  },
  en: {
    "valueUnderConstruction": "{0} · Under construction",
    "thisPageWillBeBuiltUsingThe": "This page will be built using the @hulianui/ui component in subsequent slicing.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-components-placeholder",
  content: t(content),
};

export default dictionary;
