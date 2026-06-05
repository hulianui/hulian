"use client";
// 瀚舵 HanHelm —— 任务详情（旗舰页）。
// 多 agent 编排 DAG（复用 Flow 只读）+ 执行过程帧回放 + 全链路 Timeline。
// 100% @hulian/ui；运行态由 useDispatchRun 驱动（逐节点点亮 + 逐帧流出 + 进度 + failover）。

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  CardBody,
  CardHeader,
  Button,
  ShimmerButton,
  Banner,
  Tag,
  StatusDot,
  List,
  ListItem,
  Progress,
  Timeline,
  Empty,
  Text,
  cn,
} from "@hulian/ui";
import {
  Play,
  RotateCcw,
  XCircle,
  ShieldAlert,
  Clock3,
  Wallet,
  Route as RouteIcon,
} from "lucide-react";
import type { Capability, Priority, SubTaskStatus, Task } from "../_data/types";
import { taskById } from "../_data/tasks";
import { executorName } from "../_data/executors";
import { evaluateSla } from "../_lib/sla";
import { useDispatchRun } from "../_lib/use-dispatch-run";
import { TaskDetailDag } from "./task-detail-dag";
import { TaskDetailFrames } from "./task-detail-frames";

const ROOT = "/demos/hanhelm";

const CAP_LABEL: Record<Capability, string> = {
  text: "文本生成",
  code: "代码",
  image: "图像",
  translate: "翻译",
  rag: "检索增强",
  extract: "结构化抽取",
  moderate: "内容审核",
  orchestrate: "多 agent 编排",
};

const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "brand" | "neutral"> = {
  P0: "danger",
  P1: "warning",
  P2: "brand",
  P3: "neutral",
};

/** 子任务状态 → StatusDot 健康态 + 文案。 */
const SUB_STATUS_DOT: Record<SubTaskStatus, { status: "online" | "degraded" | "offline" | "maintenance"; label: string }> = {
  pending: { status: "maintenance", label: "待执行" },
  running: { status: "online", label: "执行中" },
  failover: { status: "degraded", label: "降级中" },
  failed: { status: "offline", label: "失败" },
  done: { status: "online", label: "完成" },
};

