import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "unifiedReceptionThroughMultipleChannels": "多渠道统一接待",
    "webPageAppWechatPhoneOneWorkbench": "网页 / App / 微信 / 电话，一个工作台全收口",
    "realTimeAgentCollaboration": "实时坐席协同",
    "incomingCallRemindersInputStatusAndRead": "进线提醒、输入状态、已读回执一目了然",
    "serviceQualityDashboard": "服务质量看板",
    "realTimeTrackingOfFirstCallDuration": "首响时长、解决率、CSAT 满意度实时跟踪",
    "coral": "瑚",
    "hulianCustomerService": "瑚琏客服",
    "makeEveryConversation": "让每一次对话",
    "areTakenSeriously": "都被认真对待",
    "aRealTimeConversationalWorkbenchForAgents": "面向坐席的实时会话工作台，多渠道接待、工单流转、知识沉淀与服务度量一体化。",
    "hulianBuiltInExamples": "© 2026 瑚琏 Hulian · 内置示例",
    "coral2": "瑚",
    "hulianCustomerService2": "瑚琏客服",
    "welcomeBackLogInToYourCustomer": "欢迎回来，登录你的客服工作台",
    "forgotPassword": "忘记密码",
    "contactAdministrator": "联系管理员",
    "demoEnvironmentFillInAnyUsernamePassword": "演示环境：用户名 / 密码任意填写即可登录",
  },
  en: {
    "unifiedReceptionThroughMultipleChannels": "One inbox for every channel",
    "webPageAppWechatPhoneOneWorkbench": "Web page/App/WeChat/Phone, one workbench all closed",
    "realTimeAgentCollaboration": "Real-time agent collaboration",
    "incomingCallRemindersInputStatusAndRead": "See incoming requests, typing indicators, and read receipts at a glance",
    "serviceQualityDashboard": "Service quality dashboard",
    "realTimeTrackingOfFirstCallDuration": "Real-time tracking of first call duration, resolution rate, and CSAT satisfaction",
    "coral": "coral",
    "hulianCustomerService": "Hulian customer service",
    "makeEveryConversation": "make every conversation",
    "areTakenSeriously": "are taken seriously",
    "aRealTimeConversationalWorkbenchForAgents": "A real-time conversational workbench for agents, integrating multichannel support, ticket transfer, knowledge management and service measurement.",
    "hulianBuiltInExamples": "© 2026 Hulian · Built-in examples",
    "coral2": "coral",
    "hulianCustomerService2": "Hulian customer service",
    "welcomeBackLogInToYourCustomer": "Welcome back, log in to your customer service workbench",
    "forgotPassword": "Forgot password",
    "contactAdministrator": "Contact administrator",
    "demoEnvironmentFillInAnyUsernamePassword": "Demo environment: fill in any username/password to log in",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-login-page",
  content: t(content),
};

export default dictionary;
