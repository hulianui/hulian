import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LiquidEther } from "./liquid-ether";

// jsdom 无 WebGL：ogl 走 dynamic import 在 useGlCanvas 的 async setup 内执行，
// Renderer 构造 getContext 返回 null → try/catch 静默降级，组件只渲染 root div，不抛错。
// 与 meta-balls.test 同款 stub：matchMedia / Resize·IntersectionObserver / RAF / devicePixelRatio。

function makeMatchMedia(reducedMotion: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion ? query.includes("prefers-reduced-motion") : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function installEnv(reducedMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: makeMatchMedia(reducedMotion),
  });
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
    } as unknown as typeof IntersectionObserver;
  }
  globalThis.requestAnimationFrame = vi.fn().mockReturnValue(1);
  globalThis.cancelAnimationFrame = vi.fn();
}

beforeEach(() => installEnv(false));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const rootOf = (c: HTMLElement) => c.firstElementChild as HTMLElement;

describe("LiquidEther 正常渲染路径", () => {
  it("渲染 root div，不抛错（jsdom 无 WebGL 静默降级）", () => {
    expect(() => render(<LiquidEther />)).not.toThrow();
    const { container } = render(<LiquidEther />);
    const root = rootOf(container);
    expect(root).not.toBeNull();
    expect(root.tagName).toBe("DIV");
    // 背景层基础 token 类：绝对铺满 + 置底
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
  });

  it("root div 带 aria-hidden（装饰层不进无障碍树）", () => {
    const { container } = render(<LiquidEther />);
    expect(rootOf(container).getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到 root div", () => {
    const { container } = render(<LiquidEther className="test-liquid-class" />);
    expect(rootOf(container).className).toContain("test-liquid-class");
  });

  it("opacity / style prop 写入 root div 内联样式并合并", () => {
    const { container } = render(
      <LiquidEther opacity={0.7} style={{ borderRadius: "8px" }} />,
    );
    const root = rootOf(container);
    expect(root.style.opacity).toBe("0.7");
    expect(root.style.borderRadius).toBe("8px");
  });

  it("显式传入全部 prop 不抛", () => {
    expect(() =>
      render(
        <LiquidEther
          colors={["var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-5)"]}
          speed={0.8}
          scale={1.4}
          mouseForce={1.5}
          autoDemo={false}
          opacity={0.6}
        />,
      ),
    ).not.toThrow();
  });
});

describe("LiquidEther reduced-motion 降级路径", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced-motion 时渲染静态 radial-gradient 液面，吃 chart token，不抛错", () => {
    const { container } = render(<LiquidEther />);
    const root = rootOf(container);
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("absolute");
    // 静态兜底背景用 chart token（明暗自适应）
    const bg = root.style.background;
    expect(bg).toContain("var(--color-chart-1)");
    expect(bg).toContain("radial-gradient");
  });
});
