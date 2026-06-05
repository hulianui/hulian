import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Iridescence } from "./iridescence";

// ─── jsdom 全局 API stub ──────────────────────────────────────────────────
//
// jsdom 环境缺少 ResizeObserver / IntersectionObserver / matchMedia /
// requestAnimationFrame / canvas WebGL context。
// 用最小 stub 让测试不崩溃；WebGL setup 路径本身由 use-gl-canvas 懒加载后
// 在 async effect 内运行，jsdom 下 ogl 会因为无 WebGL context 静默降级，
// 不会向上抛出（见 use-gl-canvas.ts 中的 try/catch）。
//
// 核心测试目标：
//   ① matchMedia.matches=false → 渲染 <canvas>（WebGL 路径，UI 可测）
//   ② matchMedia.matches=true  → 渲染 fallback <div>（reduced-motion 路径）

beforeEach(() => {
  // ResizeObserver
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }

  // IntersectionObserver
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
  }

  // requestAnimationFrame：返回 id 但不真正调用回调，防止无限 RAF 循环
  if (!globalThis.requestAnimationFrame) {
    globalThis.requestAnimationFrame = vi.fn().mockImplementation(() => 1);
    globalThis.cancelAnimationFrame = vi.fn();
  }

  // devicePixelRatio
  if (!Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio")) {
    Object.defineProperty(globalThis, "devicePixelRatio", {
      value: 1,
      configurable: true,
    });
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ─── matchMedia stub 工厂 ─────────────────────────────────────────────────

function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// ─── 测试 ─────────────────────────────────────────────────────────────────

describe("Iridescence · 正常渲染路径（matchMedia.matches=false）", () => {
  beforeEach(() => mockMatchMedia(false));

  it("渲染根容器 div 元素", () => {
    const { container } = render(<Iridescence />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 含 aria-hidden（纯装饰层）", () => {
    const { container } = render(<Iridescence />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("root div 含 z-0 absolute inset-0 类", () => {
    const { container } = render(<Iridescence />);
    const root = container.firstElementChild as HTMLElement;
    const cls = root.className;
    expect(cls).toContain("z-0");
    expect(cls).toContain("absolute");
    expect(cls).toContain("inset-0");
  });

  it("root div 含 pointer-events-none（不拦截点击）", () => {
    const { container } = render(<Iridescence />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("pointer-events-none");
  });

  it("className 透传到 root div", () => {
    const { container } = render(<Iridescence className="test-iridescence-custom" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-iridescence-custom");
  });

  it("不抛出错误（jsdom 无 WebGL，setup try/catch 静默降级）", () => {
    expect(() => render(<Iridescence />)).not.toThrow();
  });

  it("color=[r,g,b] 数组 prop 不抛", () => {
    expect(() =>
      render(<Iridescence color={[0.3, 0.6, 1.0]} />),
    ).not.toThrow();
  });

  it("color=CSS 字符串 prop 不抛", () => {
    expect(() =>
      render(<Iridescence color="oklch(0.7 0.2 200)" />),
    ).not.toThrow();
  });

  it("color=#hex 字符串 prop 不抛", () => {
    expect(() =>
      render(<Iridescence color="#6366f1" />),
    ).not.toThrow();
  });

  it("speed / amplitude / mouseReact prop 组合不抛", () => {
    expect(() =>
      render(<Iridescence speed={3} amplitude={0.4} mouseReact={false} />),
    ).not.toThrow();
  });

  it("极端 speed=0.01 不抛", () => {
    expect(() => render(<Iridescence speed={0.01} />)).not.toThrow();
  });

  it("mouseReact=false 不抛", () => {
    expect(() => render(<Iridescence mouseReact={false} />)).not.toThrow();
  });

  it("卸载不抛（dispose 路径）", () => {
    const { unmount } = render(<Iridescence />);
    expect(() => unmount()).not.toThrow();
  });

  it("多实例同时渲染不互相干扰", () => {
    const { container } = render(
      <>
        <Iridescence speed={1} />
        <Iridescence speed={2} color={[1, 0, 0]} />
      </>,
    );
    // 每个实例渲染一个 root div（className/aria-hidden 在 div 上）
    const rootDivs = Array.from(container.children);
    expect(rootDivs.length).toBe(2);
  });
});

describe("Iridescence · reduced-motion fallback 路径（matchMedia.matches=true）", () => {
  beforeEach(() => mockMatchMedia(true));

  it("渲染 fallback <div> 而非 <canvas>", () => {
    const { container } = render(<Iridescence />);
    // reduced=true 后不渲染 canvas
    expect(container.querySelector("canvas")).toBeNull();
    // 渲染 fallback div
    expect(container.querySelector("div")).not.toBeNull();
  });

  it("fallback div 含 aria-hidden", () => {
    const { container } = render(<Iridescence />);
    const div = container.querySelector("div")!;
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("fallback div 含 absolute inset-0 z-0 pointer-events-none", () => {
    const { container } = render(<Iridescence />);
    const div = container.querySelector("div")!;
    const cls = div.className;
    expect(cls).toContain("absolute");
    expect(cls).toContain("inset-0");
    expect(cls).toContain("z-0");
    expect(cls).toContain("pointer-events-none");
  });

  it("fallback div 含 conic-gradient（静态虹彩）", () => {
    const { container } = render(<Iridescence />);
    const div = container.querySelector("div")!;
    expect(div.className).toContain("conic-gradient");
  });

  it("className 透传到 fallback div", () => {
    const { container } = render(<Iridescence className="fallback-custom-cls" />);
    const div = container.querySelector("div")!;
    expect(div.className).toContain("fallback-custom-cls");
  });

  it("fallback prop 内容渲染在 fallback div 内", () => {
    const { getByText } = render(
      <Iridescence fallback={<span>Loading…</span>} />,
    );
    expect(getByText("Loading…")).not.toBeNull();
  });

  it("reduced-motion 下不抛", () => {
    expect(() => render(<Iridescence speed={2} amplitude={0.3} />)).not.toThrow();
  });
});
