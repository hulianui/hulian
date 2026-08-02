"use client";
import Link from "next/link";
import { Button, cn, Heading, ShimmerButton, Table, Tag, Text, type ColumnDef, } from "@hulianui/ui";
import { Check, Minus } from "lucide-react";
type Cell = boolean | string;
interface ComparePlan {
    key: string;
    name: string;
    price: string;
    unit: string;
    cta: string;
    highlight?: boolean;
}
interface FeatureRow {
    feature: string;
    values: Record<string, Cell>;
}
interface FeatureGroup {
    group: string;
    rows: FeatureRow[];
}
const PLANS: ComparePlan[] = [
    { key: "starter", name: "Getting started", price: "\u00A50", unit: "Free forever", cta: "Start for free" },
    {
        key: "pro",
        name: "Professional",
        price: "\u00A5199",
        unit: "/month",
        cta: "Start trial",
        highlight: true,
    },
    { key: "enterprise", name: "enterprise", price: "Custom", unit: "Contact us for pricing", cta: "Book a demo" },
];
const GROUPS: FeatureGroup[] = [
    {
        group: "Deployment and compute",
        rows: [
            { feature: "Production projects", values: { starter: "1", pro: "unlimited", enterprise: "unlimited" } },
            {
                feature: "Monthly traffic quota",
                values: { starter: "100 GB", pro: "1 TB", enterprise: "Customize" },
            },
            {
                feature: "Autoscaling compute",
                values: { starter: false, pro: true, enterprise: true },
            },
            {
                feature: "Dedicated edge node",
                values: { starter: false, pro: false, enterprise: true },
            },
        ],
    },
    {
        group: "Observability and collaboration",
        rows: [
            {
                feature: "Metrics / logs / distributed traces",
                values: { starter: "7 days", pro: "30 days", enterprise: "Customize" },
            },
            { feature: "team member", values: { starter: "1 person", pro: "10 people", enterprise: "unlimited" } },
            {
                feature: "Environment isolation and change auditing",
                values: { starter: false, pro: true, enterprise: true },
            },
        ],
    },
    {
        group: "Security and support",
        rows: [
            {
                feature: "SSO single sign-on",
                values: { starter: false, pro: false, enterprise: true },
            },
            {
                feature: "SOC 2 / Class III compliance",
                values: { starter: false, pro: false, enterprise: true },
            },
            {
                feature: "Ticket response time",
                values: { starter: "Community", pro: "4 hours", enterprise: "Dedicated manager" },
            },
            {
                feature: "SLA-backed availability",
                values: { starter: "\u2014", pro: "99.9%", enterprise: "99.99%" },
            },
        ],
    },
];
type MatrixRow = {
    kind: "group";
    group: string;
} | ({
    kind: "feature";
} & FeatureRow);
function flatten(groups: FeatureGroup[]): MatrixRow[] {
    return groups.flatMap((g) => [
        { kind: "group" as const, group: g.group },
        ...g.rows.map((r) => ({ kind: "feature" as const, ...r })),
    ]);
}
function CellValue({ value }: {
    value: Cell;
}) {
    if (value === true)
        return <Check className="mx-auto size-4 text-primary" aria-label="Includes"/>;
    if (value === false)
        return <Minus className="mx-auto size-4 text-muted" aria-label="Not included"/>;
    return <span className="tabular-nums text-foreground">{value}</span>;
}
export function PricingCompareBlock({ ctaHref = "#" }: {
    ctaHref?: string;
}) {
    const rows = flatten(GROUPS);
    const columns: ColumnDef<MatrixRow, any>[] = [
        {
            id: "feature",
            header: () => (<span className="text-sm font-semibold text-foreground">Features</span>),
            meta: { sticky: "left" },
            cell: ({ row }) => {
                const r = row.original;
                if (r.kind === "group")
                    return (<span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {r.group}
            </span>);
                return <span className="text-sm text-foreground">{r.feature}</span>;
            },
        },
        ...PLANS.map<ColumnDef<MatrixRow, any>>((plan) => ({
            id: plan.key,
            header: () => (<div className={cn("flex flex-col items-center gap-2 py-1", plan.highlight && "rounded-lg")}>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">{plan.name}</span>
            {plan.highlight && (<Tag variant="solid" tone="brand" size="sm">
                Recommended
              </Tag>)}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {plan.price}
            </span>
            <span className="text-xs text-muted">{plan.unit}</span>
          </div>
          {plan.highlight ? (<ShimmerButton className="w-full" render={<Link href={ctaHref}/>}>
              {plan.cta}
            </ShimmerButton>) : (<Button variant="outline" size="sm" className="w-full" render={<Link href={ctaHref}/>}>
              {plan.cta}
            </Button>)}
        </div>),
            cell: ({ row }) => {
                const r = row.original;
                if (r.kind === "group")
                    return null;
                return (<div className="text-center text-sm">
            <CellValue value={r.values[plan.key] ?? false}/>
          </div>);
            },
        })),
    ];
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Compare features
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Choose the plan that fits
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Compare every capability side by side and pay only for what you need.
          </Text>
        </div>

        <Table<MatrixRow> columns={columns} data={rows} enableSorting={false} striped={false} density="middle" getRowId={(r, i) => (r.kind === "group" ? `g-${r.group}` : `f-${r.feature}-${i}`)}/>

        <Text tone="muted" size="sm" className="mt-4 text-center">
          All plans include automatic HTTPS, global CDN, and unlimited deployments. Prices do not include tax.
        </Text>
      </div>
    </section>);
}
