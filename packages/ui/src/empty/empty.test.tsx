import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Empty } from "./empty";

describe("Empty", () => {
  it("渲染标题与描述", () => {
    const { getByText } = render(<Empty title="暂无数据" description="空空如也" />);
    expect(getByText("暂无数据")).toBeTruthy();
    expect(getByText("空空如也")).toBeTruthy();
  });

  it("默认渲染内置图标（svg）", () => {
    const { container } = render(<Empty title="x" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("icon={null} 不渲染图标", () => {
    const { container } = render(<Empty icon={null} title="x" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("自定义 icon 覆盖内置", () => {
    const { getByTestId, container } = render(<Empty icon={<i data-testid="custom" />} title="x" />);
    expect(getByTestId("custom")).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("children 作为操作区渲染", () => {
    const { getByText } = render(
      <Empty title="x">
        <button>新建</button>
      </Empty>,
    );
    expect(getByText("新建")).toBeTruthy();
  });

  it("size=sm 收紧内边距", () => {
    const { container } = render(<Empty size="sm" title="x" />);
    expect((container.firstElementChild as HTMLElement).classList.contains("py-6")).toBe(true);
  });
});
