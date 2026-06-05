import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ShapeGrid } from "./shape-grid";

// jsdom 默认 HTMLCanvasElement.getContext 返回 null（无 canvas 实现），
// 组件内 getContext("2d") === null 时静默降级——下面用例都基于此：根 canvas 始终渲染、不抛错。

describe("ShapeGrid", () => {
  it("渲染根 canvas（aria-hidden 装饰层），getContext 为 null 时不抛错", () => {
    const { container } = render(<ShapeGrid />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });

  it("根 canvas 带铺满 token 类（block h-full w-full）", () => {
    const { container } = render(<ShapeGrid />);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.className).toContain("block");
    expect(canvas.className).toContain("h-full");
    expect(canvas.className).toContain("w-full");
  });

  it("className 透传到根 canvas", () => {
    const { container } = render(<ShapeGrid className="test-shape-grid" />);
    expect(container.querySelector("canvas")?.className).toContain("test-shape-grid");
  });

  it("style 透传到根 canvas", () => {
    const { container } = render(<ShapeGrid style={{ opacity: 0.5 }} />);
    expect(container.querySelector("canvas")?.style.opacity).toBe("0.5");
  });

  it("各 shape 取值均可渲染不抛错（square / circle / triangle / hexagon）", () => {
    for (const shape of ["square", "circle", "triangle", "hexagon"] as const) {
      const { container } = render(<ShapeGrid shape={shape} direction="diagonal" />);
      expect(container.querySelector("canvas")).not.toBeNull();
    }
  });

  it("reduced-motion / 无 context 下仍渲染同一 canvas（DOM 不随 reduced 改变）", () => {
    // 即便 getContext 可用，reduced-motion 路径也只是 speed=0，DOM 仍是单一 canvas。
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(null as never);
    const { container } = render(<ShapeGrid speed={3} hoverTrailAmount={5} />);
    expect(container.querySelectorAll("canvas").length).toBe(1);
    spy.mockRestore();
  });
});
