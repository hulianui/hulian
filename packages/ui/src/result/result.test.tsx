import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Result } from "./result";

describe("Result", () => {
  it("渲染标题与副标题", () => {
    const { getByText } = render(<Result status="success" title="操作成功" subTitle="已保存" />);
    expect(getByText("操作成功")).toBeTruthy();
    expect(getByText("已保存")).toBeTruthy();
  });

  it("默认按 status 渲染内置图标（svg）", () => {
    const { container } = render(<Result status="error" title="x" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("icon={null} 不渲染图标", () => {
    const { container } = render(<Result status="success" icon={null} title="x" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("自定义 icon 覆盖内置", () => {
    const { getByTestId, container } = render(
      <Result icon={<i data-testid="custom" />} title="x" />,
    );
    expect(getByTestId("custom")).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("status=success 图标着语义成功色", () => {
    const { container } = render(<Result status="success" title="x" />);
    const iconWrap = container.querySelector("span");
    expect(iconWrap?.className.includes("text-success")).toBe(true);
  });

  it("status=500 图标着危险色（服务器错误）", () => {
    const { container } = render(<Result status="500" title="x" />);
    const iconWrap = container.querySelector("span");
    expect(iconWrap?.className.includes("text-danger")).toBe(true);
  });

  it("content 渲染详情区", () => {
    const { getByText } = render(<Result status="error" title="x" content="字段校验失败" />);
    expect(getByText("字段校验失败")).toBeTruthy();
  });

  it("children 作为操作区渲染", () => {
    const { getByText } = render(
      <Result status="success" title="x">
        <button>返回首页</button>
      </Result>,
    );
    expect(getByText("返回首页")).toBeTruthy();
  });

  it("默认 status=info 着 info 语义色（0.8.0 前借主色，见 #173）", () => {
    const { container } = render(<Result title="x" />);
    const iconWrap = container.querySelector("span");
    expect(iconWrap?.className.includes("text-info")).toBe(true);
  });
});
