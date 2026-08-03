import Link from "next/link";
import { ShimmerButton, Button, Heading, Text, Meteors } from "@hulianui/ui";
import { ArrowRight } from "lucide-react";
export function CtaBlock({ ctaHref = "#", secondaryHref = "#", }: {
    ctaHref?: string;
    secondaryHref?: string;
}) {
    return (<section className="px-6 py-20 sm:py-24">
      <div data-surface="inverse" className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center sm:px-12">
        <Meteors number={24} className="text-border"/>
        <div className="relative flex flex-col items-center gap-5">
          <Heading level={2} size="3xl" weight="bold" balance>
            Deploy your first project on HanCloud in 5 minutes
          </Heading>
          <Text tone="muted" size="lg" className="max-w-xl">
            Start free with no credit card. Talk to our team when you need help with scale or compliance.
          </Text>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <ShimmerButton background="var(--color-primary-foreground)" shimmerColor="var(--color-primary)" className="text-primary" render={<Link href={ctaHref}/>}>
              Start for free
              <ArrowRight className="ml-2 size-4" aria-hidden/>
            </ShimmerButton>
            <Button variant="outline" size="lg" render={<Link href={secondaryHref}/>}>
              Compare plans
            </Button>
          </div>
        </div>
      </div>
    </section>);
}
