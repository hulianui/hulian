import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DEVICE_METRICS, bodyHeightPx } from "../lib/device-metrics";
import { Android } from "./android";

describe("Android", () => {
  it("渲染机身（圆角边框 foreground）+ 打孔摄像头", () => {
    const { container } = render(<Android />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("rounded-[2rem]");
    expect(root.getAttribute("class")).toContain("border-foreground");
    // 摄像头 punch-hole（屏幕内 size-2.5 圆点）
    expect(root.querySelector(".size-2\\.5")).not.toBeNull();
  });
  // 机身高度由内屏比例 + 边框反推（真源 lib/device-metrics），不再写死 aspectRatio ——
  // 写死会让内屏比例随宽度漂移，PreviewSandbox 的 fit 缩放就在短边留白（#117 / #139）。
  it("width 落 style；机身高度由内屏比例 + 边框推导", () => {
    const { container } = render(<Android width={300} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("300px");
    expect(root.style.aspectRatio).toBe("");
    expect(Number.parseFloat(root.style.height)).toBeCloseTo(
      bodyHeightPx(DEVICE_METRICS.android, 300),
      6,
    );
  });
  it("model 预设决定宽度；width 显式传入时优先", () => {
    const preset = render(<Android model="galaxy-s24" />);
    expect((preset.container.firstElementChild as HTMLElement).style.width).toBe("285px");
    const override = render(<Android model="galaxy-s24" width={400} />);
    expect((override.container.firstElementChild as HTMLElement).style.width).toBe("400px");
  });
  it("imageSrc 优先渲染 img；否则 children", () => {
    const withImg = render(<Android imageSrc="/a.png" />);
    expect(withImg.container.querySelector("img")?.getAttribute("src")).toBe("/a.png");
    const withChild = render(<Android>安卓屏</Android>);
    expect(withChild.container.textContent).toContain("安卓屏");
  });
  it("className/props 透传", () => {
    const { container } = render(<Android className="mx-auto" data-testid="ad" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("mx-auto");
    expect(root.getAttribute("data-testid")).toBe("ad");
  });
});
