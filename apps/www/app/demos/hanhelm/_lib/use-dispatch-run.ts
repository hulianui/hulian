"use client";
// 任务派发模拟执行 hook：给定任务的子任务 DAG，按拓扑序逐子任务 pending→running→done 推进，
// 按 mulberry32(seed) 在某个子任务确定性触发 failover（failed→failover→done），
// 流式吐过程帧 + 进度 + 当前节点。不接真实服务、无 Math.random/Date.now（基准时间由调用方传入）。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RunFrame, SubTask, SubTaskStatus, Task } from "../_data/types";
import { EXECUTOR_HEALTH_MAP, EXECUTORS, executorName } from "../_data/executors";
import { nextFallback } from "./failover";

/** 确定性伪随机（mulberry32），同 seed 同序列。 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 执行器 id → 降级链（静态构建）。 */
const CHAIN_BY_EXEC: Record<string, string[]> = Object.fromEntries(
  EXECUTORS.map((e) => [e.id, e.fallbackChain]),
);

/** Kahn 拓扑排序；成环兜底为原顺序。 */
export function topoOrderSubtasks(subtasks: SubTask[]): string[] {
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const s of subtasks) {
    indeg.set(s.id, 0);
    adj.set(s.id, []);
  }
  for (const s of subtasks) {
    for (const dep of s.deps) {
      if (!indeg.has(dep)) continue;
      adj.get(dep)!.push(s.id);
      indeg.set(s.id, (indeg.get(s.id) ?? 0) + 1);
    }
  }
  const queue = subtasks.filter((s) => (indeg.get(s.id) ?? 0) === 0).map((s) => s.id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adj.get(id) ?? []) {
      indeg.set(next, (indeg.get(next) ?? 0) - 1);
      if ((indeg.get(next) ?? 0) === 0) queue.push(next);
    }
  }
  return order.length === subtasks.length ? order : subtasks.map((s) => s.id);
}

export interface DispatchFailover {
  subtaskId: string;
  from: string;
  to: string;
  reason: string;
}

export interface UseDispatchRunOptions {
  /** 步进毫秒（每时间槽间隔）。默认 900。 */
  stepMs?: number;
  /** 确定性种子。默认由 task.id 派生。 */
  seed?: number;
}

export interface DispatchRunState {
  running: boolean;
  /** 当前正在执行的子任务 id。 */
  activeId: string | null;
  /** 每个子任务的实时状态（覆盖原始 status）。 */
  statusById: Record<string, SubTaskStatus>;
  /** 已流出的过程帧（含派生的 failover 帧）。 */
  frames: RunFrame[];
  /** 0-100。 */
  progress: number;
  /** 本次运行发生的降级记录。 */
  failovers: DispatchFailover[];
  run: () => void;
  reset: () => void;
}

/** 由字符串派生稳定 seed（FNV-1a）。 */
function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 追加一帧。 */
function pushFrame(set: Dispatch<SetStateAction<RunFrame[]>>, frame: RunFrame) {
  set((fs) => [...fs, frame]);
}

/**
 * 任务派发模拟执行。
 * 推进逻辑：拓扑序逐子任务 → running →（按 seed 判定是否注入 failover）→ done。
 * failover 注入：每个子任务以 rnd() < 0.18 概率触发一次降级，目标取该子任务执行器降级链中
 * 第一个 healthy 的执行器（nextFallback）；若链尽则不注入，直接 done。
 */
export function useDispatchRun(task: Task, options: UseDispatchRunOptions = {}): DispatchRunState {
  const stepMs = options.stepMs ?? 900;
  const seed = options.seed ?? seedFromId(task.id);

  const order = useMemo(() => topoOrderSubtasks(task.subtasks), [task.subtasks]);
  const byId = useMemo(() => new Map(task.subtasks.map((s) => [s.id, s])), [task.subtasks]);

  const [running, setRunning] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusById, setStatusById] = useState<Record<string, SubTaskStatus>>({});
  const [frames, setFrames] = useState<RunFrame[]>([]);
  const [progress, setProgress] = useState(0);
  const [failovers, setFailovers] = useState<DispatchFailover[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setRunning(false);
    setActiveId(null);
    setStatusById({});
    setFrames([]);
    setProgress(0);
    setFailovers([]);
  }, [clearTimers]);

  const run = useCallback(() => {
    clearTimers();
    if (order.length === 0) return;
    const rnd = mulberry32(seed);

    setStatusById(Object.fromEntries(order.map((id) => [id, "pending" as SubTaskStatus])));
    setFrames([]);
    setProgress(0);
    setFailovers([]);
    setRunning(true);
    setActiveId(null);

    let slot = 0; // 时间槽游标（含 failover 额外槽）
    order.forEach((id, i) => {
      const sub = byId.get(id);
      if (!sub) return;

      // 是否注入 failover（确定性），目标取降级链中首个 healthy 执行器。
      const inject = rnd() < 0.18;
      const chain = [sub.executorId, ...(CHAIN_BY_EXEC[sub.executorId] ?? [])];
      const fbTo = inject ? nextFallback(chain, sub.executorId, EXECUTOR_HEALTH_MAP) : null;

      const startSlot = slot;
      timers.current.push(
        setTimeout(() => {
          setActiveId(id);
          setStatusById((m) => ({ ...m, [id]: "running" }));
          pushFrame(setFrames, { kind: "tool", text: `调用 ${executorName(sub.executorId)} · ${sub.title}`, at: startSlot * stepMs });
        }, startSlot * stepMs + 60),
      );
      slot += 1;

      if (inject && fbTo) {
        const failSlot = slot;
        timers.current.push(
          setTimeout(() => {
            setStatusById((m) => ({ ...m, [id]: "failed" }));
            pushFrame(setFrames, { kind: "event", text: `⚠ ${executorName(sub.executorId)} 执行失败，触发降级。`, at: failSlot * stepMs });
            setFailovers((f) => [...f, { subtaskId: id, from: sub.executorId, to: fbTo, reason: `${executorName(sub.executorId)} 失败，降级至 ${executorName(fbTo)}` }]);
          }, failSlot * stepMs + 60),
        );
        slot += 1;

        const recSlot = slot;
        timers.current.push(
          setTimeout(() => {
            setStatusById((m) => ({ ...m, [id]: "failover" }));
            pushFrame(setFrames, { kind: "thinking", text: `按降级链切换至 ${executorName(fbTo)} 重试…`, at: recSlot * stepMs });
          }, recSlot * stepMs + 60),
        );
        slot += 1;
      }

      const doneSlot = slot;
      timers.current.push(
        setTimeout(() => {
          setStatusById((m) => ({ ...m, [id]: "done" }));
          pushFrame(setFrames, { kind: "stream", text: `${sub.title} 完成（${(sub.durationMs / 1000).toFixed(1)}s · ¥${sub.costYuan.toFixed(2)}）`, at: doneSlot * stepMs });
          setProgress(Math.round(((i + 1) / order.length) * 100));
        }, doneSlot * stepMs + 60),
      );
      slot += 1;
    });

    timers.current.push(
      setTimeout(() => {
        setRunning(false);
        setActiveId(null);
        pushFrame(setFrames, { kind: "event", text: "任务全部子节点执行完成，编排结束。", at: slot * stepMs });
      }, slot * stepMs + 120),
    );
  }, [order, byId, seed, stepMs, clearTimers]);

  return { running, activeId, statusById, frames, progress, failovers, run, reset };
}
