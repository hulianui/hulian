import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PixelTrail } from "./pixel-trail";

// jsdom 无 WebGL：ogl 走 dynamic import 在 useGlCanvas 的 setup 内执行，Renderer 构造
// getContext 返回 null → try/catch 静默降级，组件本身只渲染 root + GL 容器 div，不抛错。
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
      constructor(
        _cb: IntersectionObserverCallback,
        _opts?: IntersectionObserverInit,
      ) {}
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

// ── 正常渲染路径（reduced-motion=false）──
describe("PixelTrail 正常渲染路径", () => {
  it("渲染 root + GL 容器，不抛错（jsdom 无 WebGL 静默降级）", () => {
    expect(() => render(<PixelTrail />)).not.toThrow();
    const { container } = render(<PixelTrail />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    // root 带定位 token 类
    expect(root.className).toContain("relative");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    // 内部 GL 容器 aria-hidden（装饰语义），inset-0 铺满
    const gl = root.querySelector("[aria-hidden]") as HTMLElement;
    expect(gl).not.toBeNull();
    expect(gl.className).toContain("inset-0");
  });

  it("className prop 透传到 root div", () => {
    const { container } = render(<PixelTrail className="rounded-xl ring-2" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("rounded-xl");
    expect(root.className).toContain("ring-2");
  });

  it("style prop 透传到 root div", () => {
    const { container } = render(<PixelTrail style={{ opacity: 0.5 }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe("0.5");
  });

  it("显式传入全部 prop 不抛", () => {
    expect(() =>
      render(
        <PixelTrail
          gridSize={60}
          trailSize={0.2}
          maxAge={500}
          color="var(--color-chart-3)"
          gooey
          gooeyStrength={12}
          className="rounded-md"
        />,
      ),
    ).not.toThrow();
  });

  it("gooey=true 时注入 SVG 滤镜（含 feGaussianBlur）+ GL 容器带 filter 样式", () => {
    const { container } = render(<PixelTrail gooey gooeyStrength={10} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(container.querySelector("feGaussianBlur")).not.toBeNull();
    // filter url 引用了 useId 生成的 id
    const filter = container.querySelector("filter") as SVGFilterElement;
    expect(filter?.id).toContain("hulian-pixeltrail-goo");
  });

  it("gooey=false（默认）时不渲染 SVG 滤镜", () => {
    const { container } = render(<PixelTrail />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("卸载不抛（dispose + context release 兜底）", () => {
    const { unmount } = render(<PixelTrail />);
    expect(() => unmount()).not.toThrow();
  });
});

// ── reduced-motion 路径（matchMedia.matches=true → 不建 GL，DOM 同构）──
describe("PixelTrail reduced-motion fallback", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced-motion=true 时渲染不抛，DOM 结构同构（root + GL 容器仍在）", () => {
    expect(() => render(<PixelTrail />)).not.toThrow();
    const { container } = render(<PixelTrail />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.querySelector("[aria-hidden]")).not.toBeNull();
  });

  it("reduced-motion 下 gooey 不注入滤镜（避免对空容器套滤镜）", () => {
    const { container } = render(<PixelTrail gooey />);
    expect(container.querySelector("svg")).toBeNull();
  });
});

// ── prop 变更 re-render ──
describe("PixelTrail prop 变更 re-render", () => {
  it("color / gridSize 变化 re-render 不抛", () => {
    const { rerender } = render(<PixelTrail color="var(--color-chart-1)" gridSize={30} />);
    expect(() =>
      rerender(<PixelTrail color="var(--color-chart-4)" gridSize={80} />),
    ).not.toThrow();
  });

  it("gooey 切换不抛", () => {
    const { rerender } = render(<PixelTrail gooey={false} />);
    expect(() => rerender(<PixelTrail gooey />)).not.toThrow();
  });
});
