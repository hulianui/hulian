import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "workbench": "工作台",
    "sessionWorkbench": "会话工作台",
    "service": "服务",
    "workOrderManagement": "工单管理",
    "knowledgeBase": "知识库",
    "analysis": "分析",
    "dataDashboard": "数据看板",
    "system": "系统",
    "customerServiceSettings": "客服设置",
    "sessionWorkbench2": "会话工作台",
    "workOrderManagement2": "工单管理",
    "knowledgeBase2": "知识库",
    "dataDashboard2": "数据看板",
    "customerServiceSettings2": "客服设置",
    "sessionWorkbench3": "会话工作台",
    "sessionWorkbench4": "会话工作台",
    "workOrderDetails": "工单详情",
    "sessionWorkbench5": "会话工作台",
    "workOrderDetails2": "工单详情",
    "sessionWorkbench6": "会话工作台",
  },
  en: {
    "workbench": "Workbench",
    "sessionWorkbench": "Conversation workbench",
    "service": "Service",
    "workOrderManagement": "Ticket management",
    "knowledgeBase": "Knowledge base",
    "analysis": "Analytics",
    "dataDashboard": "Data dashboard",
    "system": "System",
    "customerServiceSettings": "Customer service settings",
    "sessionWorkbench2": "Conversation workbench",
    "workOrderManagement2": "Ticket management",
    "knowledgeBase2": "Knowledge base",
    "dataDashboard2": "Data dashboard",
    "customerServiceSettings2": "Customer service settings",
    "sessionWorkbench3": "Conversation workbench",
    "sessionWorkbench4": "Conversation workbench",
    "workOrderDetails": "Ticket details",
    "sessionWorkbench5": "Conversation workbench",
    "workOrderDetails2": "Ticket details",
    "sessionWorkbench6": "Conversation workbench",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-nav-config",
  content: t(content),
};

export default dictionary;
