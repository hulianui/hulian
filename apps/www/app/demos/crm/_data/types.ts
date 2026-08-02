// CRM demo 数据模型（内置静态 mock，刷新即还原）。日期用固定字符串避免 SSR/CSR 不一致。

export const CUSTOMER_LEVELS = ["重要", "普通", "潜在"] as const;
export type CustomerLevel = (typeof CUSTOMER_LEVELS)[number];

export const CUSTOMER_STATUSES = ["待分配", "跟进中", "已成交", "已流失"] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export const OWNERS = ["林晚晴", "周明远", "高敏", "陈策", "苏晓"] as const;
export type CustomerOwner = (typeof OWNERS)[number];

export const INDUSTRIES = [
  "制造", "互联网", "餐饮", "医疗", "教育", "物流", "传媒", "地产", "农业", "贸易",
  "金融", "零售", "出行", "建材", "咨询", "食品", "能源",
] as const;
export type CustomerIndustry = (typeof INDUSTRIES)[number];

export interface Customer {
  id: string;
  name: string; // 联系人主名 / 客户简称
  company: string;
  contactName: string;
  phone: string;
  email: string;
  level: CustomerLevel;
  status: CustomerStatus;
  owner: CustomerOwner; // 稳定协议值；界面仅翻译显示标签
  industry: CustomerIndustry;
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
  owner: CustomerOwner;
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
  owner: CustomerOwner;
  createdAt: string; // YYYY-MM-DD HH:mm
}

export const OPP_STAGES: OppStage[] = ["线索", "初步接触", "方案报价", "商务谈判", "赢单", "输单"];
