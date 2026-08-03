import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "all": "全部",
    "quotation": "报价单",
    "partyARaisesItsHead": "甲方抬头",
    "maker": "制单人",
    "totalPriceAndTax": "价税合计",
    "orderMakingDate": "制单日期",
    "validUntil": "有效期至",
    "status": "状态",
    "operation": "操作",
    "viewEdit": "查看 / 编辑",
    "quotation2": "报价单",
    "keywords": "关键词",
    "orderNoProjectPartyA": "单号 / 项目 / 甲方",
    "status2": "状态",
    "maker2": "制单人",
  },
  en: {
    "all": "All",
    "quotation": "quote",
    "partyARaisesItsHead": "Bill to",
    "maker": "Prepared by",
    "totalPriceAndTax": "Total incl. tax",
    "orderMakingDate": "Prepared on",
    "validUntil": "Valid until",
    "status": "Status",
    "operation": "Operation",
    "viewEdit": "View/Edit",
    "quotation2": "Quotes",
    "keywords": "Keywords",
    "orderNoProjectPartyA": "Quote ID / project / client",
    "status2": "Status",
    "maker2": "Prepared by",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-app-quotes-page",
  content: t(content),
};

export default dictionary;
