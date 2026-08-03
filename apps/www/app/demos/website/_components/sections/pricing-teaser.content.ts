import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    pricing: "定价",
    usageBasedPricingThatScalesWithYourTeam: "按用量付费，随团队成长",
    startFreeAndScaleToEnterpriseComplianceAndDedicatedSupportWithTransparentPricingAndNoSurpriseBil: "从免费起步，到企业级合规与专属支持——透明、可预测，没有意外账单。",
    viewTheFullPlanComparison: "查看完整套餐对比",
  },
  en: {
    pricing: "Pricing",
    usageBasedPricingThatScalesWithYourTeam: "Usage-based pricing that scales with your team",
    startFreeAndScaleToEnterpriseComplianceAndDedicatedSupportWithTransparentPricingAndNoSurpriseBil: "Start free and scale to enterprise compliance and dedicated support, with transparent pricing and no surprise bills.",
    viewTheFullPlanComparison: "View the full plan comparison",
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
  key: "demo-website-components-sections-pricing-teaser",
  content: t(content),
};

export default dictionary;
