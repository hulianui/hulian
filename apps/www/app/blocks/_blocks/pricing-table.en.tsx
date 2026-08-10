"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardBody, cn, Divider, Heading, Segmented, ShimmerButton, Stack, Tag, Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@hulianui/ui";
import { Check, HelpCircle } from "lucide-react";
interface Plan {
    name: string;
    tagline: string;
    monthly: number;
    yearly: number;
    customPrice?: string;
    features: string[];
    cta: string;
    highlight?: boolean;
}
const PLANS: Plan[] = [
    {
        name: "Getting started",
        tagline: "Personal projects and prototype verification",
        monthly: 0,
        yearly: 0,
        features: ["1 production project", "100 GB per month", "Community support", "Automatic HTTPS and global CDN", "For individuals"],
        cta: "Start for free",
    },
    {
        name: "Professional",
        tagline: "Growing team and production operations",
        monthly: 199,
        yearly: 1990,
        features: [
            "Unlimited projects",
            "1 TB per month",
            "Autoscaling compute",
            "Metrics / logs / distributed traces",
            "Up to 10 members",
            "Four-hour ticket response",
        ],
        cta: "Start a 14-day trial",
        highlight: true,
    },
    {
        name: "enterprise",
        tagline: "Compliance, private deployment, and dedicated support",
        monthly: 0,
        yearly: 0,
        customPrice: "Custom",
        features: [
            "Dedicated edge nodes and compute pool",
            "SOC 2 / Class III compliance",
            "SSO and fine-grained auditing",
            "Dedicated Customer Success Manager",
            "99.99% SLA guaranteed",
            "Private deployment optional",
        ],
        cta: "Book a demo",
    },
];
const FEATURE_TIPS: Record<string, string> = {
    "100 GB per month": "Additional usage costs \u00A50.30/GB; traffic is never cut off automatically.",
    "1 TB per month": "Additional usage costs \u00A50.25/GB. Set a budget cap to receive an early warning.",
    "Autoscaling compute": "Pay only for request execution time. Scale to zero when traffic stops, with no idle charges.",
    "Metrics / logs / distributed traces": "Built-in OpenTelemetry collection with 30 days of retention, ready from day one.",
    "Up to 10 members": "Add seats as needed for \u00A529 per user each month.",
    "Four-hour ticket response": "Guaranteed responses from 09:00 to 22:00 on business days, with 24/7 on-call coverage for P0 incidents.",
    "SOC 2 / Class III compliance": "Independent annual audits, with compliance documents available for enterprise procurement.",
    "SSO and fine-grained auditing": "SAML 2.0 and OIDC single sign-on with exportable audit logs.",
    "99.99% SLA guaranteed": "If monthly availability falls below the SLA, service credits are applied automatically.",
    "Private deployment optional": "Deploy to your own data center or private cloud. Contact sales for a tailored plan.",
};
function priceLabel(plan: Plan, period: "monthly" | "yearly") {
    if (plan.customPrice)
        return { amount: plan.customPrice, unit: "" };
    if (plan.monthly === 0)
        return { amount: "\u00A50", unit: "/ Free forever" };
    if (period === "yearly")
        return { amount: `\u00A5${plan.yearly.toLocaleString()}`, unit: "/year" };
    return { amount: `\u00A5${plan.monthly}`, unit: "/month" };
}
function PlanCard({ plan, period, ctaHref, }: {
    plan: Plan;
    period: "monthly" | "yearly";
    ctaHref: string;
}) {
    const { amount, unit } = priceLabel(plan, period);
    const yearlySave = plan.monthly > 0 && plan.yearly > 0
        ? Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100)
        : 0;
    return (<Card variant={plan.highlight ? "featured" : "outline"} className={cn("relative h-full overflow-hidden", plan.highlight && "lg:z-10 lg:scale-[1.04]")}>
      <CardBody className="flex h-full flex-col gap-5 p-6">
        <div>
          <Stack direction="row" align="center" gap={2}>
            <Heading level={3} size="lg" weight="semibold">
              {plan.name}
            </Heading>
            {plan.highlight && (<Tag variant="solid" tone="brand" size="sm">
                most popular
              </Tag>)}
          </Stack>
          <Text tone="muted" size="sm" className="mt-1">
            {plan.tagline}
          </Text>
        </div>

        <div className="flex items-end gap-1.5">
          <span className="text-4xl font-bold tracking-tight text-foreground">{amount}</span>
          {unit && (<Text tone="muted" size="sm" className="pb-1.5">
              {unit}
            </Text>)}
          {period === "yearly" && yearlySave > 0 && (<Tag variant="soft" tone="success" size="sm" className="mb-1.5 ml-1">
              Save {yearlySave}%
            </Tag>)}
        </div>

        {plan.highlight ? (<ShimmerButton className="w-full" render={<Link href={ctaHref}/>}>
            {plan.cta}
          </ShimmerButton>) : (<Button variant="outline" className="w-full" render={<Link href={ctaHref}/>}>
            {plan.cta}
          </Button>)}

        <Divider />

        <TooltipProvider delay={150}>
          <Stack direction="column" gap={3} className="flex-1">
            {plan.features.map((f) => (<Stack key={f} direction="row" align="start" gap={2}>
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden/>
                <Text size="sm" className="flex-1">
                  {f}
                </Text>
                {FEATURE_TIPS[f] && (<Tooltip>
                    <TooltipTrigger render={<button type="button" className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none" aria-label={`Learn more: ${f}`}>
                          <HelpCircle className="size-3.5" aria-hidden/>
                        </button>}/>
                    <TooltipContent side="top" className="max-w-[14rem]">
                      {FEATURE_TIPS[f]}
                    </TooltipContent>
                  </Tooltip>)}
              </Stack>))}
          </Stack>
        </TooltipProvider>
      </CardBody>
    </Card>);
}
export function PricingTableBlock({ ctaHref = "#" }: {
    ctaHref?: string;
}) {
    const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
    return (<div className="mx-auto w-full max-w-5xl">
      <Stack direction="row" justify="center" className="mb-10">
        <Segmented items={[
            { value: "monthly", label: "Pay monthly" },
            {
                value: "yearly",
                ariaLabel: "Pay annually and save 2 months",
                label: (<>
                  Pay annually
                  <Tag variant="soft" tone="success" size="sm">
                    Save 2 months
                  </Tag>
                </>),
            },
        ]} value={period} onValueChange={(v) => setPeriod(v as "monthly" | "yearly")}/>
      </Stack>
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (<PlanCard key={plan.name} plan={plan} period={period} ctaHref={ctaHref}/>))}
      </div>
    </div>);
}
