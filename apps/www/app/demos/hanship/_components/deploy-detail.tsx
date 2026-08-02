"use client";
import { copy } from "./deploy-detail.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../_components/demo-locale";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, RefreshCw, RotateCcw, ArrowLeft } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Breadcrumb,
  Tag,
  GitCommit,
  DeployStatus,
  RelativeTime,
  Steps,
  LogViewer,
  Timeline,
  Descriptions,
  Skeleton,
  Result,
  Popconfirm,
  toast,
} from "@hulianui/ui";
import type {
  StepsItem,
  TimelineItemProps,
  DescriptionsItemData,
  LogLine as ViewerLine,
} from "@hulianui/ui";
import {
  deployById,
  projectById,
  buildSteps,
  buildLog,
} from "../_data/store";
import type { DeployState, LogLine } from "../_data/types";
import { formatDuration, mmss, agoDate } from "../_lib/format";
import { useMockData } from "../../lib/async";
import { ROOT } from "./nav-config";

// —— 按 deploy.status 派生 5 个构建步骤的状态 ——
function deriveStepStatuses(status: DeployState): StepsItem["status"][] {
  switch (status) {
    case "ready":
      return buildSteps.map(() => "finish");
    case "queued":
      return buildSteps.map(() => "wait");
    case "canceled":
    case "skipped":
      // 视为在「安装依赖」阶段中止：前一步完成，当前步起为 wait。
      return buildSteps.map((_, i) => (i < 1 ? "finish" : "wait"));
    case "error":
      // 在「构建」步失败（index 2）：之前 finish、该步 error、之后 wait。
      return buildSteps.map((_, i) => (i < 2 ? "finish" : i === 2 ? "error" : "wait"));
    case "building":
    default:
      // 跑到「上传产物」步（index 3）：前面 finish、当前 process、其余 wait。
      return buildSteps.map((_, i) => (i < 3 ? "finish" : i === 3 ? "process" : "wait"));
  }
}

// —— 按 deploy.status 裁剪构建日志 ——
function buildLogLines(status: DeployState): ViewerLine[] {
  const map = (l: LogLine): ViewerLine => ({
    level: l.level,
    message: l.message,
    timestamp: mmss(l.at),
  });

  if (status === "ready") {
    return buildLog.map(map);
  }
  if (status === "error") {
    // 截到「构建」阶段，末尾补一条 error 行。
    const cut = buildLog.filter((l) => l.at <= 72).map(map);
    return [
      ...cut,
      { level: "error", message: copy("buildFailedNextBuildExitCodeType"), timestamp: mmss(75) },
    ];
  }
  if (status === "queued") {
    return [{ level: "info", message: copy("deploymentQueuedForAvailableBuildContainer"), timestamp: mmss(0) }];
  }
  if (status === "canceled") {
    const cut = buildLog.filter((l) => l.at <= 9).map(map);
    return [...cut, { level: "warn", message: copy("deploymentHasBeenCanceledByUser"), timestamp: mmss(12) }];
  }
  if (status === "skipped") {
    return [{ level: "info", message: copy("theBuildOutputIsUnchangedInThis"), timestamp: mmss(0) }];
  }
  // building：显示前半段，末尾补一条进行中提示。
  const half = buildLog.slice(0, Math.ceil(buildLog.length / 2)).map(map);
  return [...half, { level: "info", message: copy("buildInProgress"), timestamp: mmss(60) }];
}

// —— 部署生命周期 Timeline ——
// 五个生命周期节点严格单调推进：已完成=success(绿) / 当前进行中=primary+pending(蓝) /
// 其后未开始=default(灰)。activeStage = 当前正进行的节点 index（done 态为 5 表示全完成）。
function lifecycleItems(status: DeployState): TimelineItemProps[] {
  const failed = status === "error";

  // 各状态下「已推进到第几个节点」：
  //   ready    → 5（全部完成，无进行中节点）
  //   building → 1（构建中，"构建开始"节点为当前进行中）
  //   error    → 2（在"构建完成"节点失败）
  //   queued   → 1（已入队=完成，"构建开始"等待中）
  //   canceled/skipped → 1（入队后中止）
  const activeStage =
    status === "ready"
      ? 5
      : status === "building"
        ? 1
        : status === "error"
          ? 2
          : 1; // queued / canceled / skipped

  // 单个节点按其 index 与 activeStage 的关系着色（done…active…pending 单调）。
  const stage = (index: number): { color: TimelineItemProps["color"]; pending?: boolean } => {
    if (failed && index === activeStage) return { color: "danger" };
    if (index < activeStage) return { color: "success" };
    if (index === activeStage && status === "building") return { color: "primary", pending: true };
    return { color: "default" };
  };

  return [
    { ...stage(0), label: copy("joinedTheTeam"), children: copy("deploymentQueue") },
    {
      ...stage(1),
      label: status === "queued" ? copy("waiting") : undefined,
      children: copy("buildStarts"),
    },
    {
      ...stage(2),
      children: failed ? copy("buildFailed") : copy("buildCompleted"),
    },
    {
      ...stage(3),
      children: copy("distributeToEdgeNetwork"),
    },
    {
      ...stage(4),
      children: status === "ready" ? copy("readyToDeploy") : copy("waitingForReady"),
    },
  ];
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-64" />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 w-full rounded-[var(--radius)]" />
          <Skeleton className="h-80 w-full rounded-[var(--radius)]" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-72 w-full rounded-[var(--radius)]" />
          <Skeleton className="h-48 w-full rounded-[var(--radius)]" />
        </div>
      </div>
    </div>
  );
}

