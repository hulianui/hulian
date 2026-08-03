import Link from "next/link";
import { AuroraText, Button, Safari, Tag, Heading, Text } from "@hulianui/ui";
import { ArrowRight, Sparkles } from "lucide-react";
export function HeroSplitBlock({ ctaHref = "#", secondaryHref = "#", }: {
    ctaHref?: string;
    secondaryHref?: string;
}) {
    return (<section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-10 md:py-28">

        <div className="flex flex-col items-start gap-6 text-left">
          <Tag variant="soft" tone="brand" size="md" icon={<Sparkles className="size-3.5"/>}>
            New console · Live deployment preview
          </Tag>

          <Heading level={1} weight="bold" balance className="text-4xl leading-tight text-foreground sm:text-5xl">
            Built for teams <AuroraText>Cloud workbench</AuroraText>
          </Heading>

          <Text tone="muted" size="lg" className="max-w-md">
            Manage deployments, compute, and telemetry in one place. HanCloud takes each commit global while keeping your app available and scaling on demand.
          </Text>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href={ctaHref}/>}>
              Start for free
              <ArrowRight className="ml-2 size-4" aria-hidden/>
            </Button>
            <Button variant="outline" size="lg" render={<Link href={secondaryHref}/>}>
              Book a demo
            </Button>
          </div>

          <Text tone="muted" size="sm">
            More than 1,200 teams run production applications on HanCloud
          </Text>
        </div>


        <div className="relative">
          <Safari url="console.hulian.cloud" className="shadow-xl">
            <div className="aspect-[16/10] w-full bg-gradient-to-br from-primary/15 via-bg to-brand/10 p-5">

              <div className="flex h-full gap-3">
                <div className="flex w-28 shrink-0 flex-col gap-2">
                  <div className="h-6 rounded-md bg-primary/25"/>
                  <div className="h-4 rounded bg-border/70"/>
                  <div className="h-4 w-4/5 rounded bg-border/70"/>
                  <div className="h-4 w-3/5 rounded bg-border/70"/>
                  <div className="mt-auto h-8 rounded-md bg-primary/20"/>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 rounded-lg bg-surface shadow-sm ring-1 ring-border/60"/>
                    <div className="h-16 rounded-lg bg-surface shadow-sm ring-1 ring-border/60"/>
                    <div className="h-16 rounded-lg bg-surface shadow-sm ring-1 ring-border/60"/>
                  </div>
                  <div className="flex-1 rounded-lg bg-surface p-4 shadow-sm ring-1 ring-border/60">
                    <div className="flex items-end gap-2">
                      <div className="h-10 w-full rounded bg-primary/30"/>
                      <div className="h-16 w-full rounded bg-primary/40"/>
                      <div className="h-8 w-full rounded bg-primary/25"/>
                      <div className="h-20 w-full rounded bg-brand/40"/>
                      <div className="h-12 w-full rounded bg-primary/30"/>
                      <div className="h-14 w-full rounded bg-primary/35"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Safari>
        </div>
      </div>
    </section>);
}
