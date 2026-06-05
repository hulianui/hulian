import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { FlickeringGrid } from "./flickering-grid";

// jsdom 不实现 canvas 2d context；getContext("2d") 返回 null。
// 组件对 null ctx 应安全退出（不抛），这是核心容错断言。
// 同时补充 ResizeObserver / IntersectionObserver / matchMedia / requestAnimationFrame
// 的最小 stub，避免 jsdom 缺失这些全局 API 造成测试崩溃。

beforeEach(() => {
  // ResizeObserver stub
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  // IntersectionObserver stub
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
    } as unknown as typeof IntersectionObserver;
  }
  // matchMedia stub：默认 reduced-motion=false（测完整动画路径）
  if (!globalThis.matchMedia) {
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  // requestAnimationFrame stub
  if (!globalThis.requestAnimationFrame) {
    globalThis.requestAnimationFrame = vi.fn().mockImplementation((cb: FrameRequestCallback) => {
      // 不真正调用，只返回 id，避免无限循环
      return 1;
    });
    globalThis.cancelAnimationFrame = vi.fn();
  }
  // devicePixelRatio
  if (!globalThis.devicePixelRatio) {
    Object.defineProperty(globalThis, "devicePixelRatio", { value: 1, configurable: true });
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FlickeringGrid", () => {
  it("渲染 div 容器 + canvas 子元素", () => {
    const { container } = render(<FlickeringGrid />);
    expect(container.querySelector("div")).not.toBeNull();
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("jsdom ctx=null 时不抛（容错核心）", () => {
    expect(() => render(<FlickeringGrid width={100} height={50} />)).not.toThrow();
  });

  it("className 透传到外层 div", () => {
    const { container } = render(<FlickeringGrid className="bg-surface" />);
    const div = container.querySelector("div")!;
    expect(div.getAttribute("class")).toContain("bg-surface");
  });

  it("含 pointer-events-none（装饰层不拦截点击）", () => {
    const { container } = render(<FlickeringGrid />);
    const div = container.querySelector("div")!;
    expect(div.getAttribute("class")).toContain("pointer-events-none");
  });

  it("aria-hidden=true（装饰语义）", () => {
    const { container } = render(<FlickeringGrid />);
    const div = container.querySelector("div")!;
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("canvas 含 block 类（消除 inline 基线间隙）", () => {
    const { container } = render(<FlickeringGrid />);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.getAttribute("class")).toContain("block");
  });

  it("固定 width/height prop 不抛", () => {
    expect(() =>
      render(<FlickeringGrid width={320} height={200} />),
    ).not.toThrow();
  });

  it("自定义 color prop 不抛", () => {
    expect(() =>
      render(<FlickeringGrid color="rgb(99, 102, 241)" />),
    ).not.toThrow();
  });

  it("maxOpacity=0 不抛（静默透明网格）", () => {
    expect(() => render(<FlickeringGrid maxOpacity={0} />)).not.toThrow();
  });

  it("flickerChance=0 不抛（纯静态网格）", () => {
    expect(() => render(<FlickeringGrid flickerChance={0} />)).not.toThrow();
  });

  it("reduced-motion 模式下不抛", () => {
    // 覆盖 matchMedia → prefers-reduced-motion: reduce = true
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    expect(() => render(<FlickeringGrid width={100} height={50} />)).not.toThrow();
  });

  it("多实例同时渲染不互相干扰", () => {
    const { container } = render(
      <>
        <FlickeringGrid className="instance-a" />
        <FlickeringGrid className="instance-b" />
      </>,
    );
    const canvases = container.querySelectorAll("canvas");
    expect(canvases.length).toBe(2);
  });

  it("squareSize / gridGap / maxOpacity / flickerChance 均可传数值不抛", () => {
    expect(() =>
      render(
        <FlickeringGrid
          squareSize={8}
          gridGap={4}
          flickerChance={0.7}
          maxOpacity={0.5}
        />,
      ),
    ).not.toThrow();
  });

  it("style prop 透传到外层 div", () => {
    const { container } = render(
      <FlickeringGrid style={{ borderRadius: "12px" }} />,
    );
    const div = container.querySelector("div") as HTMLDivElement;
    expect(div.style.borderRadius).toBe("12px");
  });
});
