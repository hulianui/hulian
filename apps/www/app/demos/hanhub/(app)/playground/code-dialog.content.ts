import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "viewAsCode": "查看为代码",
    "convertTheCurrentModelParametersAndSession": "把当前模型、参数与会话消息一键转为可运行的接入片段",
  },
  en: {
    "viewAsCode": "view as code",
    "convertTheCurrentModelParametersAndSession": "Convert the current model, parameters and session messages into runnable access fragments with one click",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-app-playground-code-dialog",
  content: t(content),
};

export default dictionary;
