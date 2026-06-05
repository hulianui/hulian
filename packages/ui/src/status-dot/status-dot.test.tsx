import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusDot } from "./status-dot";

describe("StatusDot", () => {
  it("渲染语义标签", () => {
    const { getByText } = render(<StatusDot status="online" label="在线" />);
    expect(getByText("在线")).toBeTruthy();
  });

  it("offline 映射 danger 圆点", () => {
    const { container } = render(<StatusDot status="offline" label="离线" />);
    expect(container.querySelector(".bg-danger")).toBeTruthy();
  });

  it("online 映射 success 圆点且默认脉冲", () => {
    const { container } = render(<StatusDot status="online" label="在线" />);
    expect(container.querySelector(".bg-success")).toBeTruthy();
    expect(container.querySelector(".animate-ping")).toBeTruthy();
  });

  it("degraded 默认不脉冲", () => {
    const { container } = render(<StatusDot status="degraded" label="降级" />);
    expect(container.querySelector(".animate-ping")).toBeNull();
  });

  it("extra 槽渲染数值", () => {
    const { getByText } = render(<StatusDot status="degraded" label="降级" extra="128ms" />);
    expect(getByText("128ms")).toBeTruthy();
  });
});
