import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ElectricBorder } from "./electric-border";

// 结构：根(relative isolate) > svg(电弧描边) + 两层光晕 div + 可选内容层。
const svgOf = (c: HTMLElement) => c.querySelector("svg") as SVGSVGElement;
const rectOf = (c: HTMLElement) => c.querySelector("svg rect") as SVGRectElement;
const animateOf = (c: HTMLElement) =>
  c.querySelector("svg animate") as SVGElement;

describe("ElectricBorder", () => {
  it("无 children 时渲染根容器 + svg 电弧层，不抛错（jsdom 无 canvas/WebGL）", () => {
    const { container } = render(<ElectricBorder />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("relative");
    expect(root.className).toContain("isolate");
    expect(svgOf(container)).not.toBeNull();
    expect(rectOf(container)).not.toBeNull();
  });

  it("默认 color 用 primary token 喂给描边 stroke", () => {
    const { container } = render(<ElectricBorder />);
    expect(rectOf(container).getAttribute("stroke")).toBe("var(--color-primary)");
  });

  it("color prop 透传到描边 stroke", () => {
    const { container } = render(<ElectricBorder color="oklch(0.7 0.2 30)" />);
    expect(rectOf(container).getAttribute("stroke")).toBe("oklch(0.7 0.2 30)");
  });

  it("reduced-motion：animate 标签带 media no-preference 守卫，DOM 不因降级而改变", () => {
    const { container } = render(<ElectricBorder />);
    const animate = animateOf(container);
    expect(animate).not.toBeNull();
    expect(animate.getAttribute("media")).toBe(
      "(prefers-reduced-motion: no-preference)",
    );
    // 降级与否结构一致：rect 始终存在
    expect(rectOf(container)).not.toBeNull();
  });

  it("chaos prop 放大位移强度：feDisplacementMap scale 随 chaos 增大", () => {
    const { container: c1 } = render(<ElectricBorder chaos={1} />);
    const { container: c2 } = render(<ElectricBorder chaos={2} />);
    const dispScale = (c: HTMLElement) =>
      Number(
        c.querySelector("[xChannelSelector]")?.getAttribute("scale") ??
          c.querySelector("[xchannelselector]")?.getAttribute("scale"),
      );
    const s1 = dispScale(c1);
    const s2 = dispScale(c2);
    expect(s2).toBeGreaterThan(s1);
  });

  it("className 透传到根容器，children 渲染在 z-10 内容层", () => {
    const { container, getByText } = render(
      <ElectricBorder className="test-eb-class">
        <span>通电了</span>
      </ElectricBorder>,
    );
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-eb-class",
    );
    const wrapper = getByText("通电了").closest("div");
    expect(wrapper?.className).toContain("z-10");
  });
});
