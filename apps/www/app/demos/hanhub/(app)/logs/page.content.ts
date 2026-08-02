import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "success": "成功",
    "error": "错误",
    "currentLimiting": "限流",
    "timeout": "超时",
    "all": "全部",
    "time": "时间",
    "model": "模型",
    "channel": "渠道",
    "key": "密钥",
    "status": "状态",
    "delay": "延迟",
    "cost": "花费",
    "operation": "操作",
    "details": "详情",
    "usageLog": "用量日志",
    "requestByRequestCallRecordClickDetails": "逐请求调用记录 · 点「详情」查看完整 request / response 与计费链路",
    "requestLog": "请求日志",
    "model2": "模型",
    "status2": "状态",
    "success2": "成功",
    "error2": "错误",
    "currentLimiting2": "限流",
    "timeout2": "超时",
    "key2": "密钥",
  },
  en: {
    "success": "success",
    "error": "Error",
    "currentLimiting": "Current limiting",
    "timeout": "timeout",
    "all": "All",
    "time": "time",
    "model": "model",
    "channel": "channel",
    "key": "key",
    "status": "Status",
    "delay": "delay",
    "cost": "cost",
    "operation": "Operation",
    "details": "Details",
    "usageLog": "Usage log",
    "requestByRequestCallRecordClickDetails": "Request-level call records · Open Details to inspect the full request, response, and billing trace.",
    "requestLog": "Request log",
    "model2": "model",
    "status2": "Status",
    "success2": "success",
    "error2": "Error",
    "currentLimiting2": "Current limiting",
    "timeout2": "timeout",
    "key2": "key",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-app-logs-page",
  content: t(content),
};

export default dictionary;
