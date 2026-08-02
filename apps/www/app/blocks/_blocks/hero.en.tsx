import Link from "next/link";
import { AuroraText, Button, ShimmerButton, Tag, Heading, Text, DotPattern, } from "@hulianui/ui";
import { ArrowRight, Zap } from "lucide-react";
const DESCRIPTION = "HanCloud takes you from git push to a global release with deployment, elastic compute, and end-to-end observability on one platform.";
export function HeroBlock({ ctaHref = "#", secondaryHref = "#", }: {
    ctaHref?: string;
    secondaryHref?: string;
}) {
    return (<section className="relative overflow-hidden border-b border-border">
      <DotPattern className="text-border/60 [mask-image:radial-gradient(60%_55%_at_50%_30%,white,transparent)]"/>
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <Tag variant="soft" tone="brand" size="md" icon={<Zap className="size-3.5"/>}>
          Version 3 · Elastic compute scales to zero when idle
        </Tag>

        <Heading level={1} weight="bold" balance className="text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
          Send the application <AuroraText>Global edge</AuroraText>
          <br className="hidden sm:block"/> Just one git push
        </Heading>

        <Text tone="muted" size="lg" className="max-w-2xl">
          {DESCRIPTION}
        </Text>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <ShimmerButton render={<Link href={ctaHref}/>}>
            Start for free
            <ArrowRight className="ml-2 size-4" aria-hidden/>
          </ShimmerButton>
          <Button variant="outline" size="lg" render={<Link href={secondaryHref}/>}>
            View pricing
          </Button>
        </div>

        <Text tone="muted" size="sm">
          No credit card required · Launch your first project in 5 minutes
        </Text>
      </div>
    </section>);
}
