import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    trafficRatioByRegion: "流量占比 · 按大区",
    networkWideQPS24hTimesSecond: "全网 QPS · 24h（万次/秒）",
    request: "请求",
    hit: "命中",
    regionalBandwidthComparisonGbps: "区域带宽对比（Gbps）",
    bandwidth: "带宽",
    bandwidthTrendsByRegionStackingGbps: "各大区带宽趋势 · 堆叠（Gbps）",
    asiaPacific: "亚太",
    northAmerica: "北美",
    europe: "欧洲",
  },
  en: {
    trafficRatioByRegion: "Traffic share by region",
    networkWideQPS24hTimesSecond: "Global QPS · Last 24 hours (10k requests/s)",
    request: "Requests",
    hit: "Cache hits",
    regionalBandwidthComparisonGbps: "Bandwidth by region (Gbps)",
    bandwidth: "Bandwidth",
    bandwidthTrendsByRegionStackingGbps: "Regional bandwidth trend · Stacked (Gbps)",
    asiaPacific: "Asia-Pacific",
    northAmerica: "North America",
    europe: "Europe",
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
  key: "demo-dashboard-components-chart-stack",
  content: t(content),
};

export default dictionary;
