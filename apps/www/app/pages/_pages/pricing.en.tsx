import { HeroBlock } from "../../blocks/_blocks/hero.en";
import { PricingTableBlock } from "../../blocks/_blocks/pricing-table.en";
import { FaqBlock } from "../../blocks/_blocks/faq.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
export function PricingPage() {
    return (<div className="bg-bg">
      <HeroBlock />
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <PricingTableBlock />
        </div>
      </section>
      <FaqBlock />
      <CtaBlock />
    </div>);
}
