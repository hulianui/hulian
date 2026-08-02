import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "overview": "概览",
    "modelMarket": "模型市场",
    "usageLog": "用量日志",
    "billedRecharge": "计费充值",
    "healthDetection": "健康探测",
    "apiKey": "API 密钥",
    "accessSettings": "接入设置",
    "overview2": "概览",
    "modelingAndDebugging": "模型与调试",
    "modelMarket2": "模型市场",
    "usageAndBilling": "用量与计费",
    "usageLog2": "用量日志",
    "billedRecharge2": "计费充值",
    "gatewayOperationAndMaintenance": "网关运维",
    "healthDetection2": "健康探测",
    "apiKey2": "API 密钥",
    "accessSettings2": "接入设置",
  },
  en: {
    "overview": "Overview",
    "modelMarket": "model market",
    "usageLog": "Usage log",
    "billedRecharge": "Billed recharge",
    "healthDetection": "Health detection",
    "apiKey": "API key",
    "accessSettings": "Access settings",
    "overview2": "Overview",
    "modelingAndDebugging": "Modeling and Debugging",
    "modelMarket2": "model market",
    "usageAndBilling": "Usage and billing",
    "usageLog2": "Usage log",
    "billedRecharge2": "Billed recharge",
    "gatewayOperationAndMaintenance": "Gateway operation and maintenance",
    "healthDetection2": "Health detection",
    "apiKey2": "API key",
    "accessSettings2": "Access settings",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-components-nav-config",
  content: t(content),
};

export default dictionary;
