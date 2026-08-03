import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "orderNumber": "订单号",
    "customer": "客户",
    "amount": "金额",
    "numberOfItems": "商品数",
    "valueItems": "{0} 件",
    "status": "状态",
    "orderTime": "下单时间",
    "totalNumberOfOrders": "订单总数",
    "transactionAmount": "成交金额",
    "pendingPayment3": "待付款",
    "completed4": "已完成",
    "orderList": "订单列表",
    "keywords": "关键词",
    "orderNumberCustomer": "订单号 / 客户",
    "status2": "状态",
    "all": "全部",
    "orderDate": "下单日期",
    "startDate": "开始日期",
    "endDate": "结束日期",
  },
  en: {
    "orderNumber": "Order number",
    "customer": "Customer",
    "amount": "Amount",
    "numberOfItems": "Number of items",
    "valueItems": "{0} items",
    "status": "Status",
    "orderTime": "Order time",
    "totalNumberOfOrders": "Total number of orders",
    "transactionAmount": "Transaction amount",
    "pendingPayment3": "Pending payment",
    "completed4": "Completed",
    "orderList": "order list",
    "keywords": "keywords",
    "orderNumberCustomer": "Order Number/Customer",
    "status2": "Status",
    "all": "All",
    "orderDate": "Order date",
    "startDate": "Start date",
    "endDate": "End date",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-app-orders-page",
  content: t(content),
};

export default dictionary;
