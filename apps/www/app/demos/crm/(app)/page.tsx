"use client";
import { copy } from "./page.content";

import Link from "next/link";
import { CircleDollarSign, Target, UserPlus, Users } from "lucide-react";
import {
  AreaChart,
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  ListItemMeta,
  PieChart,
  Stat,
  Tag,
  Text,
} from "@hulianui/ui";
import { customers } from "../_data/customers";
import { metrics, monthlyTrend, stageDistribution } from "../_data/metrics";
import { customerOwnerLabel, customerStatusLabel, customerStatusTone, yuan } from "../_data/status";

const trend = monthlyTrend();
const stage = stageDistribution();
const recentCustomers = [...customers].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);

const todos = [
  { id: "t1", text: copy("mGStationeryMultiYearDiscountFor"), due: copy("today"), tone: "danger" as const },
  { id: "t2", text: copy("yunqiTechnologySaasQuotationV2AwaitsCustomer"), due: copy("today2"), tone: "warning" as const },
  { id: "t3", text: copy("auroraNewEnergyChargingNetworkManagementBusiness"), due: copy("tomorrow"), tone: "warning" as const },
  { id: "t4", text: copy("ruikangPharmaceuticalGmpCasesInTheSame"), due: "6/5", tone: "brand" as const },
  { id: "t5", text: copy("zhixingEducationGreenfieldAgricultureNewLeadsTo"), due: copy("thisWeek"), tone: "neutral" as const },
];

function StatCard({
  label,
  value,
  delta,
  icon,
  iconClass,
}: {
  label: string;
  value: React.ReactNode;
  delta: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <Card variant="outline">
      <CardBody className="p-5">
        <Stat
          label={label}
          value={value}
          delta={delta}
          deltaLabel={copy("comparedWithLastMonth")}
          icon={<span className={`grid size-11 place-items-center rounded-[var(--radius)] ${iconClass}`}>{icon}</span>}
        />
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <Heading level={2} size="xl">{copy("workbench")}</Heading>
        <Text tone="muted" size="sm" className="mt-1">{copy("dashboardSummary", todos.length, metrics.following)}</Text>
      </header>

      {/* 指标卡 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={copy("totalNumberOfCustomers")}
          value={metrics.totalCustomers}
          delta={8.3}
          icon={<Users className="size-5" />}
          iconClass="bg-primary/12 text-primary"
        />
        <StatCard
          label={copy("newThisMonth")}
          value={metrics.newThisMonth}
          delta={33.3}
          icon={<UserPlus className="size-5" />}
          iconClass="bg-success/12 text-success"
        />
        <StatCard
          label={copy("businessOpportunityAmount")}
          value={yuan(metrics.pipelineAmount)}
          delta={12}
          icon={<Target className="size-5" />}
          iconClass="bg-warning/15 text-warning"
        />
        <StatCard
          label={copy("accumulatedTransactions")}
          value={yuan(metrics.totalRevenue)}
          delta={5.4}
          icon={<CircleDollarSign className="size-5" />}
          iconClass="bg-primary/12 text-primary"
        />
      </div>

      {/* 图表行 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outline" className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <Heading level={3} size="base">{copy("transactionTrend")}</Heading>
            <Text size="sm" tone="muted">{copy("lastMonthsYuan")}</Text>
          </CardHeader>
          <CardBody className="pt-0">
            <AreaChart data={trend} series={[{ key: "成交额", label: copy("turnover2") }]} xKey="month" height={260} />
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">{copy("businessOpportunityStageDistribution")}</Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <PieChart data={stage} donut height={260} />
          </CardBody>
        </Card>
      </div>

      {/* 列表行 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outline" className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <Heading level={3} size="base">{copy("recentCustomers")}</Heading>
            <Link href="/demos/crm/customers" className="text-sm text-primary hover:underline">{copy("viewAll")}</Link>
          </CardHeader>
          <CardBody className="pt-0">
            <List
              items={recentCustomers}
              split
              renderItem={(c) => (
                <ListItem
                  actions={[
                    <span key="amt" className="text-sm font-medium tabular-nums text-foreground">
                      {yuan(c.amount)}
                    </span>,
                    <Tag key="st" tone={customerStatusTone[c.status]} size="sm">
                      {customerStatusLabel[c.status]}
                    </Tag>,
                  ]}
                >
                  <ListItemMeta
                    avatar={<Avatar fallback={c.name.slice(0, 1)} />}
                    title={
                      <Link href={`/demos/crm/customers/${c.id}`} className="font-medium hover:text-primary">
                        {c.name}
                      </Link>
                    }
                    description={`${c.company} · ${customerOwnerLabel[c.owner]}`}
                  />
                </ListItem>
              )}
            />
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">{copy("toDoList")}</Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <List
              items={todos}
              split
              renderItem={(t) => (
                <ListItem actions={[<Tag key="due" tone={t.tone} size="sm" variant="soft">{t.due}</Tag>]}>
                  <div className="flex items-start gap-2.5 pr-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <Text size="sm">{t.text}</Text>
                  </div>
                </ListItem>
              )}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
