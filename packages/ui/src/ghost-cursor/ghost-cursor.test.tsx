import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ghostCursorRenderSize, GhostCursor, shaderTrailSampleCount } from "./ghost-cursor";

// jsdom 不实现 WebGL：useGlCanvas 内 ogl 动态 import 成功，但 Renderer 构造 getContext
// 返回 null → setup 静默失败，组件不抛错（与 Orb 测试同策略）。
// 必须 stub：matchMedia / ResizeObserver / IntersectionObserver / RAF / devicePixelRatio。

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

describe("GhostCursor 正常渲染路径（WebGL canvas）", () => {
  it("caps fragment-shader trail samples while preserving the public trail history", () => {
    expect(shaderTrailSampleCount(1)).toBe(1);
    expect(shaderTrailSampleCount(32)).toBe(4);
    expect(shaderTrailSampleCount(64)).toBe(4);
    expect(ghostCursorRenderSize(560, 256)).toEqual({ width: 224, height: 102 });
  });

  it("渲染根容器 div，不抛错", () => {
    expect(() => render(<GhostCursor />)).not.toThrow();
    const { container } = render(<GhostCursor />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根容器带 pointer-events-none + absolute inset-0（装饰覆盖层）", () => {
    const { container } = render(<GhostCursor />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
  });

  it("根容器带 aria-hidden（纯装饰语义）", () => {
    const { container } = render(<GhostCursor />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("默认 mixBlendMode=screen 写入根容器内联样式", () => {
    const { container } = render(<GhostCursor />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.mixBlendMode).toBe("screen");
  });

  it("className / style prop 透传到根容器", () => {
    const { container } = render(
      <GhostCursor className="z-50 rounded-xl" style={{ zIndex: 99 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("z-50");
    expect(root.className).toContain("rounded-xl");
    expect(root.style.zIndex).toBe("99");
  });

  it("显式传入全部 props 不抛", () => {
    expect(() =>
      render(
        <GhostCursor
          trailLength={16}
          inertia={0.7}
          grainIntensity={0}
          brightness={1.5}
          color="oklch(0.7 0.2 30)"
          scale={1.4}
          mixBlendMode="multiply"
        />,
      ),
    ).not.toThrow();
  });

  it("trailLength 极值（1 / 64）不抛", () => {
    expect(() => render(<GhostCursor trailLength={1} />)).not.toThrow();
    expect(() => render(<GhostCursor trailLength={64} />)).not.toThrow();
  });

  it("卸载不抛（dispose + context release）", () => {
    const { unmount } = render(<GhostCursor />);
    expect(() => unmount()).not.toThrow();
  });

  it("color 变化触发 remount 不抛", () => {
    const { rerender } = render(<GhostCursor color="var(--color-chart-1)" />);
    expect(() => rerender(<GhostCursor color="var(--color-chart-3)" />)).not.toThrow();
  });
});

describe("GhostCursor reduced-motion fallback", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced-motion 路径不抛（fallback 静态光斑）", () => {
    expect(() => render(<GhostCursor />)).not.toThrow();
  });

  it("fallback 同样 absolute inset-0 + aria-hidden（内容不卸载，仅去动画）", () => {
    const { container } = render(<GhostCursor />);
    // 首帧 SSR-safe reduced=false → canvas 容器；effect 后切 fallback。两态均带覆盖层类。
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("fallback 路径 className 透传不抛", () => {
    expect(() => render(<GhostCursor className="opacity-50" />)).not.toThrow();
  });
});
