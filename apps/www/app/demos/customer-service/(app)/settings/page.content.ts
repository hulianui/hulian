import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "xiaoLian": "小琏",
    "iMHappyToServeYouIf": "很高兴为您服务，有问题随时找我～",
    "helloIAmYourDedicatedCustomerService": "您好，我是您的专属客服小琏，请问有什么可以帮您？",
    "settingsSaved": "设置已保存",
    "customerServicePreferencesHaveBeenUpdatedDemo": "客服偏好已更新（demo 内存态，刷新还原）",
    "customerServiceSettings": "客服设置",
    "configureAgentReceptionPreferencesAndAutomationRules": "配置坐席接待偏好与自动化规则。",
    "saveSettings": "保存设置",
    "agentInformation": "坐席资料",
    "agentNickname": "坐席昵称",
    "nameDisplayedToCustomers": "对客展示的名称",
    "personalizedSignature": "个性签名",
    "dialogWindowSubtitleDisplay": "对话窗口副标题展示",
    "oneSentenceSignature": "一句话签名",
    "receptionSettings": "接待设置",
    "automaticallyConnectToNewSessions": "自动接入新会话",
    "newSessionsAreAutomaticallyAssignedToMe": "在线时新会话自动分配给我",
    "automaticallyConnectToNewSessions2": "自动接入新会话",
    "maximumSimultaneousReceptionValueSessions": "同时接待上限：{0} 个会话",
    "sessionsExceedingTheUpperLimitAreQueued": "超过上限的会话进入排队",
    "automaticallyTransferAfterLeaving": "离开后自动转接",
    "transferTheOngoingConversationToAnotherPerson": "状态切到「小休」时把进行中会话转交他人",
    "automaticallyTransferAfterLeaving2": "离开后自动转接",
    "automaticReply": "自动回复",
    "enableWelcomeMessage": "启用欢迎语",
    "automaticallySendAWelcomeMessageWhenThe": "客户接入时自动发送一条欢迎语",
    "enableWelcomeMessage2": "启用欢迎语",
    "welcomeMessageContent": "欢迎语内容",
    "automaticallySentWhenTheCustomerAccesses": "客户接入时自动发送…",
    "workingHours": "工作时段",
    "receptionHours": "接待时段",
    "intelligentAssistantsWillBeOnDutyDuring": "非工作时段由智能助手值守",
    "localizedText": "全天 7×24",
    "workingHours2": "工作时间 9:00-21:00",
    "customize": "自定义",
  },
  en: {
    "xiaoLian": "Xiao Lian",
    "iMHappyToServeYouIf": "I'm happy to help. Contact me whenever you have a question.",
    "helloIAmYourDedicatedCustomerService": "Hello, I'm your dedicated support agent, Xiao Lian. How can I help?",
    "settingsSaved": "Settings saved",
    "customerServicePreferencesHaveBeenUpdatedDemo": "Support preferences were updated for this session. Reload the demo to restore the defaults.",
    "customerServiceSettings": "Customer service settings",
    "configureAgentReceptionPreferencesAndAutomationRules": "Configure conversation-handling preferences and automation rules.",
    "saveSettings": "Save settings",
    "agentInformation": "Agent information",
    "agentNickname": "Agent nickname",
    "nameDisplayedToCustomers": "Name displayed to customers",
    "personalizedSignature": "Profile message",
    "dialogWindowSubtitleDisplay": "Shown below the agent name in the conversation window",
    "oneSentenceSignature": "One-line profile message",
    "receptionSettings": "Conversation settings",
    "automaticallyConnectToNewSessions": "Automatically connect to new sessions",
    "newSessionsAreAutomaticallyAssignedToMe": "New sessions are automatically assigned to me while online",
    "automaticallyConnectToNewSessions2": "Automatically connect to new sessions",
    "maximumSimultaneousReceptionValueSessions": "Maximum active conversations: {0}",
    "sessionsExceedingTheUpperLimitAreQueued": "Queue new conversations after this limit is reached",
    "automaticallyTransferAfterLeaving": "Transfer conversations when unavailable",
    "transferTheOngoingConversationToAnotherPerson": "Transfer active conversations to another agent when status changes to Break",
    "automaticallyTransferAfterLeaving2": "Transfer conversations when unavailable",
    "automaticReply": "Automatic reply",
    "enableWelcomeMessage": "Enable welcome message",
    "automaticallySendAWelcomeMessageWhenThe": "Send the welcome message when a customer starts a conversation",
    "enableWelcomeMessage2": "Enable welcome message",
    "welcomeMessageContent": "Welcome message content",
    "automaticallySentWhenTheCustomerAccesses": "Sent automatically when a customer starts a conversation...",
    "workingHours": "Working hours",
    "receptionHours": "Support hours",
    "intelligentAssistantsWillBeOnDutyDuring": "The virtual assistant handles new conversations outside support hours",
    "localizedText": "7×24",
    "workingHours2": "Working hours 9:00-21:00",
    "customize": "Customize",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-app-settings-page",
  content: t(content),
};

export default dictionary;
