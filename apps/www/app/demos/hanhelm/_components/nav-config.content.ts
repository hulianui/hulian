import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "overallDispatchOverview": "调度总览",
    "taskQueue": "任务队列",
    "intelligentRouting": "智能路由",
    "actuatorPool": "执行器池",
    "slaAlert": "SLA 告警",
    "setup": "设置",
    "missionDetails": "任务详情",
    "overallDispatchOverview2": "调度总览",
    "dispatch": "调度",
    "taskQueue2": "任务队列",
    "intelligentRouting2": "智能路由",
    "resources": "资源",
    "actuatorPool2": "执行器池",
    "operationsAndMaintenance": "运维",
    "slaAlert2": "SLA 告警",
    "setup2": "设置",
  },
  en: {
    "overallDispatchOverview": "Overall Dispatch Overview",
    "taskQueue": "Task queue",
    "intelligentRouting": "Intelligent routing",
    "actuatorPool": "Executor pool",
    "slaAlert": "SLA alert",
    "setup": "Setup",
    "missionDetails": "Task details",
    "overallDispatchOverview2": "Overall Dispatch Overview",
    "dispatch": "Dispatch",
    "taskQueue2": "Task queue",
    "intelligentRouting2": "Intelligent routing",
    "resources": "Resources",
    "actuatorPool2": "Executor pool",
    "operationsAndMaintenance": "Operations and maintenance",
    "slaAlert2": "SLA alert",
    "setup2": "Setup",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-nav-config",
  content: t(content),
};

export default dictionary;
