import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "aliTongyi": "阿里通义",
    "pass": "通",
    "darkSideOfTheMoon": "月之暗面",
    "glm": "智谱 GLM",
    "wisdom": "智",
    "dialogue": "对话",
    "reasoning": "推理",
    "vision": "视觉",
    "functionCall": "函数调用",
    "longContext": "长上下文",
  },
  en: {
    "aliTongyi": "Ali Tongyi",
    "pass": "pass",
    "darkSideOfTheMoon": "dark side of the moon",
    "glm": "GLM",
    "wisdom": "Wisdom",
    "dialogue": "dialogue",
    "reasoning": "reasoning",
    "vision": "Vision",
    "functionCall": "function call",
    "longContext": "long context",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-data-providers",
  content: t(content),
};

export default dictionary;
