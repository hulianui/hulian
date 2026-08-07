import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DEVICE_METRICS, bodyHeightPx } from "../lib/device-metrics";
import { IPhone } from "./iphone";

describe("IPhone", () => {
  it("渲染机身（圆角粗边 foreground）+ 灵动岛", () => {
    const { container } = render(<IPhone />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("rounded-[3rem]");
    expect(root.getAttribute("class")).toContain("border-foreground");
    // 灵动岛
    expect(root.querySelector(".rounded-full")).not.toBeNull();
  });
  // 机身高度由内屏比例 + 边框反推（真源 lib/device-metrics），不再写死 aspectRatio ——
  // 写死会让内屏比例随宽度漂移，PreviewSandbox 的 fit 缩放就在短边留白（#117 / #139）。
  it("width 落 style；机身高度由内屏比例 + 边框推导", () => {
    const { container } = render(<IPhone width={320} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("320px");
    expect(root.style.aspectRatio).toBe("");
    expect(Number.parseFloat(root.style.height)).toBeCloseTo(
      bodyHeightPx(DEVICE_METRICS.iphone, 320),
      6,
    );
  });
  it("model 预设决定宽度；width 显式传入时优先", () => {
    const preset = render(<IPhone model="13-mini" />);
    expect((preset.container.firstElementChild as HTMLElement).style.width).toBe("270px");
    const override = render(<IPhone model="13-mini" width={400} />);
    expect((override.container.firstElementChild as HTMLElement).style.width).toBe("400px");
  });
  it("imageSrc 优先渲染 img；否则 children", () => {
    const withImg = render(<IPhone imageSrc="/s.png" />);
    expect(withImg.container.querySelector("img")?.getAttribute("src")).toBe("/s.png");
    const withChild = render(<IPhone>屏幕</IPhone>);
    expect(withChild.container.textContent).toContain("屏幕");
  });
  it("className/props 透传", () => {
    const { container } = render(<IPhone className="mx-auto" data-testid="ip" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("mx-auto");
    expect(root.getAttribute("data-testid")).toBe("ip");
  });
});
