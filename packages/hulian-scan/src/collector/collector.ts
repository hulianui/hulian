import type { ScanEvent } from "../contracts";

export interface ScanCollector {
  accept(event: ScanEvent): void;
  beginStep(stepId: string, atMs: number): void;
  endStep(stepId: string, atMs: number): void;
  finalize(): { events: ScanEvent[]; errors: string[] };
}

interface StepWindow {
  stepId: string;
  startMs: number;
  endMs: number;
}

export function createCollector(): ScanCollector {
  const events: ScanEvent[] = [];
  const open = new Map<string, number>();
  const closed: StepWindow[] = [];
  const errors: string[] = [];

  return {
    // 到达时不打标签。React 把一次 commit 与它的全部 fiber 渲染整批 sink 出来，
    // 这一批的**到达**时刻可能已经晚于渲染真正**发生**的那个窗口——慢机器上尤其明显，
    // mount 的渲染会被记成下一步产生的重渲染，cascadeFanout 因此虚高。
    // 归属统一放到 finalize 里按时间戳算。
    accept(event) {
      events.push(event);
    },
    beginStep(stepId, atMs) {
      if (open.has(stepId)) {
        errors.push(`step already open: ${stepId}`);
        return;
      }
      open.set(stepId, atMs);
    },
    endStep(stepId, atMs) {
      const start = open.get(stepId);
      if (start === undefined || atMs < start) {
        errors.push(`invalid step window: ${stepId}`);
      }
      open.delete(stepId);
      if (start !== undefined) {
        closed.push({ stepId, startMs: start, endMs: Math.max(atMs, start) });
      }
    },
    finalize() {
      for (const stepId of open.keys()) {
        errors.push(`step not closed: ${stepId}`);
      }
      // 未闭合的窗口仍参与归属（右端开放），否则最后一步的事件会整批丢标签。
      const windows: StepWindow[] = [
        ...closed,
        ...[...open.entries()].map(([stepId, startMs]) => ({
          stepId,
          startMs,
          endMs: Number.POSITIVE_INFINITY,
        })),
      ];
      // 窗口重叠时不猜，沿用旧语义：只有恰好命中一个窗口才打标签。
      const stepAt = (atMs: number): string | undefined => {
        const hits = windows.filter((window) => atMs >= window.startMs && atMs <= window.endMs);
        return hits.length === 1 ? hits[0]!.stepId : undefined;
      };
      // commit 的 timestampMs 是它**开始**的时刻（适配器传的是 commit-start），按它落窗；
      // 同一次 commit 的 fiber 渲染是同一份工作，跟随该 commit 的归属。
      const stepByCommit = new Map<number, string>();
      for (const event of events) {
        if (event.type !== "commit") continue;
        const stepId = stepAt(event.timestampMs);
        if (stepId !== undefined) stepByCommit.set(event.commitId, stepId);
      }
      const resolved = events.map((event) => {
        const stepId = stepByCommit.get(event.commitId);
        return stepId === undefined ? event : { ...event, stepId };
      });
      if (!resolved.some((event) => event.type === "commit")) {
        errors.push("no React commit captured");
      }
      return { events: resolved, errors: [...errors] };
    },
  };
}
