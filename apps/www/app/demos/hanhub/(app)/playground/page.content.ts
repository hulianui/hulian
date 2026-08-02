import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "youAreHanhubHanhubSAiAssistant": "你是瀚枢 HanHub 的 AI 助手，回答简洁、专业、口语化。",
    "helloPleaseIntroduceYourself": "你好，介绍一下你自己。",
    "onlineDebuggingOfModelsAndParametersMock": "在线调试模型与参数 · mock 流式回复 · 一键导出接入代码",
    "clear": "清空",
    "viewAsCode": "查看为代码",
    "model": "模型",
    "everyM": "每 1M",
    "maximumOutputTokens": "最大输出 tokens",
    "systemPrompt": "系统提示",
    "setTheRoleAndBehaviorOfThe": "设定模型的角色与行为…",
    "sendTheFirstMessageToStartThe": "发送第一条消息，开始调试对话",
    "me": "我",
    "assistant": "助手",
    "model2": "模型",
    "sendAMessageToValue": "向 {0} 发消息…",
    "realTimeBilling": "实时计费",
    "totalTokens": "总 tokens",
    "costOfThisSession": "本次会话成本",
    "includingGatewayMagnification": "含网关倍率 ×",
    "estimateTokenByCharacter": "· 按字符估算 token",
  },
  en: {
    "youAreHanhubHanhubSAiAssistant": "You are HanHub HanHub's AI assistant, your answers are concise, professional and colloquial.",
    "helloPleaseIntroduceYourself": "Hello, please introduce yourself.",
    "onlineDebuggingOfModelsAndParametersMock": "Online debugging of models and parameters · Mock streaming response · One-click export of access code",
    "clear": "Clear",
    "viewAsCode": "view as code",
    "model": "model",
    "everyM": "Every 1M",
    "maximumOutputTokens": "Maximum output tokens",
    "systemPrompt": "System prompt",
    "setTheRoleAndBehaviorOfThe": "Set the role and behavior of the model...",
    "sendTheFirstMessageToStartThe": "Send the first message to start the debugging conversation",
    "me": "me",
    "assistant": "Assistant",
    "model2": "model",
    "sendAMessageToValue": "Send a message to {0}...",
    "realTimeBilling": "Real-time billing",
    "totalTokens": "total tokens",
    "costOfThisSession": "Cost of this session",
    "includingGatewayMagnification": "Including gateway magnification ×",
    "estimateTokenByCharacter": "· Estimate token by character",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-app-playground-page",
  content: t(content),
};

export default dictionary;
