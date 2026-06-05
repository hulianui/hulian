import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SplashCursor } from "./splash-cursor";

// mock motion/react 的 useReducedMotion，覆盖 reduced-motion 分支（默认 false）。
const reduce = { value: false };
vi.mock("motion/react", () => ({
  useReducedMotion: () => reduce.value,
}));

// jsdom 下 canvas.getContext("2d") 返回 null → 命中 null-ctx 守卫早退，不抛错。
// 这些测试不依赖真实 canvas 渲染，只校验根 DOM 结构、token/行为类、prop 透传与 reduced 路径。
const rootOf = (c: HTMLElement) => c.firstElementChild as HTMLElement;

describe("SplashCursor", () => {
  it("渲染根容器（绝对定位装饰层）且不抛错（getContext 为 null 也安全）", () => {
    reduce.value = false;
    const { container } = render(<SplashCursor />);
    const root = rootOf(container);
    expect(root).not.toBeNull();
    expect(root.tagName).toBe("DIV");
  });

  it("根容器带关键行为类：absolute inset-0 + pointer-events-none + aria-hidden", () => {
    reduce.value = false;
    const { container } = render(<SplashCursor />);
    const root = rootOf(container);
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传并与基类合并", () => {
    reduce.value = false;
    const { container } = render(<SplashCursor className="test-splash-class" />);
    const root = rootOf(container);
    expect(root.className).toContain("test-splash-class");
    expect(root.className).toContain("pointer-events-none");
  });

  it("opacity / style prop 透传到根容器内联样式", () => {
    reduce.value = false;
    const { container } = render(
      <SplashCursor opacity={0.5} style={{ borderRadius: "8px" }} />,
    );
    const root = rootOf(container);
    expect(root.style.opacity).toBe("0.5");
    expect(root.style.borderRadius).toBe("8px");
  });

  it("reduced-motion 时不挂全局溅射监听，DOM 仍渲染同一根容器（结构不变）", () => {
    reduce.value = true;
    const addSpy = vi.spyOn(window, "addEventListener");
    const { container } = render(<SplashCursor />);
    const root = rootOf(container);
    expect(root).not.toBeNull();
    expect(root.className).toContain("pointer-events-none");
    // reduced 路径提前 return，不应注册 mousemove/touchmove 溅射监听
    const movementBound = addSpy.mock.calls.some(
      ([type]) => type === "mousemove" || type === "touchmove",
    );
    expect(movementBound).toBe(false);
    addSpy.mockRestore();
    reduce.value = false;
  });
});
