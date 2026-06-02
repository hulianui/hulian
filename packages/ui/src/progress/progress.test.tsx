import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { progressPercent, dashOffset, Progress } from "./progress";

describe("progressPercent", () => {
  it("value/max → 百分比", () => {
    expect(progressPercent(40, 100)).toBe(40);
    expect(progressPercent(5, 10)).toBe(50);
  });
  it("超出上下界 clamp 到 0..100", () => {
    expect(progressPercent(120, 100)).toBe(100);
    expect(progressPercent(-5, 100)).toBe(0);
  });
  it("indeterminate：undefined/NaN → null", () => {
    expect(progressPercent(undefined, 100)).toBeNull();
    expect(progressPercent(NaN, 100)).toBeNull();
  });
  it("max<=0 → 0（不除零）", () => {
    expect(progressPercent(5, 0)).toBe(0);
  });
});

describe("dashOffset", () => {
  it("周长 + 百分比 → 偏移", () => {
    expect(dashOffset(100, 25)).toBe(75);
    expect(dashOffset(100, 0)).toBe(100);
    expect(dashOffset(100, 100)).toBe(0);
  });
});

describe("Progress 组件", () => {
  it("linear 确定态：role=progressbar + aria-value*", () => {
    const { container } = render(<Progress value={40} />);
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar).toBeTruthy();
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });
  it("linear 确定态：填充 inline width = pct%", () => {
    const { container } = render(<Progress value={40} />);
    const fill = container.querySelector('[role="progressbar"] > div > div') as HTMLElement;
    expect(fill.style.width).toBe("40%");
  });
  it("indeterminate：无 aria-valuenow", () => {
    const { container } = render(<Progress />);
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  });
  it("circular：渲两个 circle + 进度环带 stroke-dashoffset", () => {
    const { container } = render(
      <Progress variant="circular" value={25} size={40} thickness={4} />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
    expect(circles[1].getAttribute("stroke-dashoffset")).toBeTruthy();
  });
  it("tone=danger：linear 填充用 bg-danger", () => {
    const { container } = render(<Progress value={50} tone="danger" />);
    const fill = container.querySelector('[role="progressbar"] > div > div')!;
    expect(fill.className).toContain("bg-danger");
  });
  it("circular tone=danger：进度环用 danger stroke 变量", () => {
    const { container } = render(<Progress variant="circular" value={50} tone="danger" />);
    const progressCircle = container.querySelectorAll("circle")[1];
    expect(progressCircle.getAttribute("class")).toContain("var(--color-danger)");
  });
  it("showValue：渲染百分比文本", () => {
    const { getByText } = render(<Progress value={60} showValue />);
    expect(getByText("60%")).toBeTruthy();
  });
  it("max 透传到 aria-valuemax", () => {
    const { container } = render(<Progress value={3} max={5} />);
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute("aria-valuemax")).toBe("5");
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
  });
});
