"use client";
import { copy } from "./use-flow-run.content";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FlowEdge, FlowNode } from "@hulianui/ui";
import { toast } from "@hulianui/ui";
import { ratioMeta } from "../_data/models";
import type { FlowNodeData, NodeResult } from "../_data/types";

type N = FlowNode<FlowNodeData>;

export interface RunLogEntry {
  id: string;
  title: string;
  text: string;
  status: "running" | "done";
}

/** Kahn 拓扑排序；有环则回退为原数组顺序（demo 不至于成环，但兜底）。 */
export function topoOrder(nodes: N[], edges: FlowEdge[]): string[] {
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const n of nodes) {
    indeg.set(n.id, 0);
    adj.set(n.id, []);
  }
  for (const e of edges) {
    if (!indeg.has(e.source) || !indeg.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }
  const queue = nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adj.get(id) ?? []) {
      indeg.set(next, (indeg.get(next) ?? 0) - 1);
      if ((indeg.get(next) ?? 0) === 0) queue.push(next);
    }
  }
  return order.length === nodes.length ? order : nodes.map((n) => n.id);
}

/** 取某节点的直接上游节点（按入边）。 */
function upstream(id: string, nodes: N[], edges: FlowEdge[]): N[] {
  const sources = edges.filter((e) => e.target === id).map((e) => e.source);
  return sources.map((s) => nodes.find((n) => n.id === s)).filter((n): n is N => !!n);
}

/** 计算单节点运行产物（读已完成的上游产物）。 */
function computeResult(node: N, nodes: N[], edges: FlowEdge[]): NodeResult | undefined {
  const d = node.data;
  switch (d.kind) {
    case "prompt":
      return undefined; // 文本节点无图像产物
    case "image-input":
      return { type: "image", seed: d.seed, meta: copy("referenceDiagram") };
    case "model": {
      const r = ratioMeta(d.ratio);
      return { type: "image", seed: d.seed, meta: `${r.w}×${r.h}` };
    }
    case "upscale": {
      const up = upstream(node.id, nodes, edges).find((n) => n.data.result?.type === "image");
      const seed = up?.data.result?.seed ?? 1;
      return { type: "image", seed, meta: copy("upscaleFactor", d.factor) };
    }
    case "i2v":
      return {
        type: "video",
        videoUrl: "/demo/sample-video.mp4",
        poster: "/demo/sample-poster.jpg",
        meta: `${d.duration}s · ${d.fps}fps`,
      };
    case "output": {
      const up = upstream(node.id, nodes, edges).find((n) => n.data.result);
      return up?.data.result ? { ...up.data.result } : undefined;
    }
  }
}

const STEP_MS = 850;

/** 工作流模拟执行：按拓扑序逐节点 running→done 并派生产物（不接真实服务）。 */
export function useFlowRun(
  nodes: N[],
  edges: FlowEdge[],
  setNodes: (updater: (ns: N[]) => N[]) => void,
) {
  const [running, setRunning] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [log, setLog] = useState<RunLogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const reset = useCallback(() => {
    clearTimers();
    setRunning(false);
    setActiveId(null);
    setLog([]);
    setProgress(0);
    setNodes((ns) =>
      ns.map((n) => ({ ...n, data: { ...n.data, status: "idle", result: undefined } })),
    );
  }, [setNodes]);

  const run = useCallback(() => {
    clearTimers();
    const order = topoOrder(nodes, edges);
    if (order.length === 0) return;
    const titleById = new Map(nodes.map((n) => [n.id, n.data.title]));

    setNodes((ns) =>
      ns.map((n) => ({ ...n, data: { ...n.data, status: "queued", result: undefined } })),
    );
    setRunning(true);
    setActiveId(null);
    setLog([]);
    setProgress(0);

    order.forEach((id, i) => {
      timers.current.push(
        setTimeout(() => {
          setActiveId(id);
          setNodes((ns) =>
            ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, status: "running" } } : n)),
          );
          setLog((l) => [
            ...l,
            {
              id: `${id}-${i}`,
              title: titleById.get(id) ?? copy("node"),
              text: copy("generating"),
              status: "running",
            },
          ]);
        }, i * STEP_MS + 100),
      );
      timers.current.push(
        setTimeout(() => {
          const title = titleById.get(id) ?? copy("node");
          setNodes((ns) =>
            ns.map((n) =>
              n.id === id
                ? { ...n, data: { ...n.data, status: "done", result: computeResult(n, ns, edges) } }
                : n,
            ),
          );
          setLog((l) =>
            l.map((e) =>
              e.id === `${id}-${i}` ? { ...e, text: copy("done"), status: "done" } : e,
            ),
          );
          setProgress(Math.round(((i + 1) / order.length) * 100));
          toast({ title: copy("stepComplete", title), tone: "neutral" });
        }, i * STEP_MS + STEP_MS - 50),
      );
    });

    timers.current.push(
      setTimeout(() => {
        setRunning(false);
        setActiveId(null);
        toast({
          title: copy("workflowRunComplete"),
          description: copy("processedNodeCount", order.length),
          tone: "info",
        });
      }, order.length * STEP_MS + 120),
    );
  }, [nodes, edges, setNodes]);

  return { running, activeId, log, progress, run, reset };
}
