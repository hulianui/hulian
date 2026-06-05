"use client";
// 任务详情中栏：多 agent 编排 DAG（复用 @hulian/ui Flow，只读快照）。
// 把 task.subtasks 转成 Flow 节点（position 由分层算法计算），task.edges 转成 Flow 连线。
// 节点实时状态由 useDispatchRun 的 statusById / activeId 驱动着色。

import { useMemo, useRef } from "react";
import { Flow, Spinner, cn } from "@hulian/ui";
import type { FlowApi, FlowEdge, FlowHandleSpec, FlowNode } from "@hulian/ui";
import type { SubTask, SubTaskStatus, Task } from "../_data/types";
import { executorName } from "../_data/executors";
import { topoOrderSubtasks } from "../_lib/use-dispatch-run";

interface NodeData {
  sub: SubTask;
  status: SubTaskStatus;
  active: boolean;
}

/**
 * 分层布局：按到根（无依赖）的最长依赖深度作为层（x），同层节点按出现顺序堆叠（y）。
 * x = depth * COL_GAP，y = indexInLayer * ROW_GAP。
 * depth 用 DAG 最长路径（拓扑序上松弛）求得，保证子节点恒在父节点右侧。
 */
const COL_GAP = 260;
const ROW_GAP = 120;

export function computeDagLayout(
  subtasks: SubTask[],
): Record<string, { x: number; y: number }> {
  const order = topoOrderSubtasks(subtasks);
  const byId = new Map(subtasks.map((s) => [s.id, s]));
  const depth: Record<string, number> = {};
  // 拓扑序松弛求最长依赖深度。
  for (const id of order) {
    const sub = byId.get(id);
    if (!sub) continue;
    const deps = sub.deps.filter((d) => byId.has(d));
    depth[id] = deps.length === 0 ? 0 : Math.max(...deps.map((d) => (depth[d] ?? 0) + 1));
  }
  // 同层内按 order 顺序堆叠。
  const layerCount: Record<number, number> = {};
  const pos: Record<string, { x: number; y: number }> = {};
  for (const id of order) {
    const d = depth[id] ?? 0;
    const idx = layerCount[d] ?? 0;
    layerCount[d] = idx + 1;
    pos[id] = { x: d * COL_GAP, y: idx * ROW_GAP };
  }
  return pos;
}

/** 状态 → 节点左侧色条 + 徽标文案/色。 */
const STATUS_META: Record<SubTaskStatus, { bar: string; label: string; tone: string }> = {
  pending: { bar: "before:bg-muted", label: "待执行", tone: "text-muted bg-surface-hover" },
  running: { bar: "before:bg-primary", label: "执行中", tone: "text-primary bg-primary/10" },
  failover: { bar: "before:bg-warning", label: "降级中", tone: "text-warning bg-warning/10" },
  failed: { bar: "before:bg-danger", label: "失败", tone: "text-danger bg-danger/10" },
  done: { bar: "before:bg-success", label: "完成", tone: "text-success bg-success/10" },
};

const CAP_LABEL: Record<string, string> = {
  text: "文本",
  code: "代码",
  image: "图像",
  translate: "翻译",
  rag: "检索",
  extract: "抽取",
  moderate: "审核",
  orchestrate: "编排",
};

function getHandles(node: FlowNode<NodeData>): FlowHandleSpec[] {
  const hs: FlowHandleSpec[] = [];
  // 有依赖 → 入桩；被依赖（有出边）由 edges 决定，这里统一两侧都给，简洁稳妥。
  hs.push({ id: "in", type: "target", label: "输入" });
  hs.push({ id: "out", type: "source", label: "输出" });
  return hs;
}

interface TaskDetailDagProps {
  task: Task;
  statusById: Record<string, SubTaskStatus>;
  activeId: string | null;
}

export function TaskDetailDag({ task, statusById, activeId }: TaskDetailDagProps) {
  const api = useRef<FlowApi | null>(null);
  const layout = useMemo(() => computeDagLayout(task.subtasks), [task.subtasks]);

  const nodes: FlowNode<NodeData>[] = useMemo(
    () =>
      task.subtasks.map((sub) => ({
        id: sub.id,
        position: layout[sub.id] ?? { x: 0, y: 0 },
        data: {
          sub,
          // 运行态优先覆盖原始 status；未运行时回落数据自带 status。
          status: statusById[sub.id] ?? sub.status,
          active: activeId === sub.id,
        },
      })),
    [task.subtasks, layout, statusById, activeId],
  );

  const edges: FlowEdge[] = useMemo(
    () => task.edges.map((e, i) => ({ id: `e-${e.source}-${e.target}-${i}`, source: e.source, target: e.target })),
    [task.edges],
  );

  // 运行中的链路（连入 active 节点的边）走流光。
  const isEdgeAnimated = (edge: FlowEdge) =>
    activeId != null && edge.target === activeId && statusById[activeId] === "running";

  return (
    <Flow<NodeData>
      nodes={nodes}
      edges={edges}
      getHandles={getHandles}
      apiRef={api}
      controls
      background
      isEdgeAnimated={isEdgeAnimated}
      className="h-full w-full"
      renderNode={(n) => {
        const { sub, status, active } = n.data;
        const meta = STATUS_META[status];
        return (
          <div
            className={cn(
              "relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] before:absolute before:inset-y-0 before:left-0 before:w-1",
              meta.bar,
              active && "ring-2 ring-primary/60",
            )}
          >
            <div className="px-3.5 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] font-semibold leading-tight text-foreground">{sub.title}</div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    meta.tone,
                  )}
                >
                  {status === "running" && <Spinner size="sm" tone="primary" />}
                  {meta.label}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[11px]">{CAP_LABEL[sub.capability] ?? sub.capability}</span>
                <span className="truncate">{executorName(sub.executorId)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted tabular-nums">
                <span>{(sub.durationMs / 1000).toFixed(1)}s</span>
                <span>·</span>
                <span>¥{sub.costYuan.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
