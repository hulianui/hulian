"use client";
import { useEffect, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TaskRunner } from "../../../../packages/ui/src/task-runner/task-runner";
import type { AgentTask } from "../../../../packages/ui/src/agent-plan";
import type { TaskRunStatus } from "../../../../packages/ui/src/task-runner/task-runner.types";
const SANDBOX_STEPS: AgentTask[] = [
    { title: "Allocate microVM", status: "done", meta: "180ms" },
    { title: "Restore snapshot", status: "done", meta: "820ms" },
    { title: "Mount ephemeral FS", status: "done", meta: "620ms" },
    { title: "Boot runtime \u00B7 Node 26", status: "done", meta: "1082ms" },
    { title: "Execute main.js", status: "running", meta: "\u2026" },
    { title: "Reclaim sandbox", status: "pending" },
];
function RunningCard() {
    return (<div className="w-full max-w-md">
      <TaskRunner title="Sandbox" tag="node26" status="running" steps={SANDBOX_STEPS} progress={58} elapsed="3.12s" footerStatus="Executing…"/>
    </div>);
}
function useTaskRun(plan: AgentTask[], stepMs = 800) {
    const [cursor, setCursor] = useState(0);
    const [ms, setMs] = useState(0);
    const done = cursor >= plan.length;
    useEffect(() => {
        if (done)
            return;
        const id = setInterval(() => setCursor((c) => c + 1), stepMs);
        return () => clearInterval(id);
    }, [done, stepMs]);
    useEffect(() => {
        if (done)
            return;
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
    { title: "Boot runtime \u00B7 Node 26", status: "pending", meta: "1082ms" },
    { title: "Execute main.js", status: "pending", meta: "240ms" },
];
function DrivenCard() {
    const { steps, status, elapsed, done } = useTaskRun(PLAN, 900);
    return (<div className="w-full max-w-md">
      <TaskRunner title="Sandbox" tag="node26" status={status} steps={steps} elapsed={elapsed} footerStatus={done ? "Done" : "Executing\u2026"}/>
    </div>);
}
export const taskRunnerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Running",
            description: "status=running Head logo pulse; progress Explicit control of progress bar.",
            code: `<TaskRunner
  title="Sandbox"
  tag="node26"
  status="running"
  steps={[
    { title: "Allocate microVM", status: "done", meta: "180ms" },
    { title: "Restore snapshot", status: "done", meta: "820ms" },
    { title: "Boot runtime \u00B7 Node 26", status: "done", meta: "1082ms" },
    { title: "Execute main.js", status: "running", meta: "\u2026" },
    { title: "Reclaim sandbox", status: "pending" },
  ]}
  progress={58}
  elapsed="3.12s"
  footerStatus="Executing\u2026"
/>`,
            render: () => (<div className="w-full max-w-md">
          <TaskRunner title="Sandbox" tag="node26" status="running" steps={[
                    { title: "Allocate microVM", status: "done", meta: "180ms" },
                    { title: "Restore snapshot", status: "done", meta: "820ms" },
                    { title: "Boot runtime \u00B7 Node 26", status: "done", meta: "1082ms" },
                    { title: "Execute main.js", status: "running", meta: "\u2026" },
                    { title: "Reclaim sandbox", status: "pending" },
                ]} progress={58} elapsed="3.12s" footerStatus="Executing…"/>
        </div>),
        },
        {
            title: "Success",
            description: "status=success; when progress is omitted, the step ratio is automatically derived as 100% by done.",
            code: `<TaskRunner
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
/>`,
            render: () => (<div className="w-full max-w-md">
          <TaskRunner title="Build" tag="ci" status="success" steps={[
                    { title: "Install deps", status: "done", meta: "4.2s" },
                    { title: "Typecheck", status: "done", meta: "8.1s" },
                    { title: "Bundle", status: "done", meta: "12.6s" },
                ]} elapsed="24.9s" footerStatus="Done"/>
        </div>),
        },
        {
            title: "Failed",
            description: "status=error red logo; use detail to indicate the reason for failed steps.",
            code: `<TaskRunner
  title="Deploy"
  status="error"
  steps={[
    { title: "Build image", status: "done", meta: "31s" },
    { title: "Push registry", status: "error", detail: "registry timeout", meta: "-" },
    { title: "Rolling update", status: "pending" },
  ]}
  elapsed="46s"
  footerStatus="Failed"
/>`,
            render: () => (<div className="w-full max-w-md">
          <TaskRunner title="Deploy" status="error" steps={[
                    { title: "Build image", status: "done", meta: "31s" },
                    { title: "Push registry", status: "error", detail: "registry Timeout", meta: "\u2014" },
                    { title: "Rolling update", status: "pending" },
                ]} elapsed="46s" footerStatus="Failed"/>
        </div>),
        },
        {
            title: "No bottom bar",
            description: "Bottom bar is not rendered when elapsed/footerStatus/footerExtra is omitted.",
            code: `<TaskRunner
  title="Lint"
  status="running"
  steps={[
    { title: "Scan files", status: "done" },
    { title: "Apply rules", status: "running" },
  ]}
/>`,
            render: () => (<div className="w-full max-w-md">
          <TaskRunner title="Lint" status="running" steps={[
                    { title: "Scan files", status: "done" },
                    { title: "Apply rules", status: "running" },
                ]}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Running (Sandbox \u00B7 Compare with the reference picture)", render: () => <RunningCard /> },
        { name: "Real-time driver (useTaskRun \u00B7 Step by step + timing)", render: () => <DrivenCard /> },
        {
            name: "Success (all completed)",
            render: () => (<div className="w-full max-w-md">
          <TaskRunner title="Build" tag="ci" status="success" steps={[
                    { title: "Install deps", status: "done", meta: "4.2s" },
                    { title: "Typecheck", status: "done", meta: "8.1s" },
                    { title: "Bundle", status: "done", meta: "12.6s" },
                ]} elapsed="24.9s" footerStatus="Done"/>
        </div>),
        },
        {
            name: "Failed",
            render: () => (<div className="w-full max-w-md">
          <TaskRunner title="Deploy" status="error" steps={[
                    { title: "Build image", status: "done", meta: "31s" },
                    { title: "Push registry", status: "error", detail: "registry Timeout", meta: "\u2014" },
                    { title: "Rolling update", status: "pending" },
                ]} elapsed="46s" footerStatus="Failed"/>
        </div>),
        },
    ],
    renderWithProps: () => <RunningCard />,
    toCode: () => `<TaskRunner
  title="Sandbox"
  tag="node26"
  status="running"
  steps={[{ title: "Allocate microVM", status: "done", meta: "180ms" }, \u2026]}
  elapsed="3.12s"
  footerStatus="Executing\u2026"
/>`,
};
