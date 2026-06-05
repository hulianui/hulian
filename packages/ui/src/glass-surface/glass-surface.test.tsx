import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GlassSurface } from "./glass-surface";

// 根 = data-glass-mode 容器；内含一个 [aria-hidden] 的 SVG 滤镜层 + 内容层。
const rootOf = (c: HTMLElement) =>
  c.querySelector("[data-glass-mode]") as HTMLElement;
const svgOf = (c: HTMLElement) =>
  c.querySelector("svg[aria-hidden]") as SVGSVGElement;

describe("GlassSurface", () => {
  it("渲染根容器 + 隐藏 SVG 滤镜层 + 内容，不抛错（jsdom 无真实 backdrop-filter）", () => {
    const { container, getByText } = render(
      <GlassSurface>玻璃</GlassSurface>,
    );
    const root = rootOf(container);
    expect(root).not.toBeNull();
    // jsdom 下 supportsSvgBackdropFilter 返回 false → fallback 模式
    expect(root.getAttribute("data-glass-mode")).toBe("fallback");
    expect(svgOf(container)).not.toBeNull();
    expect(getByText("玻璃")).not.toBeNull();
  });

  it("默认 fallback 模式带磨砂玻璃 + token 类（border-border / shadow-lg / focus ring）", () => {
    const { container } = render(<GlassSurface />);
    const root = rootOf(container);
    expect(root.className).toContain("border-border");
    expect(root.className).toContain("shadow-lg");
    expect(root.className).toContain("focus-visible:ring-ring");
    // fallback 走 bg-surface 磨砂
    expect(root.className).toContain("bg-surface/25");
  });

  it("reduced-motion 路径：opacity 过渡可被 motion-reduce 关闭，DOM 不变", () => {
    const { container } = render(<GlassSurface />);
    expect(rootOf(container).className).toContain("motion-reduce:transition-none");
  });

  it("width/height（number）转 px、borderRadius 写入内联样式，CSS 变量随 props 注入", () => {
    const { container } = render(
      <GlassSurface
        width={320}
        height={120}
        borderRadius={28}
        backgroundOpacity={0.4}
        saturation={1.5}
      />,
    );
    const root = rootOf(container);
    expect(root.style.width).toBe("320px");
    expect(root.style.height).toBe("120px");
    expect(root.style.borderRadius).toBe("28px");
    expect(root.style.getPropertyValue("--hulian-glass-frost")).toBe("0.4");
    expect(root.style.getPropertyValue("--hulian-glass-saturation")).toBe("1.5");
    expect(
      root.style.getPropertyValue("--hulian-glass-filter"),
    ).toContain("url(#hulian-glass-filter-");
  });

  it("width 为 string 时原样透传（如 100%）", () => {
    const { container } = render(<GlassSurface width="100%" height="50%" />);
    const root = rootOf(container);
    expect(root.style.width).toBe("100%");
    expect(root.style.height).toBe("50%");
  });

  it("className 透传到根容器；SVG 滤镜定义包含三条 feDisplacementMap（RGB 色散）", () => {
    const { container } = render(
      <GlassSurface className="test-glass-class" />,
    );
    expect(rootOf(container).className).toContain("test-glass-class");
    expect(container.querySelectorAll("feDisplacementMap").length).toBe(3);
  });
});
