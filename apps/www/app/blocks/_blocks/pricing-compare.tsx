/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";
import Link from "next/link";
import {
  Button,
  cn,
  Heading,
  ShimmerButton,
  Table,
  Tag,
  Text,
  type ColumnDef,
} from "@hulianui/ui";
import { Check, Minus } from "lucide-react";

// 定价对比矩阵 Block —— 自包含、可整段复制。
// 与 PricingTableBlock（三卡片）风格区隔：这里是「功能 × 套餐」横向矩阵，适合逐项细对比。
// 顶部三套餐列头（名称 + 价格 + CTA），推荐列高亮；下方按分组列出功能，
// 单元格用 ✓ / — 或具体数值。数据全部内联，复制后改 PLANS / GROUPS 即可。

type Cell = boolean | string;

interface ComparePlan {
  /** 套餐唯一键，与功能行的 values key 对应。 */
  key: string;
  name: string;
  price: string;
  /** 价格单位 / 副标，如「/ 月」「永久免费」。 */
  unit: string;
  cta: string;
  highlight?: boolean;
}

interface FeatureRow {
  feature: string;
  /** 每套餐在该功能上的取值：true=含、false=不含、字符串=具体数值。 */
  values: Record<string, Cell>;
}

interface FeatureGroup {
  group: string;
  rows: FeatureRow[];
}

const PLANS: ComparePlan[] = [
  { key: "starter", name: "入门", price: "¥0", unit: "永久免费", cta: "免费开始" },
  {
    key: "pro",
    name: "专业",
    price: "¥199",
    unit: "/ 月",
    cta: "开始试用",
    highlight: true,
  },
  { key: "enterprise", name: "企业", price: "定制", unit: "按需报价", cta: "预约演示" },
];

const GROUPS: FeatureGroup[] = [
  {
    group: "部署与算力",
    rows: [
      { feature: "生产项目数", values: { starter: "1 个", pro: "无限", enterprise: "无限" } },
      {
        feature: "每月流量配额",
        values: { starter: "100 GB", pro: "1 TB", enterprise: "自定义" },
      },
      {
        feature: "弹性算力自动伸缩",
        values: { starter: false, pro: true, enterprise: true },
      },
      {
        feature: "专属边缘节点",
        values: { starter: false, pro: false, enterprise: true },
      },
    ],
  },
  {
    group: "可观测与协作",
    rows: [
      {
        feature: "指标 / 日志 / 链路追踪",
        values: { starter: "7 天", pro: "30 天", enterprise: "自定义" },
      },
      { feature: "团队成员", values: { starter: "1 人", pro: "10 人", enterprise: "无限" } },
      {
        feature: "环境隔离与变更审计",
        values: { starter: false, pro: true, enterprise: true },
      },
    ],
  },
  {
    group: "安全与支持",
    rows: [
      {
        feature: "SSO 单点登录",
        values: { starter: false, pro: false, enterprise: true },
      },
      {
        feature: "SOC 2 / 等保三级合规",
        values: { starter: false, pro: false, enterprise: true },
      },
      {
        feature: "工单响应时效",
        values: { starter: "社区", pro: "4 小时", enterprise: "专属经理" },
      },
      {
        feature: "SLA 可用性保障",
        values: { starter: "—", pro: "99.9%", enterprise: "99.99%" },
      },
    ],
  },
];

// 把分组打平成单层行，再用一个虚拟「分组标题行」插在每组前面（feature 占位，values 空）。
type MatrixRow =
  | { kind: "group"; group: string }
  | ({ kind: "feature" } & FeatureRow);

function flatten(groups: FeatureGroup[]): MatrixRow[] {
  return groups.flatMap((g) => [
    { kind: "group" as const, group: g.group },
    ...g.rows.map((r) => ({ kind: "feature" as const, ...r })),
  ]);
}

function CellValue({ value }: { value: Cell }) {
  if (value === true)
    return <Check className="mx-auto size-4 text-primary" aria-label="包含" />;
  if (value === false)
    return <Minus className="mx-auto size-4 text-muted-foreground" aria-label="不包含" />;
  return <span className="tabular-nums text-foreground">{value}</span>;
}

export function PricingCompareBlock({ ctaHref = "#" }: { ctaHref?: string }) {
  const rows = flatten(GROUPS);

  // 首列固定为功能名（贴左），其余三列对应套餐。表头单元格自带价格 + CTA。
  const columns: ColumnDef<MatrixRow, any>[] = [
    {
      id: "feature",
      header: () => (
        <span className="text-sm font-semibold text-foreground">功能</span>
      ),
      meta: { sticky: "left" },
      cell: ({ row }) => {
        const r = row.original;
        if (r.kind === "group")
          return (
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {r.group}
            </span>
          );
        return <span className="text-sm text-foreground">{r.feature}</span>;
      },
    },
    ...PLANS.map<ColumnDef<MatrixRow, any>>((plan) => ({
      id: plan.key,
      header: () => (
        <div
          className={cn(
            "flex flex-col items-center gap-2 py-1",
            plan.highlight && "rounded-lg",
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">{plan.name}</span>
            {plan.highlight && (
              <Tag variant="solid" tone="brand" size="sm">
                推荐
              </Tag>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {plan.price}
            </span>
            <span className="text-xs text-muted-foreground">{plan.unit}</span>
          </div>
          {plan.highlight ? (
            <ShimmerButton className="w-full" render={<Link href={ctaHref} />}>
              {plan.cta}
            </ShimmerButton>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href={ctaHref} />}
            >
              {plan.cta}
            </Button>
          )}
        </div>
      ),
      cell: ({ row }) => {
        const r = row.original;
        if (r.kind === "group") return null;
        return (
          <div className="text-center text-sm">
            <CellValue value={r.values[plan.key] ?? false} />
          </div>
        );
      },
    })),
  ];

  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            逐项对比
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            选一个刚好够用的套餐
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            把每一项能力摊开放在一张表里，按需对比，不为用不到的功能多花一分钱。
          </Text>
        </div>

        <Table<MatrixRow>
          columns={columns}
          data={rows}
          enableSorting={false}
          striped={false}
          density="middle"
          getRowId={(r, i) => (r.kind === "group" ? `g-${r.group}` : `f-${r.feature}-${i}`)}
        />

        <Text tone="muted" size="sm" className="mt-4 text-center">
          所有套餐均含自动 HTTPS、全球 CDN 与无限次部署。价格不含税。
        </Text>
      </div>
    </section>
  );
}
