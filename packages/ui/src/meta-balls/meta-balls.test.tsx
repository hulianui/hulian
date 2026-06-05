import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MetaBalls } from "./meta-balls";

// jsdom 无 WebGL：ogl 走 dynamic import 在 setup 内执行，Renderer 构造 getContext 返回
// null → useGlCanvas 内 try/catch 静默降级，组件本身只渲染一个 root div，不抛错。
// 需 stub：matchMedia（reduced-motion 检测）、Resize/IntersectionObserver、RAF、devicePixelRatio。

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

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: makeMatchMedia(false),
  });
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
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
  if (Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio")?.configurable) {
    Object.defineProperty(globalThis, "devicePixelRatio", {
      value: 1,
      configurable: true,
      writable: true,
    });
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ── 正常渲染路径（reduced-motion=false → canvas 容器 div）──
describe("MetaBalls 正常渲染路径", () => {
  it("渲染 root div，不抛错（jsdom 无 WebGL 静默降级）", () => {
    expect(() => render(<MetaBalls />)).not.toThrow();
    const { container } = render(<MetaBalls />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带 block h-full w-full + aria-hidden（装饰语义）", () => {
    const { container } = render(<MetaBalls />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("block");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到 root div", () => {
    const { container } = render(<MetaBalls className="rounded-xl ring-2" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("rounded-xl");
    expect(root.className).toContain("ring-2");
  });

  it("显式传入全部 prop 不抛", () => {
    expect(() =>
      render(
        <MetaBalls
          color="var(--color-chart-2)"
          cursorBallColor="var(--color-chart-5)"
          speed={0.6}
          enableMouseInteraction={false}
          hoverSmoothness={0.2}
          animationSize={40}
          ballCount={20}
          clumpFactor={1.4}
          cursorBallSize={4}
          enableTransparency={false}
        />,
      ),
    ).not.toThrow();
  });

  it("ballCount 极值（1 / 50 / 60 夹取）不抛", () => {
    expect(() => render(<MetaBalls ballCount={1} />)).not.toThrow();
    expect(() => render(<MetaBalls ballCount={50} />)).not.toThrow();
    expect(() => render(<MetaBalls ballCount={60} />)).not.toThrow();
  });

  it("卸载不抛（dispose + context release 兜底）", () => {
    const { unmount } = render(<MetaBalls />);
    expect(() => unmount()).not.toThrow();
  });
});

// ── reduced-motion 路径（matchMedia.matches=true → 静态渐变 fallback）──
describe("MetaBalls reduced-motion fallback", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced-motion=true 时渲染不抛（DOM 不消失）", () => {
    expect(() => render(<MetaBalls />)).not.toThrow();
    const { container } = render(<MetaBalls />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("fallback slot 自定义内容不导致崩溃", () => {
    expect(() =>
      render(<MetaBalls fallback={<span data-testid="mb-fallback">loading</span>} />),
    ).not.toThrow();
  });

  it("className 透传不抛", () => {
    expect(() => render(<MetaBalls className="size-40" />)).not.toThrow();
  });
});

// ── prop 变更 re-render ──
describe("MetaBalls prop 变更 re-render", () => {
  it("color / ballCount 变化 re-render 不抛", () => {
    const { rerender } = render(<MetaBalls color="var(--color-chart-1)" ballCount={10} />);
    expect(() => rerender(<MetaBalls color="var(--color-chart-3)" ballCount={25} />)).not.toThrow();
  });

  it("enableMouseInteraction 切换不抛", () => {
    const { rerender } = render(<MetaBalls enableMouseInteraction />);
    expect(() => rerender(<MetaBalls enableMouseInteraction={false} />)).not.toThrow();
  });
});
