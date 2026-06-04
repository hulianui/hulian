"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AgentPlan } from "./agent-plan";

const tasks = [
  { title: "读取现有 page.tsx", status: "done" as const, detail: "确认仅用了 Button / ThemeToggler" },
  { title: "核对库内可复用原语", status: "done" as const },
  { title: "逐块替换为 @hulian/ui", status: "running" as const, detail: "排版 → Heading/Text，布局 → Stack" },
  { title: "补缺口组件（Dot / AI 套件）", status: "pending" as const },
  { title: "截图验证明暗双主题", status: "pending" as const },
];

const Demo = () => (
  <div className="w-full max-w-md">
    <AgentPlan tasks={tasks} />
  </div>
);

export const agentPlanShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "执行中计划（混合状态）", render: () => <Demo /> },
    {
      name: "含失败",
      render: () => (
        <div className="w-full max-w-md">
          <AgentPlan
            title="部署流程"
            tasks={[
              { title: "构建", status: "done" },
              { title: "推送镜像", status: "error", detail: "registry 超时" },
              { title: "滚动发布", status: "pending" },
            ]}
          />
        </div>
      ),
    },
  ],
  renderWithProps: () => <Demo />,
  toCode: () => `<AgentPlan tasks={[{ title, status: "done" }, …]} />`,
};
