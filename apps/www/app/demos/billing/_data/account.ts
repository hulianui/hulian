import type { PaymentMethod, UsageMetric } from "./types";

// 当前登录用户与订阅初始态。RelativeTime 用绝对时间字符串，组件内部按「现在」实时折算。
export const account = {
  name: "沈砚之",
  email: "shen.yz@hanyun.io",
  company: "瀚云数智 · 平台研发部",
  avatar: "沈",
  /** 上次登录（相对时间展示）。 */
  lastLogin: "2026-06-05T08:12:00+08:00",
  memberSince: "2024-03-18T10:00:00+08:00",
  /** 工作状态表情（EmojiPicker 可改）。 */
  status: "🚀",
  statusText: "正在冲刺 Q2 发布",
};

// 当前订阅初始态（store 初值；可在套餐页改）。
export const initialSubscription = {
  planId: "pro",
  cycle: "yearly" as const,
  /** 已购席位（≥ 套餐含席位，超出按加购席位计费）。 */
  seats: 8,
  /** 已开通的增值项 id。 */
  addons: ["ai", "storage"],
  status: "active" as const,
  /** 下次续费日。 */
  nextRenewal: "2026-07-01T00:00:00+08:00",
  /** 默认支付方式 id。 */
  defaultMethodId: "pm-visa",
};

// 已绑定支付方式。
export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm-visa",
    type: "card",
    brand: "visa",
    number: "4111111111111111",
    holder: "SHEN YANZHI",
    expiry: "08/27",
  },
  {
    id: "pm-master",
    type: "card",
    brand: "mastercard",
    number: "5500005555555559",
    holder: "SHEN YANZHI",
    expiry: "11/26",
  },
  {
    id: "pm-wechat",
    type: "wallet",
    wallet: "wechat",
    walletAccount: "shen****z (微信支付)",
  },
];

// 资源用量（概览仪表）。
export const usage: UsageMetric[] = [
  { key: "seats", label: "团队席位", used: 8, quota: 8, unit: "席" },
  { key: "projects", label: "项目数", used: 47, quota: 999, unit: "个" },
  { key: "storage", label: "存储空间", used: 612, quota: 1024, unit: "GB" },
  { key: "api", label: "本月 API 调用", used: 184_320, quota: 500_000, unit: "次" },
];
