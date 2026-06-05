import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Grainient } from "./grainient";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
// ① jsdom 无 matchMedia → stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL → useGlCanvas 的 setup 被 try/catch 静默捕获；canvas 由 helper 挂载，
//    但无绘制内容。
// ③ reduced 用 useState(false) 初始化，再由 useEffect 读 matchMedia 更新：
//    matches=false → 渲染 root（含 canvas 容器）；matches=true → 渲染 fallback div。
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
// 正常路径（reduced=false → 渲染 root 容器，无 WebGL 时不抛）
// ---------------------------------------------------------------------------
describe("Grainient · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div 元素，不抛错", async () => {
    const { container } = render(<Grainient />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带关键 token 类：absolute inset-0 z-0 + pointer-events-none + 铺满", async () => {
    const { container } = render(<Grainient />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("root div 带 aria-hidden（纯装饰，不挡无障碍）", async () => {
    const { container } = render(<Grainient />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到 root div", async () => {
    const { container } = render(<Grainient className="test-grainient-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-grainient-class",
    );
  });

  it("自定义三色 + 各数值 prop 不抛", async () => {
    await expect(
      act(async () => {
        render(
          <Grainient
            color1="oklch(0.7 0.2 30)"
            color2="#5227ff"
            color3="rgb(180, 151, 207)"
            timeSpeed={0.5}
            grainAmount={0.2}
            grainAnimated
            zoom={1.2}
            contrast={2}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Grainient />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（matches=true → 渲染静态渐变 fallback，无 canvas）
// ---------------------------------------------------------------------------
describe("Grainient · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态渐变 fallback div（无 canvas），带 chart token 渐变", async () => {
    const { container } = render(<Grainient />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("z-0");
    expect(div.className).toContain("var(--color-chart-1)");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("自定义 fallback 内容被渲染（DOM 始终存在）", async () => {
    const { getByTestId } = render(
      <Grainient fallback={<span data-testid="fb">静态背景</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("fb").textContent).toBe("静态背景");
  });

  it("className 透传到 fallback div", async () => {
    const { container } = render(<Grainient className="reduced-grainient" />);
    await act(async () => {});
    expect(container.querySelector("div")!.className).toContain("reduced-grainient");
  });
});
