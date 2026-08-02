import { copy } from "./product.content";
import { demoHref } from "../../../_components/demo-locale";
import Link from "next/link";
import {
  Safari,
  IPhone,
  Android,
  Heading,
  Text,
  Tag,
  Button,
  Stack,
  Divider,
} from "@hulianui/ui";
import { CheckCircle2, ArrowRight, GitBranch, Rocket, Smartphone, Wifi } from "lucide-react";

const highlights = [
  copy("liveBuildLogsAndDeploymentPreviewsWithAnIsolatedEnvironmentForEveryPullRequest"),
  copy("rollBackToAnyPreviousVersionInOneClickWithAnAverageRecoveryTimeUnder30Seconds"),
  copy("metricsLogsAndTracesInOneViewSoInvestigationsStayInOneTool"),
];

// 内嵌在 Safari 外壳里的迷你「部署面板」，100% 由 hulian 原语拼成。
function DeployDashboard() {
  const deploys = [
    { branch: "main", env: copy("production"), status: copy("live"), tone: "success" as const, time: copy("text12SecondsAgo") },
    { branch: "feat/checkout", env: copy("preview"), status: copy("building"), tone: "warning" as const, time: copy("justNow") },
    { branch: "fix/cache", env: copy("preview"), status: copy("live"), tone: "success" as const, time: copy("text3MinutesAgo") },
  ];
  return (
    <div className="bg-background p-4 sm:p-5">
      <Stack direction="row" align="center" justify="between" className="mb-4">
        <Stack direction="row" align="center" gap={2}>
          <span className="flex size-7 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary">
            <Rocket className="size-4" aria-hidden />
          </span>
          <Text weight="semibold">hancloud-web</Text>
        </Stack>
        <Tag variant="soft" tone="success" size="sm" dot>

          {copy("running")}
        </Tag>
      </Stack>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: copy("requestsMin"), value: "24.8k" },
          { label: copy("p95Latency"), value: "42ms" },
          { label: copy("errorRate"), value: "0.01%" },
        ].map((m) => (
          <div key={m.label} className="rounded-[var(--radius)] border border-border bg-surface p-3">
            <Text size="xs" tone="muted">
              {m.label}
            </Text>
            <Text weight="semibold" className="mt-0.5 text-lg">
              {m.value}
            </Text>
          </div>
        ))}
      </div>

      <Divider className="my-4" />

      <Text size="xs" tone="muted" className="mb-2">

        {copy("recentDeployments")}
      </Text>
      <Stack direction="column" gap={2}>
        {deploys.map((d, i) => (
          <Stack key={i} direction="row" align="center" justify="between" className="text-sm">
            <Stack direction="row" align="center" gap={2} className="min-w-0">
              <GitBranch className="size-3.5 shrink-0 text-muted" aria-hidden />
              <Text truncate className="font-mono">
                {d.branch}
              </Text>
              <Tag variant="outline" tone="neutral" size="sm">
                {d.env}
              </Tag>
            </Stack>
            <Stack direction="row" align="center" gap={2} className="shrink-0">
              <Tag variant="soft" tone={d.tone} size="sm" dot pulse={d.tone === "warning"}>
                {d.status}
              </Tag>
              <Text size="xs" tone="muted">
                {d.time}
              </Text>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </div>
  );
}

// 内嵌在 IPhone 外壳里的移动端「告警推送」界面，100% hulian 原语。
function MobileAlertScreen() {
  const alerts = [
    { level: "P0", title: copy("buildFailed"), desc: copy("featCheckout12MinutesAgo"), tone: "danger" as const },
    { level: "P1", title: copy("memoryThresholdExceeded"), desc: copy("hancloudWebProdJustNow"), tone: "warning" as const },
    { level: copy("recovered"), title: copy("fullRollbackCompleted"), desc: copy("v231Deployed3MinutesAgo"), tone: "success" as const },
  ];
  const toneColor: Record<string, string> = {
    danger: "bg-danger/15 text-danger",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
  };
  return (
    <div className="flex h-full flex-col gap-0 bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <Text size="xs" weight="semibold" className="text-foreground">

          {copy("hancloudAlerts")}
        </Text>
        <Tag variant="soft" tone="danger" size="sm" dot pulse>

          {copy("text2Unread")}
        </Tag>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden p-2">
        {alerts.map((a) => (
          <div
            key={a.title}
            className="flex items-start gap-2 rounded-[var(--radius)] border border-border bg-surface p-2"
          >
            <span
              className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${toneColor[a.tone]}`}
            >
              {a.level}
            </span>
            <div className="min-w-0">
              <Text size="xs" weight="semibold" truncate className="text-foreground">
                {a.title}
              </Text>
              <Text size="xs" tone="muted" truncate>
                {a.desc}
              </Text>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-2">
        <div className="flex items-center justify-center gap-1">
          <Wifi className="size-3 text-success" />
          <Text size="xs" tone="muted">

            {copy("connectedAllServicesOperational")}
          </Text>
        </div>
      </div>
    </div>
  );
}

// 内嵌在 Android 外壳里的「快速操作」面板。
function AndroidDashScreen() {
  const metrics = [
    { label: copy("deploymentsToday"), value: "14", color: "text-primary" },
    { label: copy("successRate"), value: "99%", color: "text-success" },
    { label: copy("averageDuration"), value: "38s", color: "text-foreground" },
  ];
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border px-3 py-2">
        <Stack direction="row" align="center" gap={1.5}>
          <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-primary">
            <Smartphone className="size-3" aria-hidden />
          </span>
          <Text size="xs" weight="semibold" className="text-foreground">

            {copy("console")}
          </Text>
        </Stack>
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center rounded-[var(--radius)] border border-border bg-surface p-2"
          >
            <span className={`text-base font-bold ${m.color}`}>{m.value}</span>
            <Text size="xs" tone="muted" className="text-center leading-tight">
              {m.label}
            </Text>
          </div>
        ))}
      </div>
      <div className="flex-1 space-y-1.5 px-2">
        {[copy("mainProduction"), copy("featPayPreview"), copy("fixTzPreview")].map((branch, i) => (
          <div key={branch} className="flex items-center justify-between rounded border border-border bg-surface px-2 py-1.5">
            <Text size="xs" className="font-mono text-foreground">
              {branch}
            </Text>
            <Tag variant="soft" tone={i === 0 ? "success" : i === 2 ? "warning" : "success"} size="sm" dot>
              {i === 2 ? copy("building") : "✓"}
            </Tag>
          </div>
        ))}
      </div>
    </div>
  );
}

// 产品演示：左文案右 Safari 设备外壳内嵌迷你部署面板。
export function Product() {
  return (
    <section className="border-b border-border bg-surface/30 px-6 py-20 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Tag variant="soft" tone="brand" size="sm" className="mb-4">

            {copy("everythingInOneView")}
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">

            {copy("deployMonitorAndRollBackFromOneDashboard")}
          </Heading>
          <Text tone="muted" size="lg" className="mt-4">

            {copy("stopJumpingBetweenCiMonitoringAndLogPlatformsHancloudBringsTheEntireDeliveryPipelineIntoOneClear")}
          </Text>

          <Stack direction="column" gap={3} className="mt-6">
            {highlights.map((h) => (
              <Stack key={h} direction="row" align="start" gap={2}>
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <Text>{h}</Text>
              </Stack>
            ))}
          </Stack>

          <Button
            variant="outline"
            className="mt-8"
            render={<Link href={demoHref("/demos/website/contact")} />}
          >

            {copy("bookAOneOnOneDemo")}
            <ArrowRight className="ml-2 size-4" aria-hidden />
          </Button>
        </div>

        <Safari url="app.hancloud.dev" className="shadow-2xl">
          <DeployDashboard />
        </Safari>
      </div>
    </section>
  );
}

/** 多端预览：IPhone + Android 并列，展示移动端告警推送与控制台体验。 */
export function ProductMobile() {
  return (
    <section className="border-b border-border px-6 py-20 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* 右侧：两台手机并列（IPhone + Android），错位排列增加层次感 */}
        <div className="flex items-end justify-center gap-6 lg:order-first">
          <IPhone model="16-pro" className="shadow-2xl">
            <MobileAlertScreen />
          </IPhone>
          <div className="mb-8">
            <Android model="pixel-9-pro" className="shadow-2xl">
              <AndroidDashScreen />
            </Android>
          </div>
        </div>

        <div>
          <Tag variant="soft" tone="brand" size="sm" className="mb-4">

            {copy("anywhereAnytime")}
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">

            {copy("receiveAlertsOnMobileAndTrackDeploymentStatusAnywhere")}
          </Heading>
          <Text tone="muted" size="lg" className="mt-4">

            {copy("alertsArriveDirectlyOnYourPhoneSoP0IncidentsAreImpossibleToMissNativeIosAndAndroidAppsKeepTheExp")}
          </Text>

          <Stack direction="column" gap={3} className="mt-6">
            {[
              copy("tieredP0P1NotificationsWithImmediateDeliveryForCriticalAlerts"),
              copy("rollBackFromYourPhoneInOneTapWithoutWaitingForAComputer"),
              copy("setCustomQuietHoursSoNoncriticalAlertsDoNotInterruptYourNight"),
            ].map((h) => (
              <Stack key={h} direction="row" align="start" gap={2}>
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <Text>{h}</Text>
              </Stack>
            ))}
          </Stack>

          <Button
            variant="outline"
            className="mt-8"
            render={<Link href={demoHref("/demos/website/contact")} />}
          >

            {copy("exploreMobileFeatures")}
            <ArrowRight className="ml-2 size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
