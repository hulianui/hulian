import { BentoGrid, BentoCard, BorderBeam, Heading, Tag, Text } from "@hulianui/ui";
import { Rocket, Cpu, Globe, Activity, ShieldCheck, Users, type LucideIcon } from "lucide-react";
interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
    span?: string;
}
const FEATURES: Feature[] = [
    {
        icon: Rocket,
        title: "One-click deployment",
        description: "Deploy on git push, complete cached builds in seconds, and roll back a failed release to any previous version in one click.",
        span: "sm:col-span-2",
    },
    {
        icon: Cpu,
        title: "Elastic compute",
        description: "Automatically scales up and down based on requests, and returns to zero when idle without billing.",
    },
    {
        icon: Globe,
        title: "Global Edge Network",
        description: "Serve static assets and functions close to users from 320 edge nodes.",
    },
    {
        icon: Activity,
        title: "End-to-end observability",
        description: "Metrics, logs, and distributed traces work out of the box, with no collection stack to maintain.",
        span: "sm:col-span-2",
    },
    {
        icon: ShieldCheck,
        title: "Enterprise-grade security",
        description: "SOC 2 Type II and MLPS Level 3 compliance, with managed secrets and complete auditing.",
    },
    {
        icon: Users,
        title: "Teamwork",
        description: "Fine-grained role permissions, environment isolation and change auditing allow multiple teams to safely share a platform.",
        span: "sm:col-span-2",
    },
];
export function FeaturesBlock() {
    return (<section id="features" className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Platform capabilities
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            One platform for every step from code to production
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Deployment, elastic compute, and end-to-end observability work together, without a patchwork of tools and scripts.
          </Text>
        </div>
        <BentoGrid className="sm:auto-rows-[11rem]">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            const isWide = f.span?.includes("col-span-2");
            return (<BentoCard key={f.title} className={f.span} icon={<Icon aria-hidden/>} title={f.title} description={f.description}>
                {isWide && <BorderBeam size={70} duration={9} className="opacity-70"/>}
              </BentoCard>);
        })}
        </BentoGrid>
      </div>
    </section>);
}
