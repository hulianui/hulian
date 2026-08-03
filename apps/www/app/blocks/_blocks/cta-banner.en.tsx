import Link from "next/link";
import { Button, Heading, Text } from "@hulianui/ui";
import { ArrowRight } from "lucide-react";
export function CtaBannerBlock({ ctaHref = "#", secondaryHref = "#", }: {
    ctaHref?: string;
    secondaryHref?: string;
}) {
    return (<section className="px-6 py-12 sm:py-16">
      <div data-surface="inverse" className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-[var(--color-chart-2)] px-6 py-8 text-center sm:px-10 md:flex-row md:justify-between md:gap-8 md:text-left">
        <div className="flex flex-col gap-1.5 md:max-w-2xl">
          <Heading level={2} size="xl" weight="bold" balance>
            Are you ready to move your project to HanCloud?
          </Heading>
          <Text size="base" className="text-white/85">
            Get started in minutes with usage-based pricing, on-demand scaling, and team collaboration built in.
          </Text>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="bg-white text-primary shadow-sm hover:bg-white/90" render={<Link href={ctaHref}/>}>
            Start for free
            <ArrowRight className="ml-2 size-4" aria-hidden/>
          </Button>
          <Button variant="outline" size="lg" render={<Link href={secondaryHref}/>}>
            Contact sales
          </Button>
        </div>
      </div>
    </section>);
}
