"use client";
import { useEffect, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { TaskRunner } from "./task-runner";
import type { AgentTask } from "../agent-plan";
import type { TaskRunStatus } from "./task-runner.types";

const SANDBOX_STEPS: AgentTask[] = [
  { title: "Allocate microVM", status: "done", meta: "180ms" },
  { title: "Restore snapshot", status: "done", meta: "820ms" },
  { title: "Mount ephemeral FS", status: "done", meta: "620ms" },
  { title: "Boot runtime · Node 26", status: "done", meta: "1082ms" },
  { title: "Execute main.js", status: "running", meta: "…" },
  { title: "Reclaim sandbox", status: "pending" },
];

// 静态运行中（对照参考图）
function RunningCard() {
  return (
    <div className="w-full max-w-md">
      <TaskRunner
        title="Sandbox"
        tag="node26"
        status="running"
        steps={SANDBOX_STEPS}
        progress={58}
        elapsed="3.12s"
        footerStatus="Executing…"
      />
    </div>
  );
}

/**
 * 演示用驱动 hook：core 纯展示，运行/计时逻辑留消费侧。
 * 按顺序逐步把 pending→running→done 推进，并累计 elapsed。
 */
function useTaskRun(plan: AgentTask[], stepMs = 800) {
  const [cursor, setCursor] = useState(0);
  const [ms, setMs] = useState(0);
  const done = cursor >= plan.length;

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCursor((c) => c + 1), stepMs);
    return () => clearInterval(id);
  }, [done, stepMs]);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setMs((m) => m + 100), 100);
    return () => clearInterval(id);
  }, [done]);

  const steps: AgentTask[] = plan.map((t, i) => ({
    ...t,
    status: i < cursor ? "done" : i === cursor ? "running" : "pending",
  }));
  const status: TaskRunStatus = done ? "success" : "running";
  return { steps, status, elapsed: `${(ms / 1000).toFixed(2)}s`, done };
}

const PLAN: AgentTask[] = [
  { title: "Allocate microVM", status: "pending", meta: "180ms" },
  { title: "Restore snapshot", status: "pending", meta: "820ms" },
  { title: "Mount ephemeral FS", status: "pending", meta: "620ms" },
  { title: "Boot runtime · Node 26", status: "pending", meta: "1082ms" },
  { title: "Execute main.js", status: "pending", meta: "240ms" },
];

function DrivenCard() {
  const { steps, status, elapsed, done } = useTaskRun(PLAN, 900);
  return (
    <div className="w-full max-w-md">
      <TaskRunner
        title="Sandbox"
        tag="node26"
        status={status}
        steps={steps}
        elapsed={elapsed}
        footerStatus={done ? "Done" : "Executing…"}
      />
    </div>
  );
}

export const taskRunnerShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "运行中（Sandbox · 对照参考图）", render: () => <RunningCard /> },
    { name: "实时驱动（useTaskRun · 逐步推进+计时）", render: () => <DrivenCard /> },
    {
      name: "成功（全部完成）",
      render: () => (
        <div className="w-full max-w-md">
          <TaskRunner
            title="Build"
            tag="ci"
            status="success"
            steps={[
              { title: "Install deps", status: "done", meta: "4.2s" },
              { title: "Typecheck", status: "done", meta: "8.1s" },
              { title: "Bundle", status: "done", meta: "12.6s" },
            ]}
            elapsed="24.9s"
            footerStatus="Done"
          />
        </div>
      ),
    },
    {
      name: "失败",
      render: () => (
        <div className="w-full max-w-md">
          <TaskRunner
            title="Deploy"
            status="error"
            steps={[
              { title: "Build image", status: "done", meta: "31s" },
              { title: "Push registry", status: "error", detail: "registry 超时", meta: "—" },
              { title: "Rolling update", status: "pending" },
            ]}
            elapsed="46s"
            footerStatus="Failed"
          />
        </div>
      ),
    },
  ],
  renderWithProps: () => <RunningCard />,
  toCode: () =>
    `<TaskRunner
  title="Sandbox"
  tag="node26"
  status="running"
  steps={[{ title: "Allocate microVM", status: "done", meta: "180ms" }, …]}
  elapsed="3.12s"
  footerStatus="Executing…"
/>`,
};
