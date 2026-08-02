import { copy } from "./plans.content";
import type { Addon, BillingCycle, PlanTier } from "./types";

// 套餐档位。年付单价已折算（约 5 折→8.3 折不等，年付立省 2 个月）。
export const plans: PlanTier[] = [
  {
    id: "starter",
    name: copy("starterEdition"),
    nameEn: "Starter",
    tagline: copy("startingWithPersonalAndSmallProjects"),
    monthly: 0,
    yearly: 0,
    seats: 1,
    features: [copy("workspace"), copy("items"), copy("communitySupport"), copy("daysDataRetention")],
  },
  {
    id: "pro",
    name: copy("professionalVersion"),
    nameEn: "Pro",
    tagline: copy("theEfficientChoiceForGrowingTeams"),
    monthly: 99,
    yearly: 82,
    seats: 5,
    features: [copy("unlimitedWorkspace"), copy("unlimitedProjects"), copy("prioritySupportForWorkOrders"), copy("daysDataRetention2"), copy("auditLog"), copy("customRole")],
    featured: true,
  },
  {
    id: "scale",
    name: copy("ultimateVersion"),
    nameEn: "Scale",
    tagline: copy("largeScaleBusinessAndHighConcurrency"),
    monthly: 299,
    yearly: 249,
    seats: 20,
    features: [copy("dedicatedCustomerSuccess"), copy("samlSingleSignOn"), copy("yearDataRetention"), "SLA 99.9%", copy("privateDataChannel"), copy("usageBudgetAlert")],
  },
  {
    id: "enterprise",
    name: copy("enterpriseEdition"),
    nameEn: "Enterprise",
    tagline: copy("privateDeploymentAndCustomCompliance"),
    monthly: -1,
    yearly: -1,
    seats: 0,
    features: [copy("privatizedPrivateCloud"), copy("customSlasAndCompliance"), copy("solutionsArchitect"), copy("unlimitedDataRetention"), copy("dedicatedLine")],
  },
];

export const planById: Record<string, PlanTier> = Object.fromEntries(plans.map((p) => [p.id, p]));

// 可叠加的增值项（账户页多选 Choicebox）。
export const addons: Addon[] = [
  { id: "ai", name: copy("aiIntelligentAssistant"), desc: copy("naturalLanguageQueryIntelligentInsights"), monthly: 49, yearly: 39 },
  { id: "storage", name: copy("extendedStorageTb"), desc: copy("objectStorageAndBackupExpansion"), monthly: 29, yearly: 24 },
  { id: "sso", name: copy("advancedSecurityPackage"), desc: copy("ssoScimDeviceManagementAndControl"), monthly: 79, yearly: 66 },
  { id: "support", name: copy("dedicatedTechnicalSupport"), desc: copy("hourResponseQuarterlyReview"), monthly: 199, yearly: 166 },
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
