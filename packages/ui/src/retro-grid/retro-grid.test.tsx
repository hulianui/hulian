import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RetroGrid } from "./retro-grid";

// 内层滚动网格层 = root>倾斜层>滚动层，是唯一带 [animation:...] 的 div（倾斜层只含变量名 hulian-retro-grid-angle）
const gridLayerOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("div")).find((d) =>
    d.getAttribute("class")?.includes("[animation:hulian-retro-grid"),
  );

describe("RetroGrid", () => {
  it("渲染根 div + 倾斜层 + 滚动网格层（三层）", () => {
    const { container } = render(<RetroGrid />);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    // 深层滚动网格层存在
    expect(gridLayerOf(container)).not.toBeUndefined();
  });
  it("滚动层带 hulian-retro-grid 动画类", () => {
    const { container } = render(<RetroGrid />);
    const grid = gridLayerOf(container)!;
    expect(grid.getAttribute("class")).toContain("[animation:hulian-retro-grid");
  });
  it("motion-reduce 停用类恒在（尊重 prefers-reduced-motion）", () => {
    const { container } = render(<RetroGrid />);
    const grid = gridLayerOf(container)!;
    expect(grid.getAttribute("class")).toContain("motion-reduce:[animation:none]");
  });
  it("angle/cellSize/opacity/duration 落 CSS 变量", () => {
    const { container } = render(<RetroGrid angle={70} cellSize={48} opacity={0.3} duration={20} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-retro-grid-angle")).toBe("70deg");
    expect(root.style.getPropertyValue("--hulian-retro-grid-cell-size")).toBe("48px");
    expect(root.style.getPropertyValue("--hulian-retro-grid-opacity")).toBe("0.3");
    expect(root.style.getPropertyValue("--hulian-retro-grid-duration")).toBe("20s");
  });
  it("背景层语义：absolute inset-0 + pointer-events-none + text-border + aria-hidden", () => {
    const { container } = render(<RetroGrid />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("absolute");
    expect(root.getAttribute("class")).toContain("inset-0");
    expect(root.getAttribute("class")).toContain("pointer-events-none");
    expect(root.getAttribute("class")).toContain("text-border");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });
  it("className 与 props 透传", () => {
    const { container } = render(<RetroGrid className="text-primary" data-testid="rg" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("text-primary");
    expect(root.getAttribute("data-testid")).toBe("rg");
  });
});
