import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { PixelSnow } from "./pixel-snow";

// ---------------------------------------------------------------------------
// jsdom 环境说明
//
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内 matchMedia 抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默降级；
//    正常路径下 root div 仍被渲染（canvas 由 helper 内部追加，但无绘制）。
// ③ reduced 由 useState(false) 初始化，再由 effect 读 matchMedia 更新：
//    matches=false → 渲染 WebGL root div；matches=true → 渲染静态 fallback div。
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
    window.cancelAnimationFrame = (id) => clearTimeout(id as unknown as number);
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

// ---------------------------------------------------------------------------
// 正常路径（matchMedia.matches=false → reduced=false → 渲染 WebGL root div）
// ---------------------------------------------------------------------------

describe("PixelSnow · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，且带背景层 token 类（absolute inset-0 z-0 + 纯装饰 aria-hidden）", async () => {
    const { container } = render(<PixelSnow />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到 root div", async () => {
    const { container } = render(<PixelSnow className="test-snow-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-snow-class",
    );
  });

  it("默认 props 与各变体自定义值渲染均不抛", async () => {
    await expect(
      act(async () => {
        render(<PixelSnow />);
        render(
          <PixelSnow
            color="oklch(0.7 0.05 250)"
            density={0.5}
            variant="snowflake"
            speed={2}
            direction={90}
            pixelResolution={120}
          />,
        );
        render(<PixelSnow variant="round" speed={0} density={0} />);
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<PixelSnow />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（matchMedia.matches=true → reduced=true → 静态 fallback div）
// ---------------------------------------------------------------------------

describe("PixelSnow · reduced-motion 路径（静态 fallback）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态点阵 fallback div（无 canvas，foreground token 着色，DOM 仍为单 div）", async () => {
    const { container } = render(<PixelSnow />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(container.querySelector("canvas")).toBeNull();
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.getAttribute("aria-hidden")).toBe("true");
    // 静态雪花用 foreground token 点阵渐变
    expect(div.className).toContain("var(--color-foreground)");
  });

  it("className 与自定义 fallback 内容均生效", async () => {
    const { container, getByTestId } = render(
      <PixelSnow
        className="reduced-snow"
        fallback={<span data-testid="snow-fallback">静态雪</span>}
      />,
    );
    await act(async () => {});
    expect(container.querySelector("div")!.className).toContain("reduced-snow");
    expect(getByTestId("snow-fallback").textContent).toBe("静态雪");
  });
});
