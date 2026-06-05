import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { GridScan } from "./grid-scan";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默吞掉，
//    canvas 不绘制内容；matchMedia.matches=false 时仍渲染根容器 div。
// ③ matchMedia.matches=true → reduced=true → 渲染静态网格 fallback div。
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
// 正常路径（reduced=false → 渲染根容器 div，token class 在 className 上）
// ---------------------------------------------------------------------------
describe("GridScan · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<GridScan />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根 div 带 absolute inset-0 z-0 h-full w-full（背景层定位 token 类）", async () => {
    const { container } = render(<GridScan />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("根 div 带 aria-hidden + pointer-events-none（纯装饰）", async () => {
    const { container } = render(<GridScan />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
  });

  it("className 透传到根 div", async () => {
    const { container } = render(<GridScan className="test-grid-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-grid-class",
    );
  });

  it("各类 props 自定义值（lineStyle/scanDirection/颜色/数值）不抛", async () => {
    await expect(
      act(async () => {
        render(
          <GridScan
            linesColor="oklch(0.4 0.02 260)"
            scanColor="#6366f1"
            gridScale={0.2}
            lineThickness={2}
            lineStyle="dashed"
            scanOpacity={0.8}
            scanDirection="forward"
            scanDuration={3}
            scanDelay={1}
            scanSoftness={1.5}
            noiseIntensity={0}
            parallax={false}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<GridScan />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 静态网格 fallback，无 canvas）
// ---------------------------------------------------------------------------
describe("GridScan · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态 fallback div（无 canvas）+ 带定位/装饰类", async () => {
    const { container } = render(<GridScan />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("pointer-events-none");
  });

  it("className 透传到 fallback div，自定义 fallback 内容被渲染", async () => {
    const { container, getByTestId } = render(
      <GridScan
        className="reduced-grid"
        fallback={<span data-testid="fb">静态网格</span>}
      />,
    );
    await act(async () => {});
    expect(container.querySelector("div")!.className).toContain("reduced-grid");
    expect(getByTestId("fb").textContent).toBe("静态网格");
  });
});
