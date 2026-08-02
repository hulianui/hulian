import Link from "next/link";
import { AuroraText, BorderBeam, Button, Heading, ShimmerButton, Tag, Text, } from "@hulianui/ui";
import { ArrowRight, Sparkles } from "lucide-react";
export function CtaCardBlock({ ctaHref = "#", secondaryHref = "#", }: {
    ctaHref?: string;
    secondaryHref?: string;
}) {
    return (<section className="px-6 py-20 sm:py-24">
      <div data-surface="inverse" className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[var(--color-chart-2)] to-[var(--color-chart-4)] px-6 py-16 text-center sm:px-14 sm:py-20">

        <BorderBeam size={120} duration={8} borderWidth={2}/>
        <BorderBeam size={120} duration={8} delay={4} reverse colorFrom="var(--color-chart-4)" colorTo="var(--color-primary-foreground)" borderWidth={2}/>

        <div className="relative flex flex-col items-center gap-5">
          <Tag variant="soft" tone="brand" icon={<Sparkles className="size-3.5" aria-hidden/>}>
            Limited-time welcome offer
          </Tag>

          <Heading level={2} size="4xl" weight="bold" balance>
            Make the team run faster,
            <br className="hidden sm:block"/>
            From HanCloud{" "}
            <AuroraText className="font-bold">Now</AuroraText>{" "}
            start
          </Heading>

          <Text size="lg" className="max-w-xl text-white/85">
            A unified cloud development platform managed end to end, from code to production. Sign up for 30 days of Pro; you won't be charged automatically when the credit runs out.
          </Text>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <ShimmerButton background="var(--color-primary-foreground)" shimmerColor="var(--color-primary)" className="text-primary" render={<Link href={ctaHref}/>}>
              Claim free credits
              <ArrowRight className="ml-2 size-4" aria-hidden/>
            </ShimmerButton>
            <Button variant="outline" size="lg" render={<Link href={secondaryHref}/>}>
              Book a demo
            </Button>
          </div>
        </div>
      </div>
    </section>);
}
