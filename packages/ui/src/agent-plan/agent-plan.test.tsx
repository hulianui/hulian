import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AgentPlan } from "./agent-plan";

const tasks = [
  { title: "读取首页", status: "done" as const },
  { title: "替换排版原语", status: "running" as const },
  { title: "补缺口组件", status: "pending" as const },
];

describe("AgentPlan", () => {
  it("渲染全部任务 + 标题", () => {
    const { getByText } = render(<AgentPlan tasks={tasks} />);
    expect(getByText("执行计划")).toBeTruthy();
    expect(getByText("读取首页")).toBeTruthy();
    expect(getByText("补缺口组件")).toBeTruthy();
  });
  it("done 任务加删除线", () => {
    const { getByText } = render(<AgentPlan tasks={tasks} />);
    expect(getByText("读取首页").className).toContain("line-through");
  });
  it("running 任务渲转圈 spinner", () => {
    const { container } = render(<AgentPlan tasks={tasks} />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });
  it("title=null 隐藏标题", () => {
    const { queryByText } = render(<AgentPlan tasks={tasks} title={null} />);
    expect(queryByText("执行计划")).toBeNull();
  });
});
