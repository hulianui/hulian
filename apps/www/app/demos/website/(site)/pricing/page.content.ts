import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    pricingHancloud: "定价 · 瀚云 HanCloud",
    startFreeAndScaleToEnterpriseComplianceAndDedicatedSupportWithTransparentPricingAndNoSurpriseBil: "从免费起步，到企业级合规与专属支持——透明、可预测，没有意外账单。",
    home: "首页",
    pricing: "定价",
    chooseAPlanThatGrowsWithYourTeam: "选一个随团队成长的方案",
    everyPlanIncludesAGlobalCdnAutomaticHttpsAndUnlimitedDeploymentsUpgradeOrDowngradeAtAnyTimeAndPa: "所有套餐都包含全球 CDN、自动 HTTPS 与无限部署。随时升级或降级，按真实用量计费。",
  },
  en: {
    pricingHancloud: "Pricing · HanCloud",
    startFreeAndScaleToEnterpriseComplianceAndDedicatedSupportWithTransparentPricingAndNoSurpriseBil: "Start free and scale to enterprise compliance and dedicated support, with transparent pricing and no surprise bills.",
    home: "Home",
    pricing: "Pricing",
    chooseAPlanThatGrowsWithYourTeam: "Choose a plan that grows with your team",
    everyPlanIncludesAGlobalCdnAutomaticHttpsAndUnlimitedDeploymentsUpgradeOrDowngradeAtAnyTimeAndPa: "Every plan includes a global CDN, automatic HTTPS, and unlimited deployments. Upgrade or downgrade at any time and pay only for actual usage.",
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
  key: "demo-website-site-pricing-page",
  content: t(content),
};

export default dictionary;
