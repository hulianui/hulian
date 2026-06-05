import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Aurora } from "./aurora";

// 结构：根容器 > mask 外层([aria-hidden]·静态遮罩) > 流动层(动画+背景+blur·GPU transform)。
const maskOf = (c: HTMLElement) => c.querySelector("[aria-hidden]") as HTMLElement;
const flowOf = (c: HTMLElement) => c.querySelector("[aria-hidden] > div") as HTMLElement;

describe("Aurora", () => {
  it("无 children 时渲染 根 + mask 外层 + 流动层 三个 div，不抛错", () => {
    const { container } = render(<Aurora />);
    expect(container.firstElementChild).not.toBeNull();
    expect(maskOf(container)).not.toBeNull();
    expect(flowOf(container)).not.toBeNull();
    expect(container.querySelectorAll("div").length).toBe(3); // 根 + mask 外层 + 流动层
  });

  it("children 渲染在极光层上方的 relative z-10 容器中", () => {
    const { getByText } = render(<Aurora><span>Hello Aurora</span></Aurora>);
    const wrapper = getByText("Hello Aurora").closest("div");
    expect(wrapper?.className).toContain("relative");
    expect(wrapper?.className).toContain("z-10");
  });

  it("流动层包含 hulian-aurora-bg 动画类 + motion-reduce 禁用类 + will-change-transform", () => {
    const { container } = render(<Aurora />);
    const flow = flowOf(container);
    expect(flow.className).toContain("[animation:hulian-aurora-bg");
    expect(flow.className).toContain("motion-reduce:[animation:none]");
    // 性能关键：只动 transform，提升为合成层
    expect(flow.className).toContain("will-change-transform");
  });

  it("colors prop 生效：自定义色出现在流动层 backgroundImage 内联样式", () => {
    const customColors = ["oklch(0.7 0.2 30)", "oklch(0.6 0.18 200)", "oklch(0.65 0.22 300)"];
    const { container } = render(<Aurora colors={customColors} />);
    const flow = flowOf(container);
    expect(flow.style.backgroundImage).toContain("oklch(0.7 0.2 30)");
    expect(flow.style.backgroundImage).toContain("oklch(0.6 0.18 200)");
  });

  it("blur prop 生效：流动层 filter 包含对应 px 值", () => {
    const { container } = render(<Aurora blur={55} />);
    expect(flowOf(container).style.filter).toBe("blur(55px)");
  });

  it("speed prop 生效：CSS 变量 --hulian-aurora-bg-duration 写入流动层", () => {
    const { container } = render(<Aurora speed={42} />);
    expect(flowOf(container).style.getPropertyValue("--hulian-aurora-bg-duration")).toBe("42s");
  });

  it("不再用 background-position 动画（性能）：流动层 className 不含 background-size", () => {
    const { container } = render(<Aurora />);
    expect(flowOf(container).className).not.toContain("background-size");
  });

  it("showRadialMask=true 时 mask 外层注入 maskImage；=false 时不注入", () => {
    const { container: c1 } = render(<Aurora showRadialMask={true} />);
    const mask1 = maskOf(c1);
    const hasMask =
      mask1.style.getPropertyValue("mask-image") !== "" ||
      mask1.style.webkitMaskImage !== "" ||
      (mask1.getAttribute("style") ?? "").includes("mask-image");
    expect(hasMask).toBe(true);

    const { container: c2 } = render(<Aurora showRadialMask={false} />);
    const mask2 = maskOf(c2);
    expect((mask2.getAttribute("style") ?? "").includes("radial-gradient")).toBe(false);
  });

  it("className 透传到根容器", () => {
    const { container } = render(<Aurora className="test-aurora-class" />);
    expect(container.firstElementChild?.className).toContain("test-aurora-class");
  });

  it("默认 colors 包含 3 个 chart token", () => {
    const { container } = render(<Aurora />);
    const bg = flowOf(container).style.backgroundImage;
    expect(bg).toContain("var(--color-chart-1)");
    expect(bg).toContain("var(--color-chart-2)");
    expect(bg).toContain("var(--color-chart-4)");
  });

  it("mask 外层带 pointer-events-none 避免遮挡交互", () => {
    const { container } = render(<Aurora />);
    expect(maskOf(container).className).toContain("pointer-events-none");
  });
});
