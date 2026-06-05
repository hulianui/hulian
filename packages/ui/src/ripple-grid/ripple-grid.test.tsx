import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { RippleGrid } from "./ripple-grid";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 matchMedia → stub；matches=false 走 WebGL 分支（渲染容器 div + canvas）。
// ② jsdom 无 WebGL → useGlCanvas 的 setup 被 try/catch 静默吞，容器 div 仍挂载。
// ③ reduced 初始 false，useEffect 读 matchMedia 更新 → matches=true 时渲染 fallback。
// ④ ResizeObserver / IntersectionObserver / RAF 在 WebGL 失败时不调用，仍 stub 保险。
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
// 正常路径（matchMedia.matches=false → reduced=false → 渲染容器 div）
// ---------------------------------------------------------------------------
describe("RippleGrid · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<RippleGrid />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根 div 带背景层定位类 absolute inset-0 z-0 + h-full w-full + 装饰属性", async () => {
    const { container } = render(<RippleGrid />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到根 div", async () => {
    const { container } = render(<RippleGrid className="test-ripple-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-ripple-class",
    );
  });

  it("全套自定义 props 不抛", async () => {
    await expect(
      act(async () => {
        render(
          <RippleGrid
            enableRainbow
            color="oklch(0.65 0.22 285)"
            rippleIntensity={0.1}
            gridSize={16}
            gridThickness={20}
            fadeDistance={2}
            vignetteStrength={1.5}
            glowIntensity={0.3}
            opacity={0.8}
            gridRotation={45}
            mouseInteraction={false}
            mouseInteractionRadius={2}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩 + props 变化 rerender 不崩", async () => {
    const { unmount, rerender } = render(<RippleGrid gridSize={10} />);
    await act(async () => {});
    await expect(
      act(async () => {
        rerender(<RippleGrid gridSize={20} color="#6366f1" />);
      }),
    ).resolves.not.toThrow();
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（matchMedia.matches=true → reduced=true → 渲染 fallback div）
// ---------------------------------------------------------------------------
describe("RippleGrid · reduced-motion 路径（静态 fallback）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态 fallback div（无 canvas）+ aria-hidden + pointer-events-none + chart token", async () => {
    const { container } = render(<RippleGrid />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("pointer-events-none");
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("自定义 fallback 内容被渲染", async () => {
    const { getByTestId } = render(
      <RippleGrid fallback={<span data-testid="rg-fallback">静态网格</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("rg-fallback").textContent).toBe("静态网格");
  });

  it("className 透传到 fallback div", async () => {
    const { container } = render(<RippleGrid className="reduced-ripple" />);
    await act(async () => {});
    expect(container.querySelector("div")!.className).toContain("reduced-ripple");
  });
});
