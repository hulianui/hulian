import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Crosshair } from "./crosshair";

// mock motion/react 的 useReducedMotion，覆盖 reduced-motion 分支（默认 false）。
const reduce = { value: false };
vi.mock("motion/react", () => ({
  useReducedMotion: () => reduce.value,
}));

// 结构：根(aria-hidden·absolute inset-0) > 横线(w-full) + 竖线(h-full)。
const rootOf = (c: HTMLElement) => c.querySelector("[aria-hidden]") as HTMLElement;
const linesOf = (c: HTMLElement) =>
  Array.from(rootOf(c).children) as HTMLElement[];

describe("Crosshair", () => {
  it("渲染根容器 + 两条十字线，不抛错（jsdom 无真实 RAF/布局）", () => {
    reduce.value = false;
    const { container } = render(<Crosshair />);
    const root = rootOf(container);
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("pointer-events-none");
    expect(linesOf(container).length).toBe(2);
  });

  it("两条线都带 will-change-transform（性能：只动 transform）", () => {
    reduce.value = false;
    const { container } = render(<Crosshair />);
    for (const line of linesOf(container)) {
      expect(line.className).toContain("will-change-transform");
    }
  });

  it("默认 color 走 token var(--color-primary)，写入线条 background", () => {
    reduce.value = false;
    const { container } = render(<Crosshair />);
    const [lineY, lineX] = linesOf(container);
    expect(lineY.style.background).toContain("var(--color-primary)");
    expect(lineX.style.background).toContain("var(--color-primary)");
  });

  it("color / thickness prop 生效", () => {
    reduce.value = false;
    const { container } = render(
      <Crosshair color="var(--color-chart-1)" thickness={3} />,
    );
    const [lineY, lineX] = linesOf(container);
    expect(lineY.style.background).toContain("var(--color-chart-1)");
    expect(lineY.style.height).toBe("3px"); // 横线高度 = 粗细
    expect(lineX.style.width).toBe("3px"); // 竖线宽度 = 粗细
  });

  it("reduced-motion 下不挂脉冲动画类，DOM 结构不变（仍 2 条线）", () => {
    reduce.value = true;
    const { container } = render(<Crosshair />);
    expect(linesOf(container).length).toBe(2);
    for (const line of linesOf(container)) {
      expect(line.className).not.toContain("[animation:hulian-crosshair");
    }
  });

  it("className 透传到根容器", () => {
    reduce.value = false;
    const { container } = render(<Crosshair className="test-crosshair" />);
    expect(rootOf(container).className).toContain("test-crosshair");
  });
});
