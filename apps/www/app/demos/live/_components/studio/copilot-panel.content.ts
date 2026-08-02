import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    welcomeViewersPreviewOffers: "暖场 + 福利预告",
    presentProduct1SherpaJacket: "讲解 1 号·羊羔绒外套",
    watchTime412Conversion68: "停留 4:12 · 转化 6.8%",
    sendA70OffFlashSaleCoupon: "发券促单（3 折秒杀）",
    runAGiveawayThenPresentProduct3: "抽奖留人 + 过款 3 号耳机",
    positive: "正向",
    neutral: "% · 中性",
    questions: "% · 疑问",
    questionsFocusOnSizingAndDelivery: "%（疑问集中在「尺码 / 发货」）",
    aiLiveCopilot: "AI 直播副驾",
    monitorChatAnswerQuestionsGetPromptsRunTheRoom: "实时看弹幕 · 答疑 · 提词 · 控场",
    active: "在岗",
    streamStrategy: "本场直播策略",
    analyzeChatSentimentInRealTime: "实时分析弹幕情绪",
    duration: "持续",
    copilotSuggestions: "副驾建议",
    theCopilotIsListeningToChatSuggestionsWillAppearShortly: "副驾正在聆听弹幕，建议稍后浮现…",
    askTheCopilotForExampleSuggestAClosingPitch: "问问副驾，如「帮我想个促单话术」",
    run: "执行",
    viewerAsked: "观众问：",
    replyPostedToChat: "已回复到公屏",
    useAndReply: "采用并回复",
  },
  en: {
    welcomeViewersPreviewOffers: "Welcome viewers + preview offers",
    presentProduct1SherpaJacket: "Present product 1 · Sherpa jacket",
    watchTime412Conversion68: "Watch time 4:12 · Conversion 6.8%",
    sendA70OffFlashSaleCoupon: "Send a 70%-off flash-sale coupon",
    runAGiveawayThenPresentProduct3: "Run a giveaway, then present product 3",
    positive: "Positive",
    neutral: "% · Neutral",
    questions: "% · Questions",
    questionsFocusOnSizingAndDelivery: "% (questions focus on sizing and delivery)",
    aiLiveCopilot: "AI live copilot",
    monitorChatAnswerQuestionsGetPromptsRunTheRoom: "Monitor chat · Answer questions · Get prompts · Run the room",
    active: "Active",
    streamStrategy: "Stream strategy",
    analyzeChatSentimentInRealTime: "Analyze chat sentiment in real time",
    duration: "Duration",
    copilotSuggestions: "Copilot suggestions",
    theCopilotIsListeningToChatSuggestionsWillAppearShortly: "The copilot is listening to chat. Suggestions will appear shortly...",
    askTheCopilotForExampleSuggestAClosingPitch: "Ask the copilot, for example: \"Suggest a closing pitch\"",
    run: "Run",
    viewerAsked: "Viewer asked:",
    replyPostedToChat: "Reply posted to chat",
    useAndReply: "Use and reply",
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
  key: "demo-live-components-studio-copilot-panel",
  content: t(content),
};

export default dictionary;
