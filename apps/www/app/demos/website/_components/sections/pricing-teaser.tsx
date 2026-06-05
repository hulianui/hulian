import Link from "next/link";
import { Button } from "@hulianui/ui";
import { ArrowRight } from "lucide-react";
import { Section } from "../section";
import { PricingCards } from "../pricing-cards";

// 首页定价预览：按月价目 + 跳转完整定价页。
export function PricingTeaser() {
  return (
    <Section
      id="pricing"
      eyebrow="定价"
      title="按用量付费，随团队成长"
      subtitle="从免费起步，到企业级合规与专属支持——透明、可预测，没有意外账单。"
      className="border-b border-border bg-surface/30"
    >
      <PricingCards period="monthly" />
      <div className="mt-10 text-center">
        <Button variant="ghost" render={<Link href="/demos/website/pricing" />}>
          查看完整套餐对比
          <ArrowRight className="ml-2 size-4" aria-hidden />
        </Button>
      </div>
    </Section>
  );
}
