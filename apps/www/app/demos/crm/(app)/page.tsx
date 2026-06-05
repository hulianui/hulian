"use client";
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
import { customerStatusTone, yuan } from "../_data/status";

const trend = monthlyTrend();
const stage = stageDistribution();
const recentCustomers = [...customers].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);

const todos = [
  { id: "t1", text: "晨光文具 · 续约多年期折扣待审批", due: "今天", tone: "danger" as const },
  { id: "t2", text: "云栖科技 · SaaS 报价单 v2 待客户确认", due: "今天", tone: "warning" as const },
  { id: "t3", text: "极光新能源 · 充电网管商务条款跟进", due: "明天", tone: "warning" as const },
  { id: "t4", text: "瑞康制药 · 同行业 GMP 案例待发送", due: "6/5", tone: "brand" as const },
  { id: "t5", text: "知行教育 / 绿野农业 · 3 条新线索待分配", due: "本周", tone: "neutral" as const },
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
          deltaLabel="较上月"
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
        <Heading level={2} size="xl">
          工作台
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">
          今天是 2026 年 6 月 4 日 · 你有 {todos.length} 条待办、{metrics.following} 个客户跟进中
        </Text>
      </header>

      {/* 指标卡 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="客户总数"
          value={metrics.totalCustomers}
          delta={8.3}
          icon={<Users className="size-5" />}
          iconClass="bg-primary/12 text-primary"
        />
        <StatCard
          label="本月新增"
          value={metrics.newThisMonth}
          delta={33.3}
          icon={<UserPlus className="size-5" />}
          iconClass="bg-success/12 text-success"
        />
        <StatCard
          label="商机金额"
          value={yuan(metrics.pipelineAmount)}
          delta={12}
          icon={<Target className="size-5" />}
          iconClass="bg-warning/15 text-warning"
        />
        <StatCard
          label="累计成交"
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
            <Heading level={3} size="base">
              成交趋势
            </Heading>
            <Text size="sm" tone="muted">
              近 6 个月 · 万元
            </Text>
          </CardHeader>
          <CardBody className="pt-0">
            <AreaChart data={trend} series={[{ key: "成交额", label: "成交额（万）" }]} xKey="month" height={260} />
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">
              商机阶段分布
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
              最近客户
            </Heading>
            <Link href="/demos/crm/customers" className="text-sm text-primary hover:underline">
              查看全部
            </Link>
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
                      {c.status}
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
                    description={`${c.company} · ${c.owner}`}
                  />
                </ListItem>
              )}
            />
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">
              待办事项
            </Heading>
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
