import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "noCustomerProfile": "无客户档案",
    "mobilePhone": "手机",
    "area": "地区",
    "register": "注册",
    "accumulatedConsumption": "累计消费",
    "cumulativeOrders": "累计订单",
    "valuePen": "{0} 笔",
    "historicalInteraction": "历史互动",
  },
  en: {
    "noCustomerProfile": "No customer profile",
    "mobilePhone": "mobile phone",
    "area": "area",
    "register": "Register",
    "accumulatedConsumption": "Accumulated consumption",
    "cumulativeOrders": "Cumulative orders",
    "valuePen": "{0} orders",
    "historicalInteraction": "historical interaction",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-workbench-customer-panel",
  content: t(content),
};

export default dictionary;
