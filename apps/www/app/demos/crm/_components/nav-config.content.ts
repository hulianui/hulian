import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "overview": "概览",
    "workbench": "工作台",
    "business": "业务",
    "customerList": "客户列表",
    "businessOpportunityBoard": "商机看板",
    "orderManagement": "订单管理",
    "system": "系统",
    "systemSettings": "系统设置",
    "workbench2": "工作台",
    "customerList2": "客户列表",
    "businessOpportunityBoard2": "商机看板",
    "orderManagement2": "订单管理",
    "systemSettings2": "系统设置",
    "workbench3": "工作台",
    "workbench4": "工作台",
    "customerDetails": "客户详情",
    "workbench5": "工作台",
    "customerDetails2": "客户详情",
    "workbench6": "工作台",
  },
  en: {
    "overview": "Overview",
    "workbench": "Dashboard",
    "business": "business",
    "customerList": "Customer list",
    "businessOpportunityBoard": "Business opportunity board",
    "orderManagement": "Order management",
    "system": "system",
    "systemSettings": "System settings",
    "workbench2": "Dashboard",
    "customerList2": "Customer list",
    "businessOpportunityBoard2": "Business opportunity board",
    "orderManagement2": "Order management",
    "systemSettings2": "System settings",
    "workbench3": "Dashboard",
    "workbench4": "Dashboard",
    "customerDetails": "Customer details",
    "workbench5": "Dashboard",
    "customerDetails2": "Customer details",
    "workbench6": "Dashboard",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-components-nav-config",
  content: t(content),
};

export default dictionary;
