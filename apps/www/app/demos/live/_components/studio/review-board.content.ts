import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    openAudienceRoom: "进入直播间",
    qualifiedViewers: "有效停留",
    engagedViewers: "参与互动",
    productClicks: "点击商品",
    ordersSubmitted: "提交订单",
    guangdong: "广东",
    jiangsuZhejiangShanghai: "江浙沪",
    sichuanChongqing: "川渝",
    other: "其他",
    totalViews: "场观人次",
    peakViewers: "最高在线",
    averageWatchTime: "平均停留",
    text4m38s: "4分38秒",
    revenue: "成交额",
    text189k: "¥18.9万",
    salesConversion: "成交转化",
    salesPer1kViews: "千次观看成交",
    conversionFunnel: "转化漏斗",
    viewers: "人数",
    giftTipTrend: "礼物 / 打赏趋势",
    gifts: "礼物",
    giftValue: "礼物值",
    tips: "打赏",
    tipValue: "打赏值",
    peakConcurrentViewers: "时段在线峰值",
    online: "在线",
    viewers2: "在线人数",
    audienceProfile: "观众画像",
    ageDistribution: "年龄分布",
    regionDistribution: "地域分布",
  },
  en: {
    openAudienceRoom: "Open audience room",
    qualifiedViewers: "Qualified viewers",
    engagedViewers: "Engaged viewers",
    productClicks: "Product clicks",
    ordersSubmitted: "Orders submitted",
    guangdong: "Guangdong",
    jiangsuZhejiangShanghai: "Jiangsu / Zhejiang / Shanghai",
    sichuanChongqing: "Sichuan / Chongqing",
    other: "Other",
    totalViews: "Total views",
    peakViewers: "Peak viewers",
    averageWatchTime: "Average watch time",
    text4m38s: "4m 38s",
    revenue: "Revenue",
    text189k: "¥189K",
    salesConversion: "Sales conversion",
    salesPer1kViews: "Sales per 1K views",
    conversionFunnel: "Conversion funnel",
    viewers: "Viewers",
    giftTipTrend: "Gift / tip trend",
    gifts: "Gifts",
    giftValue: "Gift value",
    tips: "Tips",
    tipValue: "Tip value",
    peakConcurrentViewers: "Peak concurrent viewers",
    online: "Online",
    viewers2: "Viewers",
    audienceProfile: "Audience profile",
    ageDistribution: "Age distribution",
    regionDistribution: "Region distribution",
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
  key: "demo-live-components-studio-review-board",
  content: t(content),
};

export default dictionary;