/** ms → 友好时长串。 */
function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}分${Math.round(s % 60)}秒`;
}

export function TaskDetail({ id }: { id: string }) {
  const router = useRouter();
  const task = taskById(id);

  if (!task) {
    return (
      <div className="p-6">
        <Empty
          title="任务不存在"
          description={`未找到 id 为「${id}」的任务，可能已被清理或链接失效。`}
        >
          <Button variant="solid" onClick={() => router.push(`${ROOT}/queue`)}>
            返回任务队列
          </Button>
        </Empty>
      </div>
    );
  }

  return <TaskDetailBody task={task} />;
}

function TaskDetailBody({ task }: { task: Task }) {
  const router = useRouter();
  const { running, activeId, statusById, frames, progress, failovers, run, reset } = useDispatchRun(task);

  // 子任务成本/耗时汇总（DAG 子任务求和）。
  const sumCost = useMemo(() => task.subtasks.reduce((a, s) => a + s.costYuan, 0), [task.subtasks]);
  const sumDuration = useMemo(() => task.subtasks.reduce((a, s) => a + s.durationMs, 0), [task.subtasks]);

  // 运行中实时花费（已 done/failover 的子任务计入）。
  const liveSpent = useMemo(() => {
    if (!running && frames.length === 0) return task.spentYuan ?? 0;
    return task.subtasks.reduce((a, s) => {
      const st = statusById[s.id] ?? s.status;
      return st === "done" || st === "failover" ? a + s.costYuan : a;
    }, 0);
  }, [running, frames.length, statusById, task.subtasks, task.spentYuan]);

  // SLA 判定：优先取实测 elapsedMs，否则用子任务耗时之和估算（无 DAG 时用 waitedMs）。
  const latencyForSla = task.elapsedMs ?? (sumDuration > 0 ? sumDuration : task.waitedMs);
  const sla = evaluateSla(latencyForSla, task.slaMs);
  const slaTone = sla.status === "met" ? "success" : sla.status === "at-risk" ? "warning" : "danger";
  const slaText =
    sla.status === "met"
      ? `SLA 达成 · 端到端 ${fmtDuration(latencyForSla)}，余量 ${fmtDuration(Math.max(0, sla.marginMs))}（阈值 ${fmtDuration(task.slaMs)}）`
      : sla.status === "at-risk"
        ? `SLA 临期 · 已用 ${fmtDuration(latencyForSla)}，剩余 ${fmtDuration(Math.max(0, sla.marginMs))}（阈值 ${fmtDuration(task.slaMs)}，占用 ${Math.round(sla.ratio * 100)}%）`
        : `SLA 违约 · 端到端 ${fmtDuration(latencyForSla)} 已超阈值 ${fmtDuration(task.slaMs)}（超 ${fmtDuration(-sla.marginMs)}）`;

  // 全链路 Timeline：由 routing + frames + failovers 派生。
  const timelineItems = useMemo(() => {
    const items: { color: "default" | "primary" | "success" | "danger" | "warning"; label: string; children: string }[] = [];
    items.push({ color: "primary", label: `等待 ${fmtDuration(task.waitedMs)}`, children: `任务入队 · ${task.type} · 优先级 ${task.priority}` });
    if (task.routing.chosenId) {
      items.push({
        color: "primary",
        label: "智能路由",
        children: `${task.routing.reason}（选中 ${executorName(task.routing.chosenId)}）`,
      });
    }
    // 子任务起止（按拓扑序，用数据自带 status 着色）。
    for (const sub of task.subtasks) {
      const st = statusById[sub.id] ?? sub.status;
      const color =
        st === "done" ? "success" : st === "failed" ? "danger" : st === "failover" ? "warning" : st === "running" ? "primary" : "default";
      items.push({
        color,
        label: `${fmtDuration(sub.durationMs)} · ¥${sub.costYuan.toFixed(2)}`,
        children: `${sub.title} → ${executorName(sub.executorId)}`,
      });
    }
    // 路由决策里记录的 failover（数据态）。
    for (const fo of task.routing.failovers) {
      items.push({ color: "warning", label: "降级 failover", children: fo.reason });
    }
    // 本次运行注入的 failover（运行态）。
    for (const fo of failovers) {
      items.push({ color: "warning", label: "运行降级", children: fo.reason });
    }
    if (task.status === "done") {
      items.push({ color: "success", label: task.elapsedMs ? fmtDuration(task.elapsedMs) : "已完成", children: `编排完成 · 花费 ¥${(task.spentYuan ?? sumCost).toFixed(2)}` });
    } else if (task.status === "failed") {
      items.push({ color: "danger", label: "失败", children: `任务失败 · 已花费 ¥${(task.spentYuan ?? sumCost).toFixed(2)}` });
    }
    return items;
  }, [task, statusById, failovers, sumCost]);

  const hasDag = task.subtasks.length > 0;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* 顶部：返回 + 元信息 */}
      <PageHeader
        onBack={() => router.push(`${ROOT}/queue`)}
        title={task.title}
        subTitle={task.type}
        breadcrumb={
          <Text size="xs" tone="muted">
            任务队列 / {task.id}
          </Text>
        }
        tags={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Tag tone={PRIORITY_TONE[task.priority]} variant="solid" size="sm">
              {task.priority}
            </Tag>
            {task.capabilities.map((c) => (
              <Tag key={c} tone="neutral" size="sm">
                {CAP_LABEL[c]}
              </Tag>
            ))}
          </span>
        }
        extra={
          <span className="flex items-center gap-2">
            {running ? (
              <Button variant="outline" size="sm" onClick={reset}>
                <XCircle className="size-4" /> 取消
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="size-4" /> 重置
              </Button>
            )}
            <ShimmerButton onClick={run} disabled={running || !hasDag}>
              <Play className="size-4" /> {running ? "运行中…" : "重新运行"}
            </ShimmerButton>
          </span>
        }
      />

      {/* 元信息条 */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <RouteIcon className="size-4" /> 承接执行器：
          <span className="font-medium text-foreground">{executorName(task.assignedExecutorId)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wallet className="size-4" /> 成本预算：
          <span className="font-medium text-foreground tabular-nums">¥{task.budgetYuan.toFixed(2)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-4" /> SLA 目标：
          <span className="font-medium text-foreground tabular-nums">{fmtDuration(task.slaMs)}</span>
        </span>
        <span>提交人：<span className="font-medium text-foreground">{task.submitter}</span></span>
      </div>

      {/* SLA Banner */}
      <Banner
        tone={slaTone}
        icon={<ShieldAlert className="size-[18px]" />}
        action={
          <span className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={run} disabled={running || !hasDag}>
              重新运行
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push(`${ROOT}/queue`)}>
              取消
            </Button>
          </span>
        }
      >
        {slaText}
      </Banner>

      {/* 三栏 */}
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        {/* 左：子任务清单 + 汇总 */}
        <Card variant="outline" className="min-w-0">
          <CardHeader className="px-4 pt-4">
            <Text size="sm" weight="medium">
              子任务清单
            </Text>
          </CardHeader>
          <CardBody className="px-2 pb-2">
            {hasDag ? (
              <List
                size="sm"
                split
                inset
                items={task.subtasks}
                renderItem={(sub) => {
                  const st = statusById[sub.id] ?? sub.status;
                  const dot = SUB_STATUS_DOT[st];
                  return (
                    <ListItem key={sub.id}>
                      <ListItem.Meta
                        avatar={<StatusDot status={dot.status} size="md" />}
                        title={
                          <span className={cn("text-[13px]", st === "failed" && "text-danger")}>{sub.title}</span>
                        }
                        description={
                          <span className="text-[11px] text-muted">
                            {executorName(sub.executorId)} · {fmtDuration(sub.durationMs)} · ¥{sub.costYuan.toFixed(2)}
                          </span>
                        }
                      />
                    </ListItem>
                  );
                }}
              />
            ) : (
              <div className="px-2 py-6">
                <Text size="sm" tone="muted">
                  该任务为单步执行，无子任务 DAG。
                </Text>
              </div>
            )}
          </CardBody>
          {hasDag && (
            <div className="border-t border-border px-4 py-3 text-xs text-muted">
              <div className="flex items-center justify-between">
                <span>子任务总耗时</span>
                <span className="font-medium text-foreground tabular-nums">{fmtDuration(sumDuration)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span>子任务总成本</span>
                <span className="font-medium text-foreground tabular-nums">¥{sumCost.toFixed(2)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* 中：DAG */}
        <Card variant="outline" className="min-w-0 overflow-hidden">
          <CardHeader className="flex items-center justify-between px-4 pt-4">
            <Text size="sm" weight="medium">
              多 agent 编排 DAG
            </Text>
            <Text size="xs" tone="muted">
              {hasDag ? `${task.subtasks.length} 个子任务 · ${task.edges.length} 条依赖` : "无 DAG"}
            </Text>
          </CardHeader>
          <CardBody className="p-3">
            {hasDag ? (
              <div className="h-[460px] w-full overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border">
                <TaskDetailDag task={task} statusById={statusById} activeId={activeId} />
              </div>
            ) : (
              <div className="grid h-[460px] place-items-center rounded-[calc(var(--radius)+0.25rem)] border border-dashed border-border">
                <Empty size="sm" title="单步任务" description="无多 agent 编排，直接派给单一执行器。" />
              </div>
            )}
          </CardBody>
        </Card>

        {/* 右：执行过程 */}
        <Card variant="outline" className="min-w-0">
          <CardHeader className="flex items-center justify-between px-4 pt-4">
            <Text size="sm" weight="medium">
              执行过程
            </Text>
            <ShimmerButton onClick={running ? reset : run} disabled={!hasDag} className="h-8 px-3 text-xs">
              {running ? (
                <>
                  <XCircle className="size-3.5" /> 停止
                </>
              ) : (
                <>
                  <Play className="size-3.5" /> 运行
                </>
              )}
            </ShimmerButton>
          </CardHeader>
          <CardBody className="space-y-3 px-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Progress value={progress} />
              </div>
              <Text size="xs" tone="muted" className="w-9 shrink-0 text-right tabular-nums">
                {progress}%
              </Text>
            </div>
            <TaskDetailFrames frames={frames} />
            <div className="flex items-center justify-between rounded-[var(--radius)] bg-surface-hover px-3 py-2 text-xs">
              <span className="text-muted">本次花费 / 预算</span>
              <span className="font-medium tabular-nums">
                <span className={cn(liveSpent > task.budgetYuan && "text-danger")}>¥{liveSpent.toFixed(2)}</span>
                <span className="text-muted"> / ¥{task.budgetYuan.toFixed(2)}</span>
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 底部：全链路 Timeline */}
      <Card variant="outline">
        <CardHeader className="px-4 pt-4">
          <Text size="sm" weight="medium">
            全链路时间线
          </Text>
        </CardHeader>
        <CardBody className="px-4 pb-4">
          <Timeline items={timelineItems} pending={running ? "编排执行中…" : undefined} />
        </CardBody>
      </Card>
    </div>
  );
}
