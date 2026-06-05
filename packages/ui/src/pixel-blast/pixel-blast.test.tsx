import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { PixelBlast } from "./pixel-blast";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
//
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内 matchMedia 调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默返回。
//    此时根 div 已挂载（DOM 由组件决定），canvas 由 helper 动态 append（无 WebGL 不绘制）。
// ③ matchMedia.matches=false → reduced=false → 渲染 WebGL 容器 div
//    matchMedia.matches=true  → reduced=true  → 渲染静态点阵 fallback div
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

// ---------------------------------------------------------------------------
// 正常路径（reduced=false → 渲染 WebGL 容器 div）
// ---------------------------------------------------------------------------
describe("PixelBlast · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<PixelBlast />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根 div 带 absolute inset-0 z-0 + pointer-events-none + aria-hidden（纯装饰背景层）", async () => {
    const { container } = render(<PixelBlast />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 与 style 透传到根 div", async () => {
    const { container } = render(
      <PixelBlast className="test-custom-class" style={{ opacity: 0.5 }} />,
    );
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-custom-class");
    expect(root.style.opacity).toBe("0.5");
  });

  it("各 variant + 自定义 props 均不抛", async () => {
    await expect(
      act(async () => {
        render(<PixelBlast variant="square" />);
        render(<PixelBlast variant="circle" pixelSize={6} />);
        render(<PixelBlast variant="triangle" patternScale={3} patternDensity={1.3} />);
        render(
          <PixelBlast
            variant="diamond"
            pixelSizeJitter={0.4}
            speed={0}
            edgeFade={0}
            color="oklch(0.65 0.22 285)"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<PixelBlast />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染静态点阵 fallback div）
// ---------------------------------------------------------------------------
describe("PixelBlast · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态点阵 fallback div（无 canvas），带 token 背景 + opacity", async () => {
    const { container } = render(<PixelBlast />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.className).toContain("pointer-events-none");
    expect(div.getAttribute("aria-hidden")).toBe("true");
    // 静态点阵：radial-gradient + 8px 网格 + opacity
    expect(div.className).toContain("var(--color-primary)");
    expect(div.className).toContain("background-size:8px_8px");
    expect(div.className).toContain("opacity-60");
  });

  it("className 与自定义 fallback 内容在 reduced 分支渲染", async () => {
    const { container, getByTestId } = render(
      <PixelBlast
        className="reduced-custom"
        fallback={<span data-testid="fb">静态背景</span>}
      />,
    );
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("reduced-custom");
    expect(getByTestId("fb").textContent).toBe("静态背景");
  });
});
