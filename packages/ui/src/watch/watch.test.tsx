import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DEVICE_METRICS, bodyHeightPx } from "../lib/device-metrics";
import { Watch } from "./watch";

describe("Watch", () => {
  it("渲染 squircle 表壳（大圆角 foreground 边框）+ 表冠", () => {
    const { container } = render(<Watch />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("rounded-[28%]");
    expect(root.getAttribute("class")).toContain("border-foreground");
    // 表冠 / 侧边按钮（凸出的 rounded-full）
    expect(root.querySelectorAll(".rounded-full").length).toBeGreaterThanOrEqual(2);
  });
  // 机身高度由内屏比例 + 边框反推（真源 lib/device-metrics），不再写死 aspectRatio ——
  // 写死会让内屏比例随宽度漂移，PreviewSandbox 的 fit 缩放就在短边留白（#117 / #139）。
  it("width 落 style；机身高度由内屏比例 + 边框推导", () => {
    const { container } = render(<Watch width={200} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("200px");
    expect(root.style.aspectRatio).toBe("");
    expect(Number.parseFloat(root.style.height)).toBeCloseTo(
      bodyHeightPx(DEVICE_METRICS.watch, 200),
      6,
    );
  });
  it("model 预设决定宽度；width 显式传入时优先", () => {
    const preset = render(<Watch model="ultra-49" />);
    expect((preset.container.firstElementChild as HTMLElement).style.width).toBe("210px");
    const override = render(<Watch model="ultra-49" width={300} />);
    expect((override.container.firstElementChild as HTMLElement).style.width).toBe("300px");
  });
  it("imageSrc 优先渲染 img；否则 children", () => {
    const withImg = render(<Watch imageSrc="/w.png" />);
    expect(withImg.container.querySelector("img")?.getAttribute("src")).toBe("/w.png");
    const withChild = render(<Watch>表盘</Watch>);
    expect(withChild.container.textContent).toContain("表盘");
  });
  it("className/props 透传", () => {
    const { container } = render(<Watch className="mx-auto" data-testid="wt" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("mx-auto");
    expect(root.getAttribute("data-testid")).toBe("wt");
  });
});
