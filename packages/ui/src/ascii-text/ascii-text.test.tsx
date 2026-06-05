import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ASCIIText } from "./ascii-text";

// jsdom 下 HTMLCanvasElement.getContext 默认返回 null，组件 effect 内已 guard 直接返回，
// 不会抛错；这里验证根容器/pre 结构、token 类、prop 透传、reduced-motion 类是否就位。
const preOf = (c: HTMLElement) => c.querySelector("pre") as HTMLPreElement;

describe("ASCIIText", () => {
  it("渲染根容器 + 隐藏 pre，且不抛错（jsdom getContext null 路径）", () => {
    const { container } = render(<ASCIIText />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("role")).toBe("img");
    const pre = preOf(container);
    expect(pre).not.toBeNull();
    expect(pre.getAttribute("aria-hidden")).not.toBeNull();
  });

  it("默认 text 写入 aria-label，便于无障碍朗读", () => {
    const { container } = render(<ASCIIText />);
    expect(container.firstElementChild?.getAttribute("aria-label")).toBe("瑚琏");
  });

  it("text prop 透传到 aria-label", () => {
    const { container } = render(<ASCIIText text="HULIAN" />);
    expect(container.firstElementChild?.getAttribute("aria-label")).toBe("HULIAN");
  });

  it("根容器带 token 类（bg-surface / text-foreground）", () => {
    const { container } = render(<ASCIIText />);
    const cls = container.firstElementChild?.className ?? "";
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("text-foreground");
  });

  it("pre 带 reduced-motion 兜底类（motion-reduce:[filter:none]）+ 字号样式", () => {
    const { container } = render(<ASCIIText asciiFontSize={10} />);
    const pre = preOf(container);
    expect(pre.className).toContain("motion-reduce:[filter:none]");
    expect(pre.style.fontSize).toBe("10px");
  });

  it("className 透传到根容器", () => {
    const { container } = render(<ASCIIText className="test-ascii-class" />);
    expect(container.firstElementChild?.className).toContain("test-ascii-class");
  });
});
