import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "coral": "瑚",
    "hulianCustomerService": "瑚琏客服",
    "coral2": "瑚",
    "switchToBrightColors": "切换到亮色",
    "switchToDark": "切换到暗色",
    "agentStatus": "坐席状态",
    "online": "在线",
    "busy": "忙碌",
    "break": "小休",
  },
  en: {
    "coral": "Hulian",
    "hulianCustomerService": "Hulian Support",
    "coral2": "Hulian",
    "switchToBrightColors": "Switch to light theme",
    "switchToDark": "Switch to dark theme",
    "agentStatus": "Agent status",
    "online": "Online",
    "busy": "Busy",
    "break": "Break",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-cs-shell",
  content: t(content),
};

export default dictionary;
