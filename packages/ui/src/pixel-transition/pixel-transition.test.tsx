import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { PixelTransition } from "./pixel-transition";

describe("PixelTransition", () => {
  it("渲染两层内容 + 容器 token 类", () => {
    const { container, getByText } = render(
      <PixelTransition firstContent={<span>正面</span>} secondContent={<span>背面</span>} />,
    );
    expect(getByText("正面")).toBeTruthy();
    expect(getByText("背面")).toBeTruthy();
    const root = container.firstElementChild!;
    const cls = root.getAttribute("class")!;
    expect(cls).toContain("border-border");
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("text-foreground");
  });

  it("gridSize 决定像素块数量（gridSize²）", () => {
    const { container } = render(
      <PixelTransition firstContent={<i />} secondContent={<i />} gridSize={5} />,
    );
    // 像素幕布是第三层（z-[3]），其内子节点数 = 25
    const grid = container.querySelectorAll(".z-\\[3\\]")[0];
    expect(grid.children.length).toBe(25);
  });

  it("悬停切换 active 态（data-active）+ aria-hidden 翻转", () => {
    const { container } = render(
      <PixelTransition firstContent={<span>A</span>} secondContent={<span>B</span>} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("data-active")).toBeNull();
    fireEvent.mouseEnter(root);
    expect(root.getAttribute("data-active")).toBe("");
    fireEvent.mouseLeave(root);
    expect(root.getAttribute("data-active")).toBeNull();
  });

  it("once=true：进入后离开不回退", () => {
    const { container } = render(
      <PixelTransition firstContent={<i />} secondContent={<i />} once />,
    );
    const root = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(root);
    expect(root.getAttribute("data-active")).toBe("");
    fireEvent.mouseLeave(root);
    expect(root.getAttribute("data-active")).toBe("");
  });

  it("className / style / props 透传到根元素", () => {
    const { container } = render(
      <PixelTransition
        firstContent={<i />}
        secondContent={<i />}
        className="custom-x"
        style={{ aspectRatio: "1 / 1" }}
        pixelColor="var(--color-primary)"
        data-testid="pt"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("custom-x");
    expect(root.getAttribute("data-testid")).toBe("pt");
    expect(root.style.aspectRatio).toBe("1 / 1");
    // 像素块吃到自定义色（token 变量）
    const px = container.querySelector(".z-\\[3\\] > *") as HTMLElement | null;
    expect(px?.getAttribute("style") ?? "").toContain("var(--color-primary)");
  });
});
