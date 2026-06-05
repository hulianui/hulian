import type { ReactNode } from "react";
import { HeroBlock } from "./_blocks/hero";
import { TrustBarBlock } from "./_blocks/trust-bar";
import { FeaturesBlock } from "./_blocks/features";
import { StatsBlock } from "./_blocks/stats";
import { IntegrationsBlock } from "./_blocks/integrations";
import { TestimonialsBlock } from "./_blocks/testimonials";
import { PricingTableBlock } from "./_blocks/pricing-table";
import { FaqBlock } from "./_blocks/faq";
import { CtaBlock } from "./_blocks/cta";
import { ContactFormBlock } from "./_blocks/contact-form";

// Blocks 注册表（server-only：聚合 RSC/client block 组件 → 预览渲染）。
// 元数据是纯数据，住在 _meta.ts（client 侧栏可安全读）；本文件只补 slug→预览组件映射。
// detail 页用 fs 读 _blocks/ 真实源文件喂给 CodeBlock，因此展示的代码 = 真能跑的文件。
export { blocks, getBlock, CATEGORY_LABEL, type BlockMeta } from "./_meta";

// slug → 预览渲染。block 自身是 client/RSC 组件，server detail 页可直接渲染。
export const blockPreviews: Record<string, () => ReactNode> = {
  hero: () => <HeroBlock />,
  "trust-bar": () => <TrustBarBlock />,
  features: () => <FeaturesBlock />,
  stats: () => <StatsBlock />,
  integrations: () => <IntegrationsBlock />,
  testimonials: () => <TestimonialsBlock />,
  "pricing-table": () => <PricingTableBlock />,
  faq: () => <FaqBlock />,
  cta: () => <CtaBlock />,
  "contact-form": () => <ContactFormBlock />,
};
