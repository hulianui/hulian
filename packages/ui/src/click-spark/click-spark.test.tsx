import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ClickSpark } from "./click-spark";

describe("ClickSpark", () => {
  it("渲染根容器 + aria-hidden canvas + children", () => {
    const { container, getByText } = render(
      <ClickSpark>
        <button>戳我</button>
      </ClickSpark>,
    );
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    const canvas = root.querySelector("canvas")!;
    expect(canvas).not.toBeNull();
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(getByText("戳我")).toBeTruthy();
  });

  it("根容器带 relative 定位类，canvas 不拦截指针", () => {
    const { container } = render(<ClickSpark />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("relative");
    const canvas = root.querySelector("canvas")!;
    expect(canvas.getAttribute("class")).toContain("pointer-events-none");
    expect(canvas.getAttribute("class")).toContain("absolute");
  });

  it("className / 任意 props 透传根容器", () => {
    const { container } = render(
      <ClickSpark className="my-stage" data-testid="cs" />,
    );
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("my-stage");
    expect(root.getAttribute("data-testid")).toBe("cs");
  });

  it("点击不抛错（jsdom 无 2d 上下文，绘制安全退出）", () => {
    const { container } = render(
      <ClickSpark>
        <div style={{ width: 200, height: 100 }}>click</div>
      </ClickSpark>,
    );
    const root = container.firstElementChild!;
    expect(() => fireEvent.click(root)).not.toThrow();
  });
});
