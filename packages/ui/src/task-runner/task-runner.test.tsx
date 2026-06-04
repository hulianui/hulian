import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TaskRunner, resolveProgress, statusMeta } from "./task-runner";
import type { AgentTask } from "../agent-plan";

const steps: AgentTask[] = [
  { title: "Allocate microVM", status: "done", meta: "180ms" },
  { title: "Restore snapshot", status: "done", meta: "820ms" },
  { title: "Execute main.js", status: "running", meta: "…" },
  { title: "Reclaim sandbox", status: "pending" },
];

describe("resolveProgress", () => {
  it("显式 progress 优先", () => {
    expect(resolveProgress(steps, 55)).toBe(55);
  });
  it("省略时按 done 比例派生", () => {
    // 2 done / 4 = 50
    expect(resolveProgress(steps)).toBe(50);
  });
  it("空步骤 → 0", () => {
    expect(resolveProgress([])).toBe(0);
  });
  it("显式 progress 越界夹紧", () => {
    expect(resolveProgress(steps, 250)).toBe(100);
    expect(resolveProgress(steps, -10)).toBe(0);
  });
});

describe("statusMeta", () => {
  it("四态 tone/label 映射", () => {
    expect(statusMeta("running").label).toBe("Running");
    expect(statusMeta("running").tone).toBe("brand");
    expect(statusMeta("success").label).toBe("Done");
    expect(statusMeta("error").progressTone).toBe("danger");
    expect(statusMeta("idle").tone).toBe("neutral");
  });
});

describe("TaskRunner", () => {
  it("渲染标题 + 标签 + 默认状态文字", () => {
    const { getByText } = render(
      <TaskRunner title="Sandbox" tag="node26" status="running" steps={steps} />,
    );
    expect(getByText("Sandbox")).toBeTruthy();
    expect(getByText("node26")).toBeTruthy();
    expect(getByText("Running")).toBeTruthy();
  });
  it("statusLabel 覆盖默认文字", () => {
    const { getByText, queryByText } = render(
      <TaskRunner title="Sandbox" status="running" statusLabel="执行中" steps={steps} />,
    );
    expect(getByText("执行中")).toBeTruthy();
    expect(queryByText("Running")).toBeNull();
  });
  it("steps 透传到内嵌 AgentPlan（含 meta 耗时）", () => {
    const { getByText } = render(<TaskRunner title="Sandbox" steps={steps} />);
    expect(getByText("Allocate microVM")).toBeTruthy();
    expect(getByText("180ms")).toBeTruthy();
  });
  it("footer 渲染累计耗时 + 状态", () => {
    const { getByText } = render(
      <TaskRunner title="Sandbox" steps={steps} elapsed="3.12s" footerStatus="Executing..." />,
    );
    expect(getByText("3.12s")).toBeTruthy();
    expect(getByText("Executing...")).toBeTruthy();
  });
  it("headerExtra / footerExtra 送掣渲染", () => {
    const { getByText } = render(
      <TaskRunner
        title="Sandbox"
        steps={steps}
        elapsed="3.12s"
        headerExtra={<button type="button">停止</button>}
        footerExtra={<span>自定义尾</span>}
      />,
    );
    expect(getByText("停止")).toBeTruthy();
    expect(getByText("自定义尾")).toBeTruthy();
  });
});
