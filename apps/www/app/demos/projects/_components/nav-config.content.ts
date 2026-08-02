import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "overview": "概览",
    "workbench": "工作台",
    "project": "项目",
    "projectTracking": "项目追踪",
    "workPhotos": "工作照片",
    "businessFinance": "商务财务",
    "quotation": "报价单",
    "invoiceCollection": "开票回款",
    "collectMoneyOnline": "在线收款",
    "workbench2": "工作台",
    "projectTracking2": "项目追踪",
    "workPhotos2": "工作照片",
    "quotation2": "报价单",
    "invoiceCollection2": "开票回款",
    "collectMoneyOnline2": "在线收款",
    "projectDetails": "项目详情",
    "quotationDetails": "报价单详情",
    "cashier": "收银台",
    "workbench3": "工作台",
    "workbench4": "工作台",
    "workbench5": "工作台",
    "workbench6": "工作台",
  },
  en: {
    "overview": "Overview",
    "workbench": "workbench",
    "project": "Project",
    "projectTracking": "Project Tracking",
    "workPhotos": "work photos",
    "businessFinance": "Business Finance",
    "quotation": "quote",
    "invoiceCollection": "Invoice collection",
    "collectMoneyOnline": "Collect money online",
    "workbench2": "workbench",
    "projectTracking2": "Project Tracking",
    "workPhotos2": "work photos",
    "quotation2": "quote",
    "invoiceCollection2": "Invoice collection",
    "collectMoneyOnline2": "Collect money online",
    "projectDetails": "Project details",
    "quotationDetails": "Quote details",
    "cashier": "cashier",
    "workbench3": "workbench",
    "workbench4": "workbench",
    "workbench5": "workbench",
    "workbench6": "workbench",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-components-nav-config",
  content: t(content),
};

export default dictionary;
