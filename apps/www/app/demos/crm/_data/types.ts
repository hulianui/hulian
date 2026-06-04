// CRM demo 数据模型（内置静态 mock，刷新即还原）。日期用固定字符串避免 SSR/CSR 不一致。

export type CustomerLevel = "重要" | "普通" | "潜在";
export type CustomerStatus = "待分配" | "跟进中" | "已成交" | "已流失";

export interface Customer {
  id: string;
  name: string; // 联系人主名 / 客户简称
  company: string;
  contactName: string;
  phone: string;
  email: string;
  level: CustomerLevel;
  status: CustomerStatus;
  owner: string; // 负责人
  industry: string;
  region: string;
  amount: number; // 累计成交额（元）
  lastFollowAt: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
  tags: string[];
}

export type OppStage = "线索" | "初步接触" | "方案报价" | "商务谈判" | "赢单" | "输单";

export interface Opportunity {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  stage: OppStage;
  amount: number;
  owner: string;
  probability: number; // 0-100
  expectedCloseAt: string;
}

export type OrderStatus = "待付款" | "已付款" | "已发货" | "已完成" | "已退款";

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  items: number;
}

export type FollowType = "电话" | "拜访" | "微信" | "邮件";

export interface Follow {
  id: string;
  customerId: string;
  type: FollowType;
  content: string;
  owner: string;
  createdAt: string; // YYYY-MM-DD HH:mm
}

export const OWNERS = ["林晚晴", "周明远", "高敏", "陈策", "苏晓"] as const;
export const OPP_STAGES: OppStage[] = ["线索", "初步接触", "方案报价", "商务谈判", "赢单", "输单"];
