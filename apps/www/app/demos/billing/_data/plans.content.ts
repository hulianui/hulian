import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "starterEdition": "入门版",
    "startingWithPersonalAndSmallProjects": "个人与小项目起步",
    "workspace": "1 个工作区",
    "items": "5 个项目",
    "communitySupport": "社区支持",
    "daysDataRetention": "7 天数据留存",
    "professionalVersion": "专业版",
    "theEfficientChoiceForGrowingTeams": "成长团队的高效之选",
    "unlimitedWorkspace": "无限工作区",
    "unlimitedProjects": "无限项目",
    "prioritySupportForWorkOrders": "工单优先支持",
    "daysDataRetention2": "90 天数据留存",
    "auditLog": "审计日志",
    "customRole": "自定义角色",
    "ultimateVersion": "旗舰版",
    "largeScaleBusinessAndHighConcurrency": "规模化业务与高并发",
    "dedicatedCustomerSuccess": "专属客户成功",
    "samlSingleSignOn": "SAML 单点登录",
    "yearDataRetention": "1 年数据留存",
    "privateDataChannel": "私有数据通道",
    "usageBudgetAlert": "用量预算告警",
    "enterpriseEdition": "企业版",
    "privateDeploymentAndCustomCompliance": "私有部署与定制合规",
    "privatizedPrivateCloud": "私有化 / 专有云",
    "customSlasAndCompliance": "定制 SLA 与合规",
    "solutionsArchitect": "解决方案架构师",
    "unlimitedDataRetention": "无限数据留存",
    "dedicatedLine": "7×24 专线",
    "aiIntelligentAssistant": "AI 智能助手",
    "naturalLanguageQueryIntelligentInsights": "自然语言查询 + 智能洞察",
    "extendedStorageTb": "扩展存储 1TB",
    "objectStorageAndBackupExpansion": "对象存储与备份扩容",
    "advancedSecurityPackage": "高级安全包",
    "ssoScimDeviceManagementAndControl": "SSO / SCIM / 设备管控",
    "dedicatedTechnicalSupport": "专属技术支持",
    "hourResponseQuarterlyReview": "1 小时响应 + 季度复盘",
  },
  en: {
    "starterEdition": "Starter",
    "startingWithPersonalAndSmallProjects": "For individuals and small projects",
    "workspace": "1 workspace",
    "items": "5 items",
    "communitySupport": "Community support",
    "daysDataRetention": "7-day data retention",
    "professionalVersion": "Pro",
    "theEfficientChoiceForGrowingTeams": "For growing teams that need more control",
    "unlimitedWorkspace": "Unlimited workspaces",
    "unlimitedProjects": "Unlimited projects",
    "prioritySupportForWorkOrders": "Priority ticket support",
    "daysDataRetention2": "90-day data retention",
    "auditLog": "Audit log",
    "customRole": "Custom role",
    "ultimateVersion": "Scale",
    "largeScaleBusinessAndHighConcurrency": "For high-volume, business-critical workloads",
    "dedicatedCustomerSuccess": "Dedicated Customer Success",
    "samlSingleSignOn": "SAML single sign-on",
    "yearDataRetention": "1-year data retention",
    "privateDataChannel": "Private data channel",
    "usageBudgetAlert": "Usage budget alert",
    "enterpriseEdition": "Enterprise Edition",
    "privateDeploymentAndCustomCompliance": "Private deployment and tailored compliance",
    "privatizedPrivateCloud": "Self-hosted or private cloud",
    "customSlasAndCompliance": "Custom SLAs and compliance",
    "solutionsArchitect": "Solutions Architect",
    "unlimitedDataRetention": "Unlimited data retention",
    "dedicatedLine": "24/7 dedicated support line",
    "aiIntelligentAssistant": "AI assistant",
    "naturalLanguageQueryIntelligentInsights": "Natural-language queries and intelligent insights",
    "extendedStorageTb": "1 TB additional storage",
    "objectStorageAndBackupExpansion": "More object storage and backup capacity",
    "advancedSecurityPackage": "Advanced security package",
    "ssoScimDeviceManagementAndControl": "SSO, SCIM, and device controls",
    "dedicatedTechnicalSupport": "Dedicated technical support",
    "hourResponseQuarterlyReview": "1-hour response time and quarterly review",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-data-plans",
  content: t(content),
};

export default dictionary;
