"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AgentPlan } from "../../../../packages/ui/src/agent-plan/agent-plan";
const tasks = [
    { title: "Read existing page.tsx", status: "done" as const, detail: "Confirmed that only Button / ThemeToggler is used" },
    { title: "Check the reusable primitives in the library", status: "done" as const },
    { title: "Replaced block by block with @hulianui/ui", status: "running" as const, detail: "Typesetting \u2192 Heading/Text, Layout \u2192 Stack" },
    { title: "Gap filling component (Dot / AI kit)", status: "pending" as const },
    { title: "Screenshot to verify light and dark dual themes", status: "pending" as const },
];
const Demo = () => (<div className="w-full max-w-md">
    <AgentPlan tasks={tasks}/>
  </div>);
export const agentPlanShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Data-driven task list, mixed status + running rows automatically highlighted.",
            code: `<AgentPlan
  tasks={[
    { title: "Read existing page.tsx", status: "done", detail: "Confirm that only Button / ThemeToggler" },
    { title: "Check the reusable primitives in the library", status: "done" },
    { title: "Replace block by block with @hulianui/ui", status: "running", detail: "Typesetting \u2192 Heading/Text" },
    { title: "Gap filling component", status: "pending" },
  ]}
/>`,
            render: () => (<div className="w-full max-w-md">
          <AgentPlan tasks={tasks}/>
        </div>),
        },
        {
            title: "Contains failed steps",
            description: "error status displays a red cross, customize title.",
            code: `<AgentPlan
  title="Deployment Process"
  tasks={[
    { title: "Build", status: "done" },
    { title: "Push Image", status: "error", detail: "registry Timeout" },
    { title: "Rolling Release", status: "pending" },
  ]}
/>`,
            render: () => (<div className="w-full max-w-md">
          <AgentPlan title="Deployment process" tasks={[
                    { title: "Build", status: "done" },
                    { title: "Push image", status: "error", detail: "registry Timeout" },
                    { title: "Rolling release", status: "pending" },
                ]}/>
        </div>),
        },
        {
            title: "Execution log (retain solid color)",
            description: "strikeDone={false} Let the completed items not be strikethrough, and display the time consumption with meta.",
            code: `<AgentPlan
  title="Execution Log"
  strikeDone={false}
  tasks={[
    { title: "Pull code", status: "done", meta: "120ms" },
    { title: "Run Test", status: "done", meta: "2.4s" },
    { title: "Generated product", status: "running" },
  ]}
/>`,
            render: () => (<div className="w-full max-w-md">
          <AgentPlan title="Execution log" strikeDone={false} tasks={[
                    { title: "Pull code", status: "done", meta: "120ms" },
                    { title: "Run the test", status: "done", meta: "2.4s" },
                    { title: "Generated products", status: "running" },
                ]}/>
        </div>),
        },
        {
            title: "Embedded (bare)",
            description: "bare Remove the outer border/background color for reuse in the card.",
            code: `<AgentPlan bare title={null} tasks={tasks} />`,
            render: () => (<div className="w-full max-w-md rounded-[var(--radius)] bg-surface-hover p-4">
          <AgentPlan bare title={null} tasks={tasks}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Executing plan (mixed status)", render: () => <Demo /> },
        {
            name: "Contains failure",
            render: () => (<div className="w-full max-w-md">
          <AgentPlan title="Deployment process" tasks={[
                    { title: "Build", status: "done" },
                    { title: "Push image", status: "error", detail: "registry Timeout" },
                    { title: "Rolling release", status: "pending" },
                ]}/>
        </div>),
        },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<AgentPlan tasks={[{ title, status: "done" }, \u2026]} />`,
};
