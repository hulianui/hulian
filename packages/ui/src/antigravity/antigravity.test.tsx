import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Antigravity } from "./antigravity";

// jsdom 不实现 canvas2d：canvas.getContext("2d") 返回 null → 组件 effect 中静默移除
// canvas、留空容器，不抛错。需 stub matchMedia / ResizeObserver / IntersectionObserver /
// requestAnimationFrame / devicePixelRatio，使正常渲染路径与 reduced 路径都可断言。

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
      constructor(
        _cb: IntersectionObserverCallback,
        _opts?: IntersectionObserverInit,
      ) {}
    } as unknown as typeof IntersectionObserver;
  }
  globalThis.requestAnimationFrame = vi.fn().mockReturnValue(1);
  globalThis.cancelAnimationFrame = vi.fn();
  if (
    Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio")?.configurable
  ) {
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

describe("Antigravity 正常渲染路径（canvas2d）", () => {
  it("渲染根容器 div，不抛错（jsdom 无 canvas2d 也安全降级）", () => {
    expect(() => render(<Antigravity />)).not.toThrow();
    const { container } = render(<Antigravity />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.tagName).toBe("DIV");
  });

  it("root div 带 relative block h-full w-full + aria-hidden（装饰语义）", () => {
    const { container } = render(<Antigravity />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("block");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到 root div", () => {
    const { container } = render(<Antigravity className="rounded-xl ring-2" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("rounded-xl");
    expect(root.className).toContain("ring-2");
  });

  it("显式传入各 prop（含极值/形状）不抛", () => {
    expect(() =>
      render(
        <Antigravity
          count={120}
          magnetRadius={200}
          ringRadius={40}
          waveSpeed={0.8}
          waveAmplitude={20}
          particleSize={6}
          lerpSpeed={0.2}
          color="oklch(0.7 0.2 30)"
          autoAnimate
          rotationSpeed={0.5}
          pulseSpeed={5}
          shape="square"
        />,
      ),
    ).not.toThrow();
  });

  it("fallback 内容渲染在容器内", () => {
    const { getByTestId } = render(
      <Antigravity fallback={<span data-testid="ag-fb">x</span>} />,
    );
    expect(getByTestId("ag-fb")).not.toBeNull();
  });

  it("卸载不抛（清理 RAF / observers / canvas）", () => {
    const { unmount } = render(<Antigravity />);
    expect(() => unmount()).not.toThrow();
  });
});

describe("Antigravity reduced-motion fallback", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced-motion=true 时渲染不抛（DOM 内容不卸载）", () => {
    const { rerender } = render(<Antigravity fallback={<span>keep</span>} />);
    expect(() => rerender(<Antigravity fallback={<span>keep</span>} />)).not.toThrow();
  });
});
