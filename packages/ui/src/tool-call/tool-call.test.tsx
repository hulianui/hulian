import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ToolCall } from "./tool-call";

describe("ToolCall", () => {
  it("渲染工具名 + 默认完成状态", () => {
    const { getByText } = render(<ToolCall name="search_web" />);
    expect(getByText("search_web")).toBeTruthy();
    expect(getByText("完成")).toBeTruthy();
  });
  it("running 状态渲转圈 spinner + 文案运行中", () => {
    const { container, getByText } = render(<ToolCall name="run_code" status="running" />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(getByText("运行中")).toBeTruthy();
  });
  it("error 状态文案失败", () => {
    const { getByText } = render(<ToolCall name="fetch" status="error" />);
    expect(getByText("失败")).toBeTruthy();
  });
  it("defaultOpen 时面板参数/结果可见", () => {
    const { getByText } = render(
      <ToolCall name="t" defaultOpen input="{q:1}" output="ok" />,
    );
    expect(getByText("参数")).toBeTruthy();
    expect(getByText("结果")).toBeTruthy();
  });
});