export function DeployDetail({ id }: { id: string }) {
  const router = useRouter();
  const deploy = deployById(id);
  const project = deploy && projectById(deploy.projectId);
  const { loading } = useMockData(deploy ?? null);

  const steps = useMemo<StepsItem[]>(() => {
    if (!deploy) return [];
    const statuses = deriveStepStatuses(deploy.status);
    return buildSteps.map((s, i) => ({
      title: s.name,
      description:
        statuses[i] === "wait"
          ? copy("waiting2")
          : statuses[i] === "process"
            ? copy("inProgress")
            : statuses[i] === "error"
              ? copy("failed")
              : formatDuration(s.durationSec),
      status: statuses[i],
    }));
  }, [deploy]);

  const logLines = useMemo<ViewerLine[]>(
    () => (deploy ? buildLogLines(deploy.status) : []),
    [deploy],
  );

  const timeline = useMemo<TimelineItemProps[]>(
    () => (deploy ? lifecycleItems(deploy.status) : []),
    [deploy],
  );

  if (!deploy || !project) {
    return (
      <div className="grid place-items-center py-16">
        <Result status="404" title={copy("deploymentDoesNotExist")} subTitle={copy("theDeploymentRecordMayHaveBeenCleaned")}>
          <Button onClick={() => router.push(`${ROOT}/deployments`)}>
            <ArrowLeft className="size-4" />{copy("returnToDeploymentHistory")}</Button>
        </Result>
      </div>
    );
  }

  if (loading) return <DetailSkeleton />;

  const descItems: DescriptionsItemData[] = [
    { label: copy("deploymentId"), children: <span className="font-mono text-xs">{deploy.id}</span> },
    {
      label: copy("environment"),
      children: (
        <Tag tone={deploy.env === "production" ? "success" : "warning"} size="sm">
          {deploy.env === "production" ? copy("produce") : copy("preview")}
        </Tag>
      ),
    },
    { label: copy("branch"), children: <span className="font-mono text-xs">{deploy.branch}</span> },
    { label: copy("submit"), children: <span className="font-mono text-xs">{deploy.sha.slice(0, 12)}</span> },
    {
      label: copy("triggerMode"),
      children: deploy.id.startsWith("d-manual") ? copy("manual") : copy("gitPush"),
    },
    {
      label: copy("create"),
      children: <RelativeTime value={agoDate(deploy.agoMin)} locale={DEMO_RELATIVE_TIME_LOCALE} />,
    },
    { label: copy("timeConsumingToBuild"), children: formatDuration(deploy.durationSec) },
    {
      label: copy("address"),
      children: (
        <a
          href={`https://${deploy.url}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
        >
          {deploy.url}
          <ExternalLink className="size-3 opacity-60" />
        </a>
      ),
    },
  ];

  const canRollback = deploy.status === "ready" && !deploy.current;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: copy("project"), href: ROOT },
          { label: copy("deploymentHistory"), href: `${ROOT}/deployments` },
          { label: deploy.sha.slice(0, 7) },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <GitCommit
            sha={deploy.sha}
            branch={deploy.branch}
            message={deploy.message}
            author={deploy.author}
          />
          <DeployStatus status={deploy.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={
              <a href={`https://${deploy.url}`} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />{copy("accessDeployment")}</a>
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast({
                tone: "info",
                title: copy("redeploymentTriggered"),
                description: copy("valueValueIsRebuildingWithTheSame", project.name, deploy.branch),
              })
            }
          >
            <RefreshCw className="size-4" />{copy("redeploy")}</Button>
          {canRollback && (
            <Popconfirm
              title={copy("rollBackToThisDeployment")}
              description={copy("productionTrafficWillBeSwitchedToValue", deploy.sha.slice(0, 7), deploy.branch)}
              okText={copy("confirmRollback")}
              cancelText={copy("cancel")}
              danger
              onConfirm={() => {
                toast({
                  tone: "success",
                  title: copy("rolledBack"),
                  description: copy("valueTheProductionEnvironmentHasBeenSwitched", project.name, deploy.sha.slice(0, 7)),
                });
              }}
            >
              <Button variant="outline" tone="danger" size="sm">
                <RotateCcw className="size-4" />{copy("rollBackHere")}</Button>
            </Popconfirm>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* 左列 */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>{copy("buildSteps")}</CardHeader>
            <CardBody>
              <Steps items={steps} direction="vertical" size="sm" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>{copy("buildLog")}</CardHeader>
            <CardBody>
              <LogViewer lines={logLines} showTimestamp height={360} autoScroll />
            </CardBody>
          </Card>
        </div>

        {/* 右列 */}
        <div className="flex flex-col gap-4">
          <Descriptions bordered column={1} layout="horizontal" items={descItems} />

          <Card>
            <CardHeader>{copy("deploymentLifeCycle")}</CardHeader>
            <CardBody>
              <Timeline items={timeline} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
