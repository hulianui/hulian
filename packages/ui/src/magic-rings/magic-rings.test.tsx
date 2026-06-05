import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MagicRings } from "./magic-rings";

// jsdom 不实现 WebGL：ogl 动态 import 成功，但 Renderer 构造时 getContext 返回 null →
// useGlCanvas 的 setup 抛错被静默捕获，组件不崩。本测试只验 DOM 结构 / props 透传 /
// reduced-motion 分支 / 不抛错，不触真实 GL。
//
// 必须 stub：matchMedia（reduced-motion 探测）、ResizeObserver / IntersectionObserver、
// requestAnimationFrame / cancelAnimationFrame、devicePixelRatio。

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

  if (Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio")?.configurable !== false) {
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

// ────────────────────────────────────────────────────────────────
// 正常渲染路径（reduced-motion=false → 期望 root div 容器，canvas 由 ogl 注入但 jsdom 下静默）
// ────────────────────────────────────────────────────────────────
describe("MagicRings 正常渲染路径", () => {
  it("渲染根容器 div，不抛错", () => {
    expect(() => render(<MagicRings />)).not.toThrow();
    const { container } = render(<MagicRings />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带 block h-full w-full + aria-hidden（装饰语义）", () => {
    const { container } = render(<MagicRings />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("block");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到 root div", () => {
    const { container } = render(<MagicRings className="rounded-xl ring-2" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("rounded-xl");
    expect(root.className).toContain("ring-2");
  });

  it("blur>0 时根容器写入 filter:blur 内联样式", () => {
    const { container } = render(<MagicRings blur={12} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.filter).toBe("blur(12px)");
  });

  it("blur=0（默认）时不写 filter", () => {
    const { container } = render(<MagicRings />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.filter).toBe("");
  });

  it("显式传入完整 props 不抛（含 followMouse / clickBurst / 自定义色）", () => {
    expect(() =>
      render(
        <MagicRings
          color="oklch(0.7 0.2 30)"
          colorTwo="#42fcff"
          speed={2}
          ringCount={8}
          followMouse
          clickBurst
          rotation={45}
          blur={4}
        />,
      ),
    ).not.toThrow();
  });

  it("ringCount 极值（1 / 10 / 越界 0 / 99）不抛", () => {
    expect(() => render(<MagicRings ringCount={1} />)).not.toThrow();
    expect(() => render(<MagicRings ringCount={10} />)).not.toThrow();
    expect(() => render(<MagicRings ringCount={0} />)).not.toThrow();
    expect(() => render(<MagicRings ringCount={99} />)).not.toThrow();
  });

  it("卸载不抛（dispose + context release）", () => {
    const { unmount } = render(<MagicRings />);
    expect(() => unmount()).not.toThrow();
  });

  it("多实例并排渲染互不干扰", () => {
    const { container } = render(
      <>
        <MagicRings ringCount={3} />
        <MagicRings ringCount={6} />
      </>,
    );
    expect(Array.from(container.children).length).toBe(2);
  });

  it("prop 变更 re-render 不抛（速度 / 颜色 / 视差开关）", () => {
    const { rerender } = render(<MagicRings speed={1} followMouse={false} />);
    expect(() => rerender(<MagicRings speed={3} followMouse />)).not.toThrow();
    expect(() => rerender(<MagicRings color="#ff0000" />)).not.toThrow();
  });
});

// ────────────────────────────────────────────────────────────────
// reduced-motion 路径（matchMedia.matches=true → 静态同心环 fallback）
// ────────────────────────────────────────────────────────────────
describe("MagicRings reduced-motion fallback", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced-motion=true 渲染不抛，且 DOM 含 div（canvas 或 fallback 二选一）", () => {
    const { container, rerender } = render(<MagicRings />);
    rerender(<MagicRings />);
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
  });

  it("fallback 路径 className 透传不抛", () => {
    expect(() => render(<MagicRings className="size-40" blur={6} />)).not.toThrow();
  });

  it("卸载 fallback 路径不抛", () => {
    const { unmount } = render(<MagicRings />);
    expect(() => unmount()).not.toThrow();
  });
});
