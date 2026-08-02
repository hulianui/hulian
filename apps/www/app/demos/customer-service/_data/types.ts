// 客服中心 demo 数据模型（内置静态 mock，刷新即还原）。
// 时间用固定字符串避免 SSR/CSR 不一致；实时引擎只在客户端追加新内容。

export type ConversationStatus = "waiting" | "active" | "closed";
export type MessageAuthor = "customer" | "agent" | "system";
export type MessageStatus = "sending" | "sent" | "read";

export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
  at: string; // HH:mm
  status?: MessageStatus; // 仅 agent 消息用（已读回执）
}

export type CustomerLevel = "普通" | "银卡" | "金卡" | "黑卡";

export interface Customer {
  id: string;
  name: string;
  avatar?: string;
  level: CustomerLevel;
  phone: string;
  region: string;
  since: string; // 注册日期 YYYY-MM-DD
  totalSpend: number; // 累计消费（元）
  orders: number; // 累计订单数
  tags: string[];
  history: { id: string; at: string; text: string }[]; // 历史互动 / 工单
}

export type ConversationChannel = "网页" | "App" | "微信" | "电话";

export interface Conversation {
  id: string;
  customerId: string;
  status: ConversationStatus;
  channel: ConversationChannel;
  subject: string; // 咨询主题（列表副标题）
  unread: number;
  lastAt: string; // HH:mm
  messages: Message[]; // 已展示历史
  queued: Message[]; // 供实时引擎逐条投递的客户后续消息
}

export type TicketPriority = "低" | "中" | "高" | "紧急";
export type TicketStatus = "待处理" | "处理中" | "待回复" | "已解决";

export interface Ticket {
  id: string;
  subject: string;
  customerName: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  channel: ConversationChannel;
  createdAt: string; // YYYY-MM-DD HH:mm
  updatedAt: string; // YYYY-MM-DD HH:mm
  description: string;
  timeline: { at: string; actor: string; text: string }[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  body: string; // markdown
  views: number;
  updatedAt: string; // YYYY-MM-DD
}

export interface Metric {
  label: string;
  value: string;
  delta?: number; // 同比/环比百分点，正为升
  hint?: string;
}

export const AGENTS = ["小琏", "阿瑚", "晚晴", "周明"] as const;
