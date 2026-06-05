import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { FaultyTerminal } from "./faulty-terminal";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① 无 window.matchMedia → stub（useGlCanvas 内读 reduced-motion）。
// ② 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默捕获，渲染根 div 但不绘制。
// ③ matchMedia.matches=false → reduced=false → 渲染 WebGL 根 div；=true → 渲染兜底 div。
// ④ ResizeObserver / IntersectionObserver / rAF 需在 jsdom 下保险 stub。
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
// 正常路径（reduced=false → WebGL 根 div）
// ---------------------------------------------------------------------------
describe("FaultyTerminal · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，且 getContext 返回 null 不抛", async () => {
    const { container } = render(<FaultyTerminal />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根 div 带背景层关键 token 类：absolute inset-0 z-0 h-full w-full", async () => {
    const { container } = render(<FaultyTerminal />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("根 div 带 aria-hidden（纯装饰）", async () => {
    const { container } = render(<FaultyTerminal />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("mouseReact=false 时根 div 带 pointer-events-none", async () => {
    const { container } = render(<FaultyTerminal mouseReact={false} />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("pointer-events-none");
  });

  it("className 透传到根 div", async () => {
    const { container } = render(<FaultyTerminal className="ft-custom" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("ft-custom");
  });

  it("自定义 props（tint/scale/curvature/dither boolean）全量不抛", async () => {
    await expect(
      act(async () => {
        render(
          <FaultyTerminal
            scale={2}
            gridMul={[3, 2]}
            tint="oklch(0.7 0.2 150)"
            curvature={0.4}
            chromaticAberration={4}
            dither
            pause
            mouseReact={false}
            className="all-props"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 静态兜底 div，无 canvas）
// ---------------------------------------------------------------------------
describe("FaultyTerminal · reduced-motion 兜底", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染兜底 div（无 canvas）且带 chart token 渐变背景类", async () => {
    const { container } = render(<FaultyTerminal />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.firstElementChild as HTMLElement;
    expect(div).not.toBeNull();
    expect(div.className).toContain("var(--color-chart-2)");
    expect(div.className).toContain("pointer-events-none");
  });

  it("兜底层渲染自定义 fallback 内容，className 透传", async () => {
    const { getByTestId, container } = render(
      <FaultyTerminal className="reduced-ft" fallback={<span data-testid="fb">离线终端</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("fb").textContent).toBe("离线终端");
    expect((container.firstElementChild as HTMLElement).className).toContain("reduced-ft");
  });
});
