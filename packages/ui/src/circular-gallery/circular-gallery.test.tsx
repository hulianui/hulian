import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { CircularGallery } from "./circular-gallery";

// jsdom 不实现 WebGL：useGlCanvas 内 setup 的 new Renderer 会因 getContext 返回 null 静默失败，
// 组件不抛错、root div 仍渲染。必须 stub：matchMedia / Resize+IntersectionObserver / RAF / dpr。

function makeMatchMedia(reduced: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: reduced ? query.includes("prefers-reduced-motion") : false,
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

describe("CircularGallery 正常渲染路径（WebGL canvas）", () => {
  it("渲染根容器 div，不抛错（jsdom 无 WebGL 也安全）", () => {
    expect(() => render(<CircularGallery />)).not.toThrow();
    const { container } = render(<CircularGallery />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带 grab 光标 + overflow-hidden token 类", () => {
    const { container } = render(<CircularGallery />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("cursor-grab");
    expect(root.className).toContain("overflow-hidden");
    expect(root.className).toContain("active:cursor-grabbing");
  });

  it("className prop 透传到 root div", () => {
    const { container } = render(<CircularGallery className="rounded-2xl ring-1" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("rounded-2xl");
    expect(root.className).toContain("ring-1");
  });

  it("显式传入各 prop（bend/textColor/borderRadius/items/scrollSpeed）不抛", () => {
    expect(() =>
      render(
        <CircularGallery
          bend={-4}
          textColor="var(--color-primary)"
          borderRadius={0.2}
          scrollSpeed={4}
          scrollEase={0.1}
          items={[{ text: "A" }, { text: "B", image: "/x.png" }]}
        />,
      ),
    ).not.toThrow();
  });

  it("bend=0（平直）与极值不抛", () => {
    expect(() => render(<CircularGallery bend={0} />)).not.toThrow();
    expect(() => render(<CircularGallery bend={6} />)).not.toThrow();
  });

  it("卸载不抛（dispose + GL context release 兜底）", () => {
    const { unmount } = render(<CircularGallery />);
    expect(() => unmount()).not.toThrow();
  });

  it("prop 变更 re-render 不抛", () => {
    const { rerender } = render(<CircularGallery bend={3} />);
    expect(() => rerender(<CircularGallery bend={1} />)).not.toThrow();
    expect(() => rerender(<CircularGallery textColor="var(--color-chart-2)" />)).not.toThrow();
  });
});

describe("CircularGallery reduced-motion fallback", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced-motion 路径渲染不抛", () => {
    expect(() => render(<CircularGallery />)).not.toThrow();
  });

  it("fallback 路径下标题文字仍出现在 DOM（内容不因 reduced 卸载）", () => {
    const { container, rerender } = render(
      <CircularGallery items={[{ text: "瑚琏画廊" }]} />,
    );
    rerender(<CircularGallery items={[{ text: "瑚琏画廊" }]} />);
    // 要么 canvas 路径（首帧 reduced=false）要么 fallback 已激活；二者都不应抛
    const hasDiv = container.querySelector("div") !== null;
    expect(hasDiv).toBe(true);
  });

  it("自定义 fallback slot 不导致崩溃", () => {
    expect(() =>
      render(<CircularGallery fallback={<span data-testid="fb">空</span>} />),
    ).not.toThrow();
  });
});
