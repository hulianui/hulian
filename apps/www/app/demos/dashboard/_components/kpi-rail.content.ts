import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    onlineNode: "在线节点",
    realTimeBandwidth: "实时带宽",
    networkWideRequests: "全网请求",
    tenThousandS: "万/s",
    averageDelay: "平均延迟",
    cacheHitRate: "缓存命中率",
    schedulingLink: "调度链路",
    strips: "条",
    coreMetrics: "核心指标",
    refreshEvery3s: "每 3s 刷新",
    globalLoad: "全局负载",
  },
  en: {
    onlineNode: "Online nodes",
    realTimeBandwidth: "Live bandwidth",
    networkWideRequests: "Network-wide requests",
    tenThousandS: "10k/s",
    averageDelay: "Average latency",
    cacheHitRate: "Cache hit rate",
    schedulingLink: "Routing links",
    strips: "links",
    coreMetrics: "Core metrics",
    refreshEvery3s: "Refreshes every 3s",
    globalLoad: "Global load",
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
  key: "demo-dashboard-components-kpi-rail",
  content: t(content),
};

export default dictionary;
