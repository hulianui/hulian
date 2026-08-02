import { copy } from "./pricing-teaser.content";
import { demoHref } from "../../../_components/demo-locale";
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
      eyebrow={copy("pricing")}
      title={copy("usageBasedPricingThatScalesWithYourTeam")}
      subtitle={copy("startFreeAndScaleToEnterpriseComplianceAndDedicatedSupportWithTransparentPricingAndNoSurpriseBil")}
      className="border-b border-border bg-surface/30"
    >
      <PricingCards period="monthly" />
      <div className="mt-10 text-center">
        <Button variant="ghost" render={<Link href={demoHref("/demos/website/pricing")} />}>

          {copy("viewTheFullPlanComparison")}
          <ArrowRight className="ml-2 size-4" aria-hidden />
        </Button>
      </div>
    </Section>
  );
}
