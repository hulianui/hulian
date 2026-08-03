/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

import {
  Heading,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tag,
  Text,
} from "@hulianui/ui";
import {
  Check,
  Rocket,
  Activity,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// 能力 Tab 切换 Block —— 自包含、可整段复制（"use client"）。
// 与 FeaturesBlock（错落 Bento）风格区隔：这里用 Tabs 切换 3 个能力，
// 每个面板左侧是要点列表、右侧是图文/渐变界面占位。数据内联，复制后改 TABS 即可。

interface FeatureTab {
  value: string;
  label: string;
  icon: LucideIcon;
  headline: string;
  description: string;
  points: string[];
  /** 右侧占位渐变（用 token 色，暗色自动适配）。 */
  gradient: string;
  /** 占位界面里展示的「指标」小卡。 */
  metric: { label: string; value: string };
}

const TABS: FeatureTab[] = [
  {
    value: "deploy",
    label: "极速部署",
    icon: Rocket,
    headline: "git push 即上线",
    description: "从提交到全球可访问只需几十秒，构建缓存命中后近乎瞬时，异常一键回滚。",
    points: [
      "预览环境随 PR 自动创建并销毁",
      "构建产物按内容寻址，重复层秒级复用",
      "任意历史版本一键回滚，零停机切换",
      "原子发布，不会出现半上线的中间态",
    ],
    gradient: "from-[var(--color-chart-1)]/25 to-[var(--color-chart-2)]/10",
    metric: { label: "平均上线耗时", value: "28 秒" },
  },
  {
    value: "observe",
    label: "端到端可观测",
    icon: Activity,
    headline: "指标、日志、链路一处看全",
    description: "内置 OpenTelemetry 采集栈，无需自建。从用户请求到下游调用，全链路可追溯。",
    points: [
      "指标 / 日志 / 链路追踪开箱即用",
      "30 天数据保留，可按需延长",
      "异常自动聚类，附调用栈与上下文",
      "告警可接入飞书 / 钉钉 / Webhook",
    ],
    gradient: "from-[var(--color-chart-3)]/25 to-[var(--color-chart-1)]/10",
    metric: { label: "故障定位中位耗时", value: "4 分钟" },
  },
  {
    value: "secure",
    label: "企业级安全",
    icon: ShieldCheck,
    headline: "合规与权限一站托管",
    description: "SOC 2 与等保三级合规，密钥托管、细粒度权限与全量审计覆盖每一次变更。",
    points: [
      "SSO 单点登录与细粒度角色权限",
      "密钥加密托管，永不落明文日志",
      "环境隔离，生产配置独立审批",
      "全量操作审计日志，可导出存证",
    ],
    gradient: "from-[var(--color-chart-4)]/25 to-[var(--color-chart-5)]/10",
    metric: { label: "合规认证", value: "SOC 2" },
  },
];

function PreviewPanel({ tab }: { tab: FeatureTab }) {
  const Icon = tab.icon;
  return (
    <div
      className={`relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${tab.gradient} p-6`}
    >
      <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface/80 backdrop-blur">
        <Icon className="size-5 text-primary" aria-hidden />
      </div>
      <div className="rounded-xl border border-border bg-surface/80 p-4 backdrop-blur">
        <Text tone="muted" size="sm">
          {tab.metric.label}
        </Text>
        <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {tab.metric.value}
        </div>
      </div>
    </div>
  );
}

export function FeatureTabsBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            平台能力
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            三块基石，撑起整条上线链路
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            点击下面的标签，逐一了解部署、可观测与安全是如何协同工作的。
          </Text>
        </div>

        <Tabs defaultValue={TABS[0].value}>
          <div className="mb-8 flex justify-center">
            <TabsList variant="solid">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTab key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" aria-hidden />
                      {t.label}
                    </span>
                  </TabsTab>
                );
              })}
            </TabsList>
          </div>

          {TABS.map((t) => (
            <TabsPanel key={t.value} value={t.value}>
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <Heading level={3} size="xl" weight="semibold" className="text-foreground">
                    {t.headline}
                  </Heading>
                  <Text tone="muted" size="lg">
                    {t.description}
                  </Text>
                  <ul className="mt-2 flex flex-col gap-3">
                    {t.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="size-3 text-primary" aria-hidden />
                        </span>
                        <Text size="sm" className="flex-1">
                          {p}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
                <PreviewPanel tab={t} />
              </div>
            </TabsPanel>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
