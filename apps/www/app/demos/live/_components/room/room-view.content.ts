import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    hiIAmTheHanselectAiAssistantAskMeAboutProductsOffersOrDelivery: "你好呀~我是瀚选 AI 客服，商品、优惠、物流都可以问我哦。",
    hostFollowed: "已关注主播",
    writeAMessage: "说点什么…",
    send: "发送",
    shoppingPanel: "小黄车",
    gifts: "礼物",
    like: "点赞",
    backToHostConsole: "返回中控台",
    aiSupport: "AI 客服",
    orderPlaced: "已下单：",
    product: "号",
    buyNow: "去抢购",
    sendAGift: "送礼物",
    coins: "币",
    tapTheSameGiftRepeatedlyToBuildACombo: "连续点击同一礼物即可连击 combo～",
    me: "我",
    hanselectSupport: "瀚选客服",
    han: "瀚",
    askSupportAboutSizingOffersOrDelivery: "问问客服：尺码 / 优惠 / 发货…",
  },
  en: {
    hiIAmTheHanselectAiAssistantAskMeAboutProductsOffersOrDelivery: "Hi! I am the HanSelect AI assistant. Ask me about products, offers, or delivery.",
    hostFollowed: "Host followed",
    writeAMessage: "Write a message...",
    send: "Send",
    shoppingPanel: "Shopping panel",
    gifts: "Gifts",
    like: "Like",
    backToHostConsole: "Back to host console",
    aiSupport: "AI support",
    orderPlaced: "Order placed: ",
    product: "Product ",
    buyNow: "Buy now",
    sendAGift: "Send a gift",
    coins: " coins",
    tapTheSameGiftRepeatedlyToBuildACombo: "Tap the same gift repeatedly to build a combo.",
    me: "me",
    hanselectSupport: "HanSelect Support",
    han: "Han",
    askSupportAboutSizingOffersOrDelivery: "Ask support about sizing, offers, or delivery...",
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
  key: "demo-live-components-room-room-view",
  content: t(content),
};

export default dictionary;
