import { HeroBlock } from "../../blocks/_blocks/hero.en";
import { TrustBarBlock } from "../../blocks/_blocks/trust-bar.en";
import { FeaturesBlock } from "../../blocks/_blocks/features.en";
import { StatsBlock } from "../../blocks/_blocks/stats.en";
import { IntegrationsBlock } from "../../blocks/_blocks/integrations.en";
import { TestimonialsBlock } from "../../blocks/_blocks/testimonials.en";
import { PricingTableBlock } from "../../blocks/_blocks/pricing-table.en";
import { FaqBlock } from "../../blocks/_blocks/faq.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
import { ContactFormBlock } from "../../blocks/_blocks/contact-form.en";
export function LandingPage() {
    return (<div className="bg-bg">
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
    </div>);
}
