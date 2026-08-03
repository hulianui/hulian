import { Heading, Text, AuroraText, NumberTicker, } from "@hulianui/ui";
import { Gauge, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";
const values = [
    {
        icon: Sparkles,
        title: "Built for developers",
        desc: "From the first command to a global deployment, let the platform handle complexity so your team can stay focused.",
    },
    {
        icon: Gauge,
        title: "Peak performance",
        desc: "Edge networking and elastic compute run every request close to your users.",
    },
    {
        icon: ShieldCheck,
        title: "Secure by default",
        desc: "Encryption in transit, managed secrets, and fine-grained access controls make security foundational, not optional.",
    },
    {
        icon: HeartHandshake,
        title: "Long-term thinking",
        desc: "We grow with our customers and build observability, rollback, and reliability into every version.",
    },
];
const milestones = [
    { value: 120000, suffix: "+", label: "Developers served" },
    { value: 38, suffix: "", label: "Global edge nodes" },
    { value: 99.99, suffix: "%", label: "Service availability", decimals: 2 },
    { value: 50, suffix: "ms", label: "Average cold start" },
];
export function AboutBlock() {
    return (<section className="mx-auto max-w-5xl px-6 py-20">

      <div className="mx-auto max-w-3xl text-center">
        <Heading level={2} weight="bold" balance className="text-3xl leading-tight text-foreground sm:text-4xl">
          Every team can <AuroraText>Ship with confidence</AuroraText>
        </Heading>
        <Text tone="muted" size="lg" className="mt-5">
          HanCloud began with a simple idea: deployment should never block a release. Elastic compute, a global edge network, and end-to-end observability live on one focused platform, so developers can spend their time building products instead of managing infrastructure.
        </Text>
      </div>


      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, title, desc }) => (<div key={title} className="rounded-[var(--radius)] border border-border bg-surface p-6">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden/>
            </span>
            <Heading level={3} size="base" weight="semibold" className="mt-4 text-foreground">
              {title}
            </Heading>
            <Text tone="muted" size="sm" className="mt-2">
              {desc}
            </Text>
          </div>))}
      </div>


      <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-12 sm:grid-cols-4">
        {milestones.map((m) => (<div key={m.label} className="text-center">
            <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <NumberTicker value={m.value} decimalPlaces={m.decimals ?? 0}/>
              {m.suffix}
            </div>
            <Text tone="muted" size="sm" className="mt-1.5">
              {m.label}
            </Text>
          </div>))}
      </div>
    </section>);
}
