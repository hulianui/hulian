import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MetallicPaint } from "./metallic-paint";

// jsdom 无真实 WebGL/canvas：useGlCanvas 初次 reduced=false → 渲染 ref 容器 div；
// 内部 import("ogl") / setup 在 effect 内静默失败（不抛错），故仅断言 DOM 结构 + token 类 + 透传。
const rootOf = (c: HTMLElement) => c.firstElementChild as HTMLElement;

describe("MetallicPaint", () => {
  it("渲染单个 aria-hidden 装饰根容器，不抛错", () => {
    const { container } = render(<MetallicPaint />);
    const root = rootOf(container);
    expect(root).not.toBeNull();
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("默认根容器带 absolute inset-0 z-0 铺满 + pointer-events-none 不挡交互", () => {
    const { container } = render(<MetallicPaint />);
    const cls = rootOf(container).className;
    expect(cls).toContain("absolute");
    expect(cls).toContain("inset-0");
    expect(cls).toContain("z-0");
    expect(cls).toContain("pointer-events-none");
  });

  it("className 透传到根容器", () => {
    const { container } = render(<MetallicPaint className="test-metallic-class" />);
    expect(rootOf(container).className).toContain("test-metallic-class");
  });

  it("各 prop 接受且不抛错（speed/scale/refraction/liquid/blur/angle/颜色）", () => {
    const { container } = render(
      <MetallicPaint
        speed={1.5}
        scale={1.4}
        refraction={1.2}
        liquid={0.9}
        blur={0.4}
        angle={30}
        lightColor="oklch(0.9 0.05 250)"
        darkColor="oklch(0.2 0.02 250)"
      />,
    );
    expect(rootOf(container)).not.toBeNull();
  });

  it("不在根容器内联写死品牌 hex 颜色（颜色走 token / WebGL uniform）", () => {
    const { container } = render(<MetallicPaint />);
    const style = rootOf(container).getAttribute("style") ?? "";
    expect(style).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
