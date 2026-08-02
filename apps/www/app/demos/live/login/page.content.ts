import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    oneClickLiveConsole: "一键开播中控",
    trackLiveChatViewersAndCommerceMetricsInRealTime: "实时弹幕 / 在线 / 带货数据尽在掌握",
    aiLiveCopilot: "AI 直播副驾",
    automaticChatRepliesSmartPromptsSentimentAndConversionAnalysis: "自动答弹幕、智能提词、情绪与转化分析",
    integratedShoppingPanel: "小黄车直连",
    dragToReorderFeatureInOneClickAndSyncWithAudienceShopping: "拖拽排序、一键讲解、同步观众端抢购",
    han: "瀚",
    hanlive: "瀚播 HanLive",
    aiCopilot: "AI 副驾",
    makeEveryStreamCount: "陪你播好每一场",
    oneRealTimeEnginePowersBothTheHostConsoleAndAudienceRoomIncludingChatGiftsReactionsProductLinksA: "主播中控台 + C 端观众直播间，一套实时引擎驱动。弹幕、礼物、飘心、小黄车、AI 答疑，开播即用。",
    text2026HulianBuiltInExamples: "© 2026 瑚琏 Hulian · 内置示例",
    logInToOpenTheHostConsole: "登录后进入主播中控台",
    forgotPassword: "忘记密码",
    exploreTheAudienceRoom: "先逛逛观众端",
    demoCredentialsArePrefilledSelectLogInToContinue: "演示账号已预填，直接「登录」即可",
  },
  en: {
    oneClickLiveConsole: "One-click live console",
    trackLiveChatViewersAndCommerceMetricsInRealTime: "Track live chat, viewers, and commerce metrics in real time",
    aiLiveCopilot: "AI live copilot",
    automaticChatRepliesSmartPromptsSentimentAndConversionAnalysis: "Automatic chat replies, smart prompts, sentiment, and conversion analysis",
    integratedShoppingPanel: "Integrated shopping panel",
    dragToReorderFeatureInOneClickAndSyncWithAudienceShopping: "Drag to reorder, feature in one click, and sync with audience shopping",
    han: "Han",
    hanlive: "HanLive",
    aiCopilot: "AI copilot",
    makeEveryStreamCount: "Make every stream count",
    oneRealTimeEnginePowersBothTheHostConsoleAndAudienceRoomIncludingChatGiftsReactionsProductLinksA: "One real-time engine powers both the host console and audience room, including chat, gifts, reactions, product links, and AI support.",
    text2026HulianBuiltInExamples: "© 2026 Hulian · Built-in examples",
    logInToOpenTheHostConsole: "Log in to open the host console",
    forgotPassword: "Forgot password",
    exploreTheAudienceRoom: "Explore the audience room",
    demoCredentialsArePrefilledSelectLogInToContinue: "Demo credentials are prefilled. Select Log in to continue.",
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
  key: "demo-live-login-page",
  content: t(content),
};

export default dictionary;
