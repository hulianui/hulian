"use client";
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
      { level: "error", message: "✗ 构建失败：next build 退出码 1（类型检查报错 3 处）", timestamp: mmss(75) },
    ];
  }
  if (status === "queued") {
    return [{ level: "info", message: "部署已排队，等待可用的构建容器…", timestamp: mmss(0) }];
  }
  if (status === "canceled") {
    const cut = buildLog.filter((l) => l.at <= 9).map(map);
    return [...cut, { level: "warn", message: "⚠ 部署已被用户取消", timestamp: mmss(12) }];
  }
  if (status === "skipped") {
    return [{ level: "info", message: "本次推送未改动构建输出，跳过部署。", timestamp: mmss(0) }];
  }
  // building：显示前半段，末尾补一条进行中提示。
  const half = buildLog.slice(0, Math.ceil(buildLog.length / 2)).map(map);
  return [...half, { level: "info", message: "构建进行中…", timestamp: mmss(60) }];
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
    { ...stage(0), label: "已入队", children: "部署排队" },
    {
      ...stage(1),
      label: status === "queued" ? "等待中" : undefined,
      children: "构建开始",
    },
    {
      ...stage(2),
      children: failed ? "构建失败" : "构建完成",
    },
    {
      ...stage(3),
      children: "分发到边缘网络",
    },
    {
      ...stage(4),
      children: status === "ready" ? "部署就绪" : "等待就绪",
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
          ? "等待中"
          : statuses[i] === "process"
            ? "进行中…"
            : statuses[i] === "error"
              ? "失败"
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
        <Result status="404" title="部署不存在" subTitle="该部署记录可能已被清理，或链接有误。">
          <Button onClick={() => router.push(`${ROOT}/deployments`)}>
            <ArrowLeft className="size-4" />
            返回部署历史
          </Button>
        </Result>
      </div>
    );
  }

  if (loading) return <DetailSkeleton />;

  const descItems: DescriptionsItemData[] = [
    { label: "部署 ID", children: <span className="font-mono text-xs">{deploy.id}</span> },
    {
      label: "环境",
      children: (
        <Tag tone={deploy.env === "production" ? "success" : "warning"} size="sm">
          {deploy.env === "production" ? "生产" : "预览"}
        </Tag>
      ),
    },
    { label: "分支", children: <span className="font-mono text-xs">{deploy.branch}</span> },
    { label: "提交", children: <span className="font-mono text-xs">{deploy.sha.slice(0, 12)}</span> },
    {
      label: "触发方式",
      children: deploy.id.startsWith("d-manual") ? "手动" : "Git 推送",
    },
    {
      label: "创建",
      children: <RelativeTime value={agoDate(deploy.agoMin)} />,
    },
    { label: "构建耗时", children: formatDuration(deploy.durationSec) },
    {
      label: "地址",
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
          { label: "项目", href: ROOT },
          { label: "部署历史", href: `${ROOT}/deployments` },
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
                <ExternalLink className="size-4" />
                访问部署
              </a>
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast({
                tone: "info",
                title: "已触发重新部署",
                description: `${project.name} · ${deploy.branch} 正在用相同提交重建。`,
              })
            }
          >
            <RefreshCw className="size-4" />
            重新部署
          </Button>
          {canRollback && (
            <Popconfirm
              title="回滚到此部署？"
              description={`生产流量将切换到 ${deploy.sha.slice(0, 7)}（${deploy.branch}）。`}
              okText="确认回滚"
              cancelText="取消"
              danger
              onConfirm={() => {
                toast({
                  tone: "success",
                  title: "已回滚",
                  description: `${project.name} 生产环境已切换到 ${deploy.sha.slice(0, 7)}。`,
                });
              }}
            >
              <Button variant="outline" tone="danger" size="sm">
                <RotateCcw className="size-4" />
                回滚到此
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* 左列 */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>构建步骤</CardHeader>
            <CardBody>
              <Steps items={steps} direction="vertical" size="sm" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>构建日志</CardHeader>
            <CardBody>
              <LogViewer lines={logLines} showTimestamp height={360} autoScroll />
            </CardBody>
          </Card>
        </div>

        {/* 右列 */}
        <div className="flex flex-col gap-4">
          <Descriptions bordered column={1} layout="horizontal" items={descItems} />

          <Card>
            <CardHeader>部署生命周期</CardHeader>
            <CardBody>
              <Timeline items={timeline} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
