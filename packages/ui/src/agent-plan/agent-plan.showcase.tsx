"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AgentPlan } from "./agent-plan";

const tasks = [
  { title: "读取现有 page.tsx", status: "done" as const, detail: "确认仅用了 Button / ThemeToggler" },
  { title: "核对库内可复用原语", status: "done" as const },
  { title: "逐块替换为 @hulianui/ui", status: "running" as const, detail: "排版 → Heading/Text，布局 → Stack" },
  { title: "补缺口组件（Dot / AI 套件）", status: "pending" as const },
  { title: "截图验证明暗双主题", status: "pending" as const },
];

const Demo = () => (
  <div className="w-full max-w-md">
    <AgentPlan tasks={tasks} />
  </div>
);

export const agentPlanShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "数据驱动的任务清单，混合状态 + running 行自动高亮。",
      code: `<AgentPlan
  tasks={[
    { title: "读取现有 page.tsx", status: "done", detail: "确认仅用了 Button / ThemeToggler" },
    { title: "核对库内可复用原语", status: "done" },
    { title: "逐块替换为 @hulianui/ui", status: "running", detail: "排版 → Heading/Text" },
    { title: "补缺口组件", status: "pending" },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <AgentPlan tasks={tasks} />
        </div>
      ),
    },
    {
      title: "含失败步骤",
      description: "error 状态显示红叉，自定义 title。",
      code: `<AgentPlan
  title="部署流程"
  tasks={[
    { title: "构建", status: "done" },
    { title: "推送镜像", status: "error", detail: "registry 超时" },
    { title: "滚动发布", status: "pending" },
  ]}
/>`,
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
    {
      title: "执行日志（保留实色）",
      description: "strikeDone={false} 让已完成项不加删除线，配合 meta 显示耗时。",
      code: `<AgentPlan
  title="执行日志"
  strikeDone={false}
  tasks={[
    { title: "拉取代码", status: "done", meta: "120ms" },
    { title: "运行测试", status: "done", meta: "2.4s" },
    { title: "生成产物", status: "running" },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <AgentPlan
            title="执行日志"
            strikeDone={false}
            tasks={[
              { title: "拉取代码", status: "done", meta: "120ms" },
              { title: "运行测试", status: "done", meta: "2.4s" },
              { title: "生成产物", status: "running" },
            ]}
          />
        </div>
      ),
    },
    {
      title: "内嵌（bare）",
      description: "bare 去掉外层边框/底色，供卡片内复用。",
      code: `<AgentPlan bare title={null} tasks={tasks} />`,
      render: () => (
        <div className="w-full max-w-md rounded-[var(--radius)] bg-surface-hover p-4">
          <AgentPlan bare title={null} tasks={tasks} />
        </div>
      ),
    },
  ],
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
