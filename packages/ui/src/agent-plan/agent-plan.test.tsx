import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AgentPlan } from "./agent-plan";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const tasks = [
  { title: "读取首页", status: "done" as const },
  { title: "替换排版原语", status: "running" as const },
  { title: "补缺口组件", status: "pending" as const },
];

describe("AgentPlan", () => {
  // 护栏套在整棵计划树上（3 行 × StatusIcon），只有整树跳过才过。
  it("稳定父更新时跳过计划子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <AgentPlan tasks={tasks} title="执行计划" bare strikeDone />
    ));
  });

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
  it("meta 渲染在行右侧", () => {
    const { getByText } = render(
      <AgentPlan tasks={[{ title: "分配 microVM", status: "done", meta: "180ms" }]} />,
    );
    expect(getByText("180ms")).toBeTruthy();
  });
  it("running 行带高亮底色", () => {
    const { getByText } = render(<AgentPlan tasks={tasks} />);
    const li = getByText("替换排版原语").closest("li");
    expect(li?.className).toContain("bg-surface-hover");
  });
  it("pending 渲染空心环（非实心 Dot）", () => {
    const { container } = render(<AgentPlan tasks={[{ title: "回收沙箱", status: "pending" }]} />);
    expect(container.querySelector(".rounded-full.border-2")).toBeTruthy();
  });
  it("strikeDone=false 时 done 不加删除线（执行日志语义）", () => {
    const { getByText } = render(
      <AgentPlan strikeDone={false} tasks={[{ title: "已完成步骤", status: "done" }]} />,
    );
    expect(getByText("已完成步骤").className).not.toContain("line-through");
  });
  it("bare 去掉外层边框", () => {
    const { container } = render(<AgentPlan bare tasks={tasks} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toContain("border-border");
  });
});
