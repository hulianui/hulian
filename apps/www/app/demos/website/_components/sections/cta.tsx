import { copy } from "./cta.content";
import { demoHref } from "../../../_components/demo-locale";
import Link from "next/link";
import { ShimmerButton, Button, Heading, Text, Meteors } from "@hulianui/ui";
import { ArrowRight } from "lucide-react";

// 结尾行动号召：主色面板 + Meteors 流星 + 双 CTA。
// data-surface="inverse"：在该子树重映射中性 token，Heading/Text/Button 自动反色，无逐元素颜色补丁。
export function Cta() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div
        data-surface="inverse"
        className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center sm:px-12"
      >
        <Meteors number={24} className="text-border" />
        <div className="relative flex flex-col items-center gap-5">
          <Heading level={2} size="3xl" weight="bold" balance>

            {copy("deployYourFirstProjectOnHancloudIn5Minutes")}
          </Heading>
          <Text tone="muted" size="lg" className="max-w-xl">

            {copy("startFreeWithNoCreditCardTalkToOurTeamWhenYouNeedHelpWithScaleOrCompliance")}
          </Text>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <ShimmerButton
              background="var(--color-primary-foreground)"
              shimmerColor="var(--color-primary)"
              className="text-primary"
              render={<Link href={demoHref("/demos/website/contact")} />}
            >

              {copy("startForFree")}
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </ShimmerButton>
            <Button variant="outline" size="lg" render={<Link href={demoHref("/demos/website/pricing")} />}>

              {copy("comparePlans")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
