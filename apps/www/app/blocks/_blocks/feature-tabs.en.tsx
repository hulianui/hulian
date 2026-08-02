"use client";
import { Heading, Tabs, TabsList, TabsPanel, TabsTab, Tag, Text, } from "@hulianui/ui";
import { Check, Rocket, Activity, ShieldCheck, type LucideIcon, } from "lucide-react";
interface FeatureTab {
    value: string;
    label: string;
    icon: LucideIcon;
    headline: string;
    description: string;
    points: string[];
    gradient: string;
    metric: {
        label: string;
        value: string;
    };
}
const TABS: FeatureTab[] = [
    {
        value: "deploy",
        label: "Extremely fast deployment",
        icon: Rocket,
        headline: "Deploy on git push",
        description: "Go from commit to global availability in seconds. Cached builds finish almost instantly, and any failed release can be rolled back in one click.",
        points: [
            "Create and remove preview environments automatically with each pull request",
            "Content-addressed build artifacts reuse unchanged layers in seconds",
            "Roll back to any release in one click with zero downtime",
            "Atomic releases prevent partially deployed states",
        ],
        gradient: "from-[var(--color-chart-1)]/25 to-[var(--color-chart-2)]/10",
        metric: { label: "Average deployment time", value: "28 seconds" },
    },
    {
        value: "observe",
        label: "End-to-end observability",
        icon: Activity,
        headline: "See metrics, logs, and traces in one place",
        description: "OpenTelemetry collection is built in, so every user request can be traced through downstream calls without maintaining your own stack.",
        points: [
            "Metrics, logs, and distributed traces out of the box",
            "30 days data retention, extendable on demand",
            "Automatic exception clustering, attaching call stack and context",
            "Send alerts to Feishu, DingTalk, or any webhook",
        ],
        gradient: "from-[var(--color-chart-3)]/25 to-[var(--color-chart-1)]/10",
        metric: { label: "Median time to diagnose", value: "4 minutes" },
    },
    {
        value: "secure",
        label: "Enterprise-grade security",
        icon: ShieldCheck,
        headline: "Managed compliance and access control",
        description: "SOC 2 and MLPS Level 3 compliance, managed secrets, fine-grained permissions, and a complete audit trail for every change.",
        points: [
            "SSO single sign-on and fine-grained role permissions",
            "Encrypted secret management with no plaintext logs",
            "Isolated environments with separate approval for production configuration",
            "Complete audit logs with exportable records",
        ],
        gradient: "from-[var(--color-chart-4)]/25 to-[var(--color-chart-5)]/10",
        metric: { label: "Compliance certification", value: "SOC 2" },
    },
];
function PreviewPanel({ tab }: {
    tab: FeatureTab;
}) {
    const Icon = tab.icon;
    return (<div className={`relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${tab.gradient} p-6`}>
      <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface/80 backdrop-blur">
        <Icon className="size-5 text-primary" aria-hidden/>
      </div>
      <div className="rounded-xl border border-border bg-surface/80 p-4 backdrop-blur">
        <Text tone="muted" size="sm">
          {tab.metric.label}
        </Text>
        <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {tab.metric.value}
        </div>
      </div>
    </div>);
}
export function FeatureTabsBlock() {
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Platform capabilities
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Three foundations for the complete delivery path
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Click on the tags below to learn how deployment, observability, and security work together.
          </Text>
        </div>

        <Tabs defaultValue={TABS[0].value}>
          <div className="mb-8 flex justify-center">
            <TabsList variant="solid">
              {TABS.map((t) => {
            const Icon = t.icon;
            return (<TabsTab key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" aria-hidden/>
                      {t.label}
                    </span>
                  </TabsTab>);
        })}
            </TabsList>
          </div>

          {TABS.map((t) => (<TabsPanel key={t.value} value={t.value}>
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <Heading level={3} size="xl" weight="semibold" className="text-foreground">
                    {t.headline}
                  </Heading>
                  <Text tone="muted" size="lg">
                    {t.description}
                  </Text>
                  <ul className="mt-2 flex flex-col gap-3">
                    {t.points.map((p) => (<li key={p} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="size-3 text-primary" aria-hidden/>
                        </span>
                        <Text size="sm" className="flex-1">
                          {p}
                        </Text>
                      </li>))}
                  </ul>
                </div>
                <PreviewPanel tab={t}/>
              </div>
            </TabsPanel>))}
        </Tabs>
      </div>
    </section>);
}
