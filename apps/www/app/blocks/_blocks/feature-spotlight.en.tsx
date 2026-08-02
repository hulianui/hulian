import Link from "next/link";
import { CardSpotlight, Heading, Tag, Text } from "@hulianui/ui";
import { Gauge, ShieldCheck, ArrowRight, type LucideIcon } from "lucide-react";
interface SpotlightCard {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  color: string;
  stats: {
    label: string;
    value: string;
  }[];
}
const CARDS: SpotlightCard[] = [
  {
    icon: Gauge,
    eyebrow: "Performance",
    title: "Edge runtime built for speed",
    description:
      "Requests start on the nearest edge node and respond in milliseconds. Capacity scales with traffic, returns to zero afterward, and costs nothing while idle.",
    href: "https://example.com/#performance",
    cta: "View the performance white paper",
    color: "var(--color-chart-1)",
    stats: [
      { label: "edge node", value: "320+" },
      { label: "Cold start P95", value: "18 ms" },
      { label: "Autoscaling limit", value: "unlimited" },
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: "Security",
    title: "Secure by default, with no extra configuration",
    description:
      "Issue and renew HTTPS certificates automatically, manage encrypted secrets, and record every change in the audit trail. We handle compliance so you can focus on the product.",
    href: "https://example.com/#security",
    cta: "Learn about compliance and auditing",
    color: "var(--color-chart-3)",
    stats: [
      { label: "Compliance certification", value: "SOC 2" },
      { label: "Certificate renewal", value: "Fully automatic" },
      { label: "Audit retention", value: "365 days" },
    ],
  },
];
function SpotlightFeatureCard({ card }: { card: SpotlightCard }) {
  const Icon = card.icon;
  return (
    <CardSpotlight color={card.color} radius={320} className="h-full p-8">
      <div className="flex h-full flex-col gap-5">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface">
          <Icon className="size-6 text-primary" aria-hidden />
        </div>

        <div className="flex flex-col gap-2">
          <Tag variant="soft" tone="brand" size="sm" className="self-start">
            {card.eyebrow}
          </Tag>
          <Heading level={3} size="xl" weight="semibold" className="text-foreground">
            {card.title}
          </Heading>
          <Text tone="muted" size="lg">
            {card.description}
          </Text>
        </div>

        <dl className="mt-2 grid grid-cols-3 gap-3 border-t border-border pt-5">
          {card.stats.map((s) => (
            <div key={s.label}>
              <dd className="text-xl font-bold tracking-tight text-foreground">{s.value}</dd>
              <dt className="mt-0.5 text-xs text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>

        <Link
          href={card.href}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary transition-colors hover:text-foreground"
        >
          {card.cta}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </CardSpotlight>
  );
}
export function FeatureSpotlightBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Why choose Hulian Cloud
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Fast, reliable, and secure by default
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Hover over the cards to see the two safeguards applied to every request.
          </Text>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {CARDS.map((card) => (
            <SpotlightFeatureCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
