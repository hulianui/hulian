"use client";
import Link from "next/link";
import { Activity, CircleDollarSign, HardHat, ReceiptText, Wallet } from "lucide-react";
import {
  BarChart,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  ListItemMeta,
  PieChart,
  Progress,
  Stat,
  Tag,
  Text,
  Timeline,
} from "@hulianui/ui";
import { ROOT } from "../_components/nav-config";
import { activeProgress, metrics, monthlyTrend, stageDistribution } from "../_data/metrics";
import { projectEvents } from "../_data/projects";
import { projectStatusTone, wan, yuan } from "../_data/status";

const trend = monthlyTrend();
const stage = stageDistribution();
const active = activeProgress();
const recentEvents = [...projectEvents].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 6);

const EVENT_COLOR: Record<string, "primary" | "success" | "warning" | "danger" | "default"> = {
  里程碑: "primary",
  回款: "success",
  开票: "warning",
  报价: "default",
  照片: "default",
  备注: "danger",
};

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
          deltaLabel="较上月"
          icon={<span className={`grid size-11 place-items-center rounded-[var(--radius)] ${iconClass}`}>{icon}</span>}
        />
      </CardBody>
    </Card>
  );
}

export default function ProjectsDashboard() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <Heading level={2} size="xl">
          工作台
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">
          今天是 2026 年 6 月 4 日 · {metrics.activeProjects} 个项目在建 · 待回款 {wan(metrics.pendingPayment)}
        </Text>
      </header>

      {/* 指标卡 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="在建项目"
          value={metrics.activeProjects}
          delta={12.5}
          icon={<HardHat className="size-5" />}
          iconClass="bg-primary/12 text-primary"
        />
        <StatCard
          label="本月报价额"
          value={wan(metrics.quotedThisMonth)}
          delta={18.2}
          icon={<CircleDollarSign className="size-5" />}
          iconClass="bg-success/12 text-success"
        />
        <StatCard
          label="待开票额"
          value={wan(metrics.pendingInvoice)}
          delta={-6.4}
          icon={<ReceiptText className="size-5" />}
          iconClass="bg-warning/15 text-warning"
        />
        <StatCard
          label="待回款额"
          value={wan(metrics.pendingPayment)}
          delta={-3.1}
          icon={<Wallet className="size-5" />}
          iconClass="bg-danger/12 text-danger"
        />
      </div>

      {/* 图表行 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outline" className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <Heading level={3} size="base">
              产值与回款
            </Heading>
            <Text size="sm" tone="muted">
              近 6 个月 · 万元
            </Text>
          </CardHeader>
          <CardBody className="pt-0">
            <BarChart
              data={trend}
              series={[
                { key: "产值", label: "开票产值（万）" },
                { key: "回款", label: "实际回款（万）" },
              ]}
              xKey="month"
              height={260}
            />
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">
              项目阶段分布
            </Heading>
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
            <Heading level={3} size="base">
              在建项目进度
            </Heading>
            <Link href={`${ROOT}/tracking`} className="text-sm text-primary hover:underline">
              查看全部
            </Link>
          </CardHeader>
          <CardBody className="pt-0">
            <List
              items={active}
              split
              renderItem={(p) => (
                <ListItem
                  actions={[
                    <Tag key="st" tone={projectStatusTone(p.status)} size="sm">
                      {p.stage}
                    </Tag>,
                  ]}
                >
                  <div className="flex flex-col gap-1.5 pr-2">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`${ROOT}/tracking/${p.id}`}
                        className="truncate text-sm font-medium hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <span className="shrink-0 text-xs tabular-nums text-muted">{p.progress}%</span>
                    </div>
                    <Progress variant="linear" value={p.progress} className="w-full" />
                    <Text size="xs" tone="muted">
                      {p.client} · {p.crew} · 合同额 {yuan(p.contractAmount)}
                    </Text>
                  </div>
                </ListItem>
              )}
            />
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader className="flex items-center gap-2">
            <Activity className="size-4 text-muted" />
            <Heading level={3} size="base">
              近期动态
            </Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <Timeline
              items={recentEvents.map((e) => ({
                color: EVENT_COLOR[e.type] ?? "default",
                label: `${e.at} · ${e.by}`,
                children: (
                  <Text size="sm">
                    <Tag tone="neutral" size="sm" variant="soft" className="mr-1.5 align-middle">
                      {e.type}
                    </Tag>
                    {e.text}
                  </Text>
                ),
              }))}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
