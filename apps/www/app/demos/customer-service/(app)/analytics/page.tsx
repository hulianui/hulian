"use client";
import { copy } from "./page.content";

import { MessageSquare, Clock, CheckCircle2, Smile } from "lucide-react";
import {
  AreaChart,
  Avatar,
  Card,
  CardBody,
  CardHeader,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Heading,
  PieChart,
  Progress,
  Stat,
  Tag,
  Text,
} from "@hulianui/ui";
import {
  todayMetrics,
  hourlyVolume,
  channelDistribution,
  csatTrend,
  agentLeaderboard,
  liveStats,
} from "../../_data/metrics";

const ICONS = [MessageSquare, Clock, CheckCircle2, Smile];
const volume = hourlyVolume();
const channels = channelDistribution();
const csat = csatTrend();

const LIVE = [
  { label: copy("onlineAgent"), value: liveStats.online, tone: "success" as const },
  { label: copy("queuing"), value: liveStats.waiting, tone: "warning" as const },
  { label: copy("inProgress"), value: liveStats.active, tone: "brand" as const },
  { label: copy("todayIsOver"), value: liveStats.closedToday, tone: "neutral" as const },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Heading level={1} size="xl">{copy("dataDashboard")}</Heading>
        <Text tone="muted" className="mt-1">{copy("realTimeMeasurementOfServiceQualityAnd")}</Text>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {todayMetrics.map((m, i) => {
          const Icon = ICONS[i];
          return (
            <Card key={m.label}>
              <CardBody>
                <Stat
                  label={m.label}
                  value={m.value}
                  delta={m.delta}
                  deltaLabel={m.hint}
                  icon={<Icon className="size-5" />}
                />
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* 实时态 */}
      <Card>
        <CardBody className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
          {LIVE.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 px-4 py-1">
              <span className="text-2xl font-semibold tabular-nums">{s.value}</span>
              <Tag tone={s.tone} size="sm" dot pulse={s.tone === "warning"}>
                {s.label}
              </Tag>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* 趋势图 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-admin-demo-chart="conversation-volume">
          <CardHeader>{copy("todaySSessionVolumeByHour")}</CardHeader>
          <CardBody>
            <AreaChart data={volume} series={[{ key: "volume", label: copy("sessionVolume2") }]} xKey="hour" height={260} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>{copy("channelDistribution")}</CardHeader>
          <CardBody>
            <PieChart data={channels} donut height={260} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-admin-demo-chart="csat-trend">
          <CardHeader>{copy("satisfactionTrendsCsatOverTheLastDays")}</CardHeader>
          <CardBody>
            <AreaChart data={csat} series={[{ key: "csat", label: "CSAT %" }]} xKey="day" height={240} />
          </CardBody>
        </Card>

        {/* 坐席排行 */}
        <Card>
          <CardHeader>{copy("seatReceptionRanking")}</CardHeader>
          <CardBody className="flex flex-col gap-4">
            {agentLeaderboard.map((a, i) => (
              <div key={a.agent} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-center text-sm font-semibold text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                {/* 坐席头像 → HoverCard 资料卡预览 */}
                <HoverCard>
                  <HoverCardTrigger
                    render={<Avatar fallback={a.agent.slice(0, 1)} size="sm" className="cursor-pointer" />}
                  />
                  <HoverCardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar fallback={a.agent.slice(0, 1)} size="sm" />
                        <span className="text-sm font-semibold">{a.agent}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <span>{copy("receptionCapacity")}{a.served}{copy("single")}</span>
                        <span>{copy("satisfaction2")}{a.csat}%</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{a.agent}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{a.served}{copy("single2")}{a.csat}%</span>
                  </div>
                  <Progress value={a.csat} className="mt-1" />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
