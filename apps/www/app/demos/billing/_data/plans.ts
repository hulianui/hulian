import type { Addon, BillingCycle, PlanTier } from "./types";

// 套餐档位。年付单价已折算（约 5 折→8.3 折不等，年付立省 2 个月）。
export const plans: PlanTier[] = [
  {
    id: "starter",
    name: "入门版",
    nameEn: "Starter",
    tagline: "个人与小项目起步",
    monthly: 0,
    yearly: 0,
    seats: 1,
    features: ["1 个工作区", "5 个项目", "社区支持", "7 天数据留存"],
  },
  {
    id: "pro",
    name: "专业版",
    nameEn: "Pro",
    tagline: "成长团队的高效之选",
    monthly: 99,
    yearly: 82,
    seats: 5,
    features: ["无限工作区", "无限项目", "工单优先支持", "90 天数据留存", "审计日志", "自定义角色"],
    featured: true,
  },
  {
    id: "scale",
    name: "旗舰版",
    nameEn: "Scale",
    tagline: "规模化业务与高并发",
    monthly: 299,
    yearly: 249,
    seats: 20,
    features: ["专属客户成功", "SAML 单点登录", "1 年数据留存", "SLA 99.9%", "私有数据通道", "用量预算告警"],
  },
  {
    id: "enterprise",
    name: "企业版",
    nameEn: "Enterprise",
    tagline: "私有部署与定制合规",
    monthly: -1,
    yearly: -1,
    seats: 0,
    features: ["私有化 / 专有云", "定制 SLA 与合规", "解决方案架构师", "无限数据留存", "7×24 专线"],
  },
];

export const planById: Record<string, PlanTier> = Object.fromEntries(plans.map((p) => [p.id, p]));

// 可叠加的增值项（账户页多选 Choicebox）。
export const addons: Addon[] = [
  { id: "ai", name: "AI 智能助手", desc: "自然语言查询 + 智能洞察", monthly: 49, yearly: 39 },
  { id: "storage", name: "扩展存储 1TB", desc: "对象存储与备份扩容", monthly: 29, yearly: 24 },
  { id: "sso", name: "高级安全包", desc: "SSO / SCIM / 设备管控", monthly: 79, yearly: 66 },
  { id: "support", name: "专属技术支持", desc: "1 小时响应 + 季度复盘", monthly: 199, yearly: 166 },
];

export const addonById: Record<string, Addon> = Object.fromEntries(addons.map((a) => [a.id, a]));

/** 取某档某周期的单价（月付为本身，年付为折算月单价）。 */
export function unitPrice(p: { monthly: number; yearly: number }, cycle: BillingCycle): number {
  return cycle === "yearly" ? p.yearly : p.monthly;
}

/** 元 → 「¥1,234」。 */
export function formatMoney(n: number): string {
  return `¥${n.toLocaleString("zh-CN")}`;
}
