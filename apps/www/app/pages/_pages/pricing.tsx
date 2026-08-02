/** @jsxImportSource ../../../lib/fixture-jsx */
import { HeroBlock } from "../../blocks/_blocks/hero";
import { PricingTableBlock } from "../../blocks/_blocks/pricing-table";
import { FaqBlock } from "../../blocks/_blocks/faq";
import { CtaBlock } from "../../blocks/_blocks/cta";

// 定价页 —— 主视觉 + 定价表 + 常见问题 + 行动号召,聚焦转化。
export function PricingPage() {
  return (
    <div className="bg-bg">
      <HeroBlock />
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <PricingTableBlock />
        </div>
      </section>
      <FaqBlock />
      <CtaBlock />
    </div>
  );
}
