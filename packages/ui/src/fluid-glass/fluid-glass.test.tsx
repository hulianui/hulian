import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { FluidGlass } from "./fluid-glass";

// jsdom 无 WebGL：useGlCanvas 会建一个 <canvas> 容器，但 ogl 是异步懒 import，
// 且 getContext 返回 null 时 setup 抛错被 helper 静默吞掉——组件不应崩，DOM 仍稳定。
// 这些断言只校验 React 层 DOM 结构 / token 类 / prop 透传，不触碰真实 GL。

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  // reduced-motion 用例用 vi.stubGlobal 替换了 window.matchMedia；restoreAllMocks
  // 不会撤销 stubGlobal，残留的桩会让后续用例里 matchMedia(...) 返回 undefined → 崩。
  vi.unstubAllGlobals();
});

describe("FluidGlass", () => {
  it("默认渲染根容器（relative overflow-hidden）+ aria-hidden 画布层，不抛错", () => {
    const { container } = render(<FluidGlass />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("relative");
    expect(root.className).toContain("overflow-hidden");
    const layer = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(layer).not.toBeNull();
    expect(layer.className).toContain("absolute");
    expect(layer.className).toContain("inset-0");
    // 装饰层不拦截交互
    expect(layer.className).toContain("pointer-events-none");
  });

  it("children 渲染在 relative z-10 内容层（层叠于画布之上）", () => {
    const { getByText } = render(
      <FluidGlass>
        <span>玻璃内容</span>
      </FluidGlass>,
    );
    const wrapper = getByText("玻璃内容").closest("div");
    expect(wrapper?.className).toContain("relative");
    expect(wrapper?.className).toContain("z-10");
  });

  it("className / style 透传到根容器", () => {
    const { container } = render(
      <FluidGlass className="test-fg-class" style={{ height: 321 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-fg-class");
    expect(root.style.height).toBe("321px");
  });

  it("reduced-motion 下降级为静态渐变 fallback：含 chart token 渐变 + DOM 结构一致", () => {
    // 模拟 prefers-reduced-motion: reduce
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    const { container, getByText } = render(
      <FluidGlass>
        <span>静态内容</span>
      </FluidGlass>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("relative");
    // fallback 层用 chart token 径向渐变
    const layer = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(layer.className).toContain("var(--color-chart-1)");
    expect(layer.className).toContain("bg-surface");
    // children 仍在 z-10 内容层（reduced 态 DOM 不丢内容）
    const wrapper = getByText("静态内容").closest("div");
    expect(wrapper?.className).toContain("z-10");
  });

  it("无 children 时不渲染内容层（只有根 + 画布/降级层）", () => {
    const { container } = render(<FluidGlass />);
    const root = container.firstElementChild as HTMLElement;
    // 根下只有一个 aria-hidden 画布层，无额外 z-10 内容层
    expect(root.querySelector(".z-10")).toBeNull();
  });
});
