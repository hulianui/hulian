import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    beijing: "北京",
    shanghai: "上海",
    tokyo: "东京",
    singapore: "新加坡",
    mumbai: "孟买",
    sydney: "悉尼",
    frankfurt: "法兰克福",
    london: "伦敦",
    newYork: "纽约",
    sanFrancisco: "旧金山",
    sOPaulo: "圣保罗",
    dubai: "迪拜",
    capeTown: "开普敦",
    asiaPacific: "亚太",
    northAmerica: "北美",
    europe: "欧洲",
    middleEast: "中东",
    southAmerica: "南美",
    africa: "非洲",
    thePacketLossRateAtTheTokyoNodeExitHas: "东京节点出口丢包率突增至 4.2%，已触发自动切流",
    frankfurtSOPauloLinkRTTRaisedTo218ms: "法兰克福 ↔ 圣保罗 链路 RTT 抬升至 218ms",
    singaporeComputerRoomExpansionCompletedNewEdgeNodesAreOnline:
      "新加坡机房扩容完成，新增 12 台边缘节点已上线",
    theWholeNetworkCertificateRotationTaskHasBeenCompletedCovering:
      "全网证书轮换任务已完成，覆盖 13 个区域",
    dubaiNodeCPULoadIsItIsRecommendedToDivert: "迪拜节点 CPU 负载达 86%，建议分流孟买",
    cacheHitRateInNorthAmericaRisesBackTo: "北美大区缓存命中率回升至 96.4%",
    schedulingPolicyVGrayscaleToTraffic: "调度策略 v2.7 已灰度至 30% 流量",
    sOPauloNodeHeartRateDelayOverThresholdDowngraded: "圣保罗节点心跳延迟超阈值，降级为只读",
    warning: "告警",
    busy: "繁忙",
    normal: "正常",
    critical: "严重",
    caution: "警告",
    notice: "提示",
    information: "信息",
  },
  en: {
    beijing: "Beijing",
    shanghai: "Shanghai",
    tokyo: "Tokyo",
    singapore: "Singapore",
    mumbai: "Mumbai",
    sydney: "Sydney",
    frankfurt: "Frankfurt",
    london: "London",
    newYork: "New York",
    sanFrancisco: "San Francisco",
    sOPaulo: "São Paulo",
    dubai: "Dubai",
    capeTown: "Cape Town",
    asiaPacific: "Asia-Pacific",
    northAmerica: "North America",
    europe: "Europe",
    middleEast: "Middle East",
    southAmerica: "South America",
    africa: "Africa",
    thePacketLossRateAtTheTokyoNodeExitHas:
      "Packet loss at the Tokyo node's egress rose to 4.2%, triggering automatic traffic failover.",
    frankfurtSOPauloLinkRTTRaisedTo218ms: "Frankfurt ↔ São Paulo link RTT increased to 218 ms",
    singaporeComputerRoomExpansionCompletedNewEdgeNodesAreOnline:
      "Singapore data center expansion complete; 12 new edge nodes are online",
    theWholeNetworkCertificateRotationTaskHasBeenCompletedCovering:
      "Global certificate rotation completed across 13 regions",
    dubaiNodeCPULoadIsItIsRecommendedToDivert:
      "Dubai node CPU load reached 86%; route overflow traffic to Mumbai",
    cacheHitRateInNorthAmericaRisesBackTo: "North America cache hit rate recovered to 96.4%",
    schedulingPolicyVGrayscaleToTraffic: "Routing policy v2.7 rolled out to 30% of traffic",
    sOPauloNodeHeartRateDelayOverThresholdDowngraded:
      "São Paulo node heartbeat latency exceeded the threshold; node set to read-only",
    warning: "Alert",
    busy: "Busy",
    normal: "Healthy",
    critical: "Critical",
    caution: "Caution",
    notice: "Notice",
    information: "Info",
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
  key: "demo-dashboard-data-snapshot",
  content: t(content),
};

export default dictionary;
