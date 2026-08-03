import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    popNode: "· PoP 节点",
    nodeDetails: "节点详情",
    realTimeIndicatorDrillingDownDemoData: "实时指标下钻 · 演示数据",
    close: "关闭",
    realTimeBandwidth: "实时带宽",
    requestsSec: "请求/秒",
    averageDelay: "平均延迟",
    dayUptime: "30 天在线率",
    nodeLoad: "节点负载",
    recentQPSTrends: "近时 QPS 趋势",
    qpsThousandTimesSecond: "QPS（千次/秒）",
    nodeActivity: "节点动态",
    loadPercent: "负载 {0}%",
    currentStatus: "当前状态：{0}",
    latestExitDetectionDelay: "最近一次出口探测延迟",
    onlineRateReachedInTheLastDays: "近 30 天在线率达标",
    justNow: "刚刚",
    includedInTheGlobalRealTimeDispatchPool: "已纳入全球实时调度池",
  },
  en: {
    popNode: "· PoP node",
    nodeDetails: "Node details",
    realTimeIndicatorDrillingDownDemoData: "Live node metrics · Demo data",
    close: "Close",
    realTimeBandwidth: "Live bandwidth",
    requestsSec: "Requests/sec",
    averageDelay: "Average latency",
    dayUptime: "30-day uptime",
    nodeLoad: "Node load",
    recentQPSTrends: "Recent QPS trend",
    qpsThousandTimesSecond: "QPS (thousands of requests/s)",
    nodeActivity: "Node activity",
    loadPercent: "Load {0}%",
    currentStatus: "Current status: {0}",
    latestExitDetectionDelay: "Latest egress probe latency",
    onlineRateReachedInTheLastDays: "Met the 30-day uptime target",
    justNow: "Just now",
    includedInTheGlobalRealTimeDispatchPool: "Added to the global live routing pool",
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
  key: "demo-dashboard-components-node-drawer",
  content: t(content),
};

export default dictionary;
