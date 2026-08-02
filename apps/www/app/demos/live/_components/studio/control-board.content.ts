import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    bluRay1080p: "蓝光 1080P",
    ultraHd: "超清",
    hd: "高清",
    chat: "弹幕",
    like: "点赞",
    hostPreview: "主播视角预览",
    liveViewers: "实时在线",
    totalLikes: "累计点赞",
    chatMessages: "互动评论",
    revenueCny: "成交额(元)",
    viewersSalesTrend: "在线 / 成交趋势",
    viewers: "在线人数",
    salesCnyHundreds: "成交(百元)",
    liveChatMonitor: "弹幕监看 · 公屏",
    live: "实时",
    shopResponsiblyBewareOfScamsGiveawayOpensAt800: "理性消费 · 谨防诈骗 · 福袋 8 点开",
  },
  en: {
    bluRay1080p: "Blu-ray 1080p",
    ultraHd: "Ultra HD",
    hd: "HD",
    chat: "Chat",
    like: "Like",
    hostPreview: "Host preview",
    liveViewers: "Live viewers",
    totalLikes: "Total likes",
    chatMessages: "Chat messages",
    revenueCny: "Revenue (CNY)",
    viewersSalesTrend: "Viewers / sales trend",
    viewers: "Viewers",
    salesCnyHundreds: "Sales (CNY hundreds)",
    liveChatMonitor: "Live chat monitor",
    live: "Live",
    shopResponsiblyBewareOfScamsGiveawayOpensAt800: "Shop responsibly · Beware of scams · Giveaway opens at 8:00",
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
  key: "demo-live-components-studio-control-board",
  content: t(content),
};

export default dictionary;
