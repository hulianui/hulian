import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { LetterGlitch } from "./letter-glitch";

// jsdom 不实现 canvas 2d context；getContext("2d") 返回 null。
// 组件对 null ctx 应安全退出（不抛），这是核心容错断言。
// 补 ResizeObserver / matchMedia / requestAnimationFrame 最小 stub。

beforeEach(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
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
  if (!globalThis.requestAnimationFrame) {
    globalThis.requestAnimationFrame = vi
      .fn()
      .mockImplementation((_cb: FrameRequestCallback) => 1);
    globalThis.cancelAnimationFrame = vi.fn();
  }
  if (!globalThis.devicePixelRatio) {
    Object.defineProperty(globalThis, "devicePixelRatio", {
      value: 1,
      configurable: true,
    });
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LetterGlitch", () => {
  it("渲染根 div 容器 + canvas 子元素，jsdom ctx=null 不抛（容错核心）", () => {
    const { container } = render(<LetterGlitch />);
    expect(container.querySelector("div")).not.toBeNull();
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("根容器带 aria-hidden + overflow-hidden + bg-surface（装饰语义 + token 底色）", () => {
    const { container } = render(<LetterGlitch />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("overflow-hidden");
    expect(root.className).toContain("bg-surface");
  });

  it("默认 outerVignette=true 注入径向暗角层（含 var(--color-surface) token）", () => {
    const { container } = render(<LetterGlitch />);
    const vignette = container.querySelector(
      "[class*='pointer-events-none'][class*='absolute']",
    ) as HTMLElement;
    expect(vignette).not.toBeNull();
    expect(vignette.style.background).toContain("var(--color-surface)");
    expect(vignette.style.background).toContain("radial-gradient");
  });

  it("outerVignette=false 时不渲染暗角层", () => {
    const { container } = render(<LetterGlitch outerVignette={false} />);
    const vignette = container.querySelector(
      "[class*='pointer-events-none'][class*='absolute']",
    );
    expect(vignette).toBeNull();
  });

  it("centerVignette=true 时额外渲染中心暗角层", () => {
    const { container } = render(
      <LetterGlitch outerVignette={false} centerVignette />,
    );
    const vignette = container.querySelector(
      "[class*='pointer-events-none'][class*='absolute']",
    );
    expect(vignette).not.toBeNull();
  });

  it("reduced-motion 模式下渲染不抛（静态一帧路径）", () => {
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
    expect(() => render(<LetterGlitch />)).not.toThrow();
  });

  it("className / style / props 透传到根容器，自定义参数不抛", () => {
    const { container } = render(
      <LetterGlitch
        className="test-glitch-class"
        style={{ borderRadius: "12px" }}
        data-testid="lg"
        glitchSpeed={120}
        smooth={false}
        glitchColors={["oklch(0.7 0.2 30)", "rgb(99,102,241)"]}
        characters="ABC123"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-glitch-class");
    expect(root.style.borderRadius).toBe("12px");
    expect(root.getAttribute("data-testid")).toBe("lg");
  });

  it("canvas 含 block 类（消除 inline 基线间隙）", () => {
    const { container } = render(<LetterGlitch />);
    expect(container.querySelector("canvas")!.className).toContain("block");
  });
});
