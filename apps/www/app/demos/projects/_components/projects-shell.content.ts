import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "build": "筑",
    "hulianEngineeringCollaboration": "瑚琏 · 工程协同",
    "build2": "筑",
    "switchToBrightColors": "切换到亮色",
    "switchToDark": "切换到暗色",
    "notification": "通知",
    "chenGong": "陈工",
    "engineeringProjectManager": "工程项目经理",
    "chen": "陈",
  },
  en: {
    "build": "build",
    "hulianEngineeringCollaboration": "Hulian · Engineering Collaboration",
    "build2": "build",
    "switchToBrightColors": "switch to bright colors",
    "switchToDark": "switch to dark",
    "notification": "Notification",
    "chenGong": "Chen Gong",
    "engineeringProjectManager": "Engineering project manager",
    "chen": "Chen",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-components-projects-shell",
  content: t(content),
};

export default dictionary;
