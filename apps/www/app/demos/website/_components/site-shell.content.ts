import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    pages: "页面",
    home: "首页",
    productIntroductionAndOverview: "产品介绍与概览",
    homeOverview: "首页 home",
    pricing: "定价",
    comparePlansAndPricing: "套餐与价格对比",
    pricingCostPlans: "定价 价格 套餐",
    contactUs: "联系我们",
    bookADemoGetAQuote: "预约演示 · 获取报价",
    contactDemoSales: "联系 演示 销售",
    platformCapabilities: "平台能力",
    oneClickDeployment: "一键部署",
    deployGitPush: "部署 git push",
    elasticCompute: "弹性算力",
    computeScalingBilling: "算力 弹性 计费",
    endToEndObservability: "端到端可观测",
    observabilityMonitoringLogsTraces: "可观测 监控 日志 链路",
    resources: "资源",
    documentation: "文档中心",
    documentationApiGuides: "文档 API 指南",
    openSearchK: "打开搜索（⌘K）",
    search: "搜索",
    bookADemo: "预约演示",
    startForFree: "免费开始",
    searchPagesOrFeatures: "搜索页面或功能…",
    noMatchingResults: "未找到相关内容",
    thisDemoUsesFictionalCompaniesAndData: "· 本页为 @hulianui/ui 演示，公司与数据均为虚构。",
    termsOfService: "服务条款",
    privacyPolicy: "隐私政策",
    backToGallery: "返回画廊",
  },
  en: {
    pages: "Pages",
    home: "Home",
    productIntroductionAndOverview: "Product introduction and overview",
    homeOverview: "home overview",
    pricing: "Pricing",
    comparePlansAndPricing: "Compare plans and pricing",
    pricingCostPlans: "pricing cost plans",
    contactUs: "Contact us",
    bookADemoGetAQuote: "Book a demo · Get a quote",
    contactDemoSales: "contact demo sales",
    platformCapabilities: "Platform capabilities",
    oneClickDeployment: "One-click deployment",
    deployGitPush: "Deploy git push",
    elasticCompute: "Elastic compute",
    computeScalingBilling: "compute scaling billing",
    endToEndObservability: "End-to-end observability",
    observabilityMonitoringLogsTraces: "Observability monitoring logs traces",
    resources: "Resources",
    documentation: "Documentation",
    documentationApiGuides: "Documentation API guides",
    openSearchK: "Open search (⌘K)",
    search: "Search",
    bookADemo: "Book a demo",
    startForFree: "Start for free",
    searchPagesOrFeatures: "Search pages or features...",
    noMatchingResults: "No matching results",
    thisDemoUsesFictionalCompaniesAndData: "· This @hulianui/ui demo uses fictional companies and data.",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    backToGallery: "Back to gallery",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-website-components-site-shell",
  content: t(content),
};

export default dictionary;
