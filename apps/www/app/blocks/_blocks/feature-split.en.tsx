import { Heading, Tag, Text } from "@hulianui/ui";
const FEATURES: Array<{
    tag: string;
    title: string;
    desc: string;
    points: string[];
    gradient: string;
}> = [
    {
        tag: "Real-time observability",
        title: "See everything that happens in the system",
        desc: "HanCloud brings per-request distributed traces and fleet-wide metrics into one drill-down view, so teams can diagnose incidents instead of guessing.",
        points: [
            "Distributed tracing across the complete service call path",
            "Customize sampling strategies to precisely balance cost and coverage",
            "Automatic attribution surfaces rare failures as soon as they occur",
        ],
        gradient: "from-primary/25 via-accent/15 to-bg",
    },
    {
        tag: "Elastic compute",
        title: "Scale on demand and respond to traffic in milliseconds",
        desc: "Runtime snapshots and warm pools let serverless functions scale to zero when idle and expand immediately for traffic spikes without compromising the cold-start experience.",
        points: [
            "P50 cold starts under 400 ms",
            "Scale to zero with no idle charges",
            "Scale for traffic spikes in seconds without reserving capacity",
        ],
        gradient: "from-accent/25 via-primary/15 to-bg",
    },
    {
        tag: "Global edge",
        title: "Run compute close to your users",
        desc: "Edge nodes across three continents serve static and dynamic content close to users, while consistent origin routing balances low latency with data integrity.",
        points: [
            "Global edge nodes with average origin latency below 20 ms",
            "Choose the consistency model that fits each workload",
            "Smart routing automatically avoids congestion and unhealthy regions",
        ],
        gradient: "from-primary/20 via-accent/20 to-bg",
    },
];
function PreviewPanel({ gradient }: {
    gradient: string;
}) {
    return (<div className={`aspect-[4/3] rounded-xl border border-border bg-gradient-to-br ${gradient} p-6`}>
      <div className="flex h-full flex-col gap-3">
        <div className="h-3 w-1/3 rounded-full bg-foreground/15"/>
        <div className="h-2.5 w-2/3 rounded-full bg-foreground/10"/>
        <div className="h-2.5 w-1/2 rounded-full bg-foreground/10"/>
        <div className="mt-auto grid grid-cols-3 gap-3">
          <div className="h-12 rounded-lg bg-foreground/10"/>
          <div className="h-12 rounded-lg bg-foreground/[0.07]"/>
          <div className="h-12 rounded-lg bg-foreground/10"/>
        </div>
      </div>
    </div>);
}
export function FeatureSplitBlock() {
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-16 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Core capabilities
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Three cornerstones supporting modern applications
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Observability, elasticity, and edge proximity—HanCloud distills complex infrastructure into three clear pillars.
          </Text>
        </div>

        <div className="flex flex-col gap-16 lg:gap-24">
          {FEATURES.map((feature, i) => {
            const flip = i % 2 === 1;
            return (<div key={feature.tag} className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="flex flex-col gap-5">
                  <Tag variant="soft" tone="neutral" size="sm">
                    {feature.tag}
                  </Tag>
                  <Heading level={3} size="2xl" weight="semibold" balance className="text-foreground">
                    {feature.title}
                  </Heading>
                  <Text tone="muted" size="base">
                    {feature.desc}
                  </Text>
                  <ul className="flex flex-col gap-3">
                    {feature.points.map((point) => (<li key={point} className="flex items-start gap-3">
                        <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 text-primary" fill="none" aria-hidden>
                          <circle cx="10" cy="10" r="9" className="fill-primary/10"/>
                          <path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <Text size="sm" className="text-foreground">
                          {point}
                        </Text>
                      </li>))}
                  </ul>
                </div>
                <PreviewPanel gradient={feature.gradient}/>
              </div>);
        })}
        </div>
      </div>
    </section>);
}
