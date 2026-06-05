import { HeroBlock } from "../../blocks/_blocks/hero";
import { TrustBarBlock } from "../../blocks/_blocks/trust-bar";
import { FeaturesBlock } from "../../blocks/_blocks/features";
import { StatsBlock } from "../../blocks/_blocks/stats";
import { IntegrationsBlock } from "../../blocks/_blocks/integrations";
import { TestimonialsBlock } from "../../blocks/_blocks/testimonials";
import { PricingTableBlock } from "../../blocks/_blocks/pricing-table";
import { FaqBlock } from "../../blocks/_blocks/faq";
import { CtaBlock } from "../../blocks/_blocks/cta";
import { ContactFormBlock } from "../../blocks/_blocks/contact-form";

// SaaS 营销落地页 —— 由 10 个区块顺序拼成的完整整页。
// 自带 padding 的区块直接堆叠;裸件(定价表/联系表单)包一层 section 统一节奏。
export function LandingPage() {
  return (
    <div className="bg-bg">
      <HeroBlock />
      <TrustBarBlock />
      <FeaturesBlock />
      <StatsBlock />
      <IntegrationsBlock />
      <TestimonialsBlock />
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <PricingTableBlock />
        </div>
      </section>
      <FaqBlock />
      <CtaBlock />
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <ContactFormBlock />
        </div>
      </section>
    </div>
  );
}
