import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Lightfall } from "./lightfall";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获、静默返回；
//    <canvas> 已挂载但无绘制。getContext 返回 null 不会抛（cssColorToRgb01 也兜底）。
// ③ reduced=false → 渲染 canvas 容器；reduced=true → 渲染静态渐变兜底 div。
// ---------------------------------------------------------------------------

function makeMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
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
  Object.defineProperty(window, "devicePixelRatio", {
    writable: true,
    configurable: true,
    value: 1,
  });
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb) => setTimeout(cb, 16) as unknown as number;
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  }
  if (!globalThis.ResizeObserver) {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!globalThis.IntersectionObserver) {
    (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      constructor(_cb: unknown, _opts?: unknown) {}
    };
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Lightfall · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，带 absolute inset-0 z-0 h-full w-full + pointer-events-none + aria-hidden", async () => {
    const { container } = render(<Lightfall />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Lightfall className="test-lightfall-class" />);
    await act(async () => {});
    expect(container.firstElementChild?.className).toContain("test-lightfall-class");
  });

  it("默认 props 与全量自定义 props 均不抛（无真实 WebGL 也安全降级）", async () => {
    await expect(
      act(async () => {
        render(<Lightfall />);
        render(
          <Lightfall
            colors={["oklch(0.7 0.2 30)", "#5227FF", "rgb(166,200,255)"]}
            backgroundColor="#0A29FF"
            speed={1.2}
            streakCount={6}
            streakWidth={2}
            streakLength={1.5}
            glow={1.4}
            density={1}
            twinkle={0}
            zoom={4}
            backgroundGlow={0.8}
            opacity={0.9}
            mouseInteraction={false}
            className="custom"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Lightfall />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

describe("Lightfall · reduced-motion 路径（静态兜底）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态渐变兜底 div（无 canvas），带 token 渐变 + aria-hidden + pointer-events-none", async () => {
    const { container } = render(<Lightfall />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.firstElementChild as HTMLElement;
    expect(div).not.toBeNull();
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("pointer-events-none");
    // 兜底用 chart / primary token（明暗自适应），不写死品牌色
    expect(div.className).toContain("var(--color-chart-1)");
    expect(div.className).toContain("var(--color-primary)");
  });

  it("自定义 fallback 内容被渲染，className 透传", async () => {
    const { getByTestId, container } = render(
      <Lightfall
        className="reduced-custom"
        fallback={<span data-testid="fb">静态背景</span>}
      />,
    );
    await act(async () => {});
    expect(getByTestId("fb").textContent).toBe("静态背景");
    expect(container.firstElementChild?.className).toContain("reduced-custom");
  });
});
