import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Radar } from "./radar";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
//  ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
//  ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默返回；
//     canvas 元素仍被 helper 挂入根 div，但无绘制（getContext 返回 null 不抛）。
//  ③ reduced 用 useState(false) 初始化，由 useEffect 读 matchMedia 更新：
//     matches=false → 渲染 WebGL 容器；matches=true → 渲染 fallback div。
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
    class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = MockResizeObserver;
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
// 正常路径（reduced=false → 渲染 WebGL 根容器）
// ---------------------------------------------------------------------------
describe("Radar · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，带 absolute inset-0 z-0 h-full w-full block token 类，不抛错", async () => {
    const { container } = render(<Radar />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("block");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Radar className="test-radar-class" />);
    await act(async () => {});
    expect(container.firstElementChild?.className).toContain("test-radar-class");
  });

  it("enableMouseInteraction=false 时根容器带 pointer-events-none；=true 时不带", async () => {
    const { container: c1 } = render(<Radar enableMouseInteraction={false} />);
    await act(async () => {});
    expect((c1.firstElementChild as HTMLElement).className).toContain(
      "pointer-events-none",
    );

    const { container: c2 } = render(<Radar enableMouseInteraction />);
    await act(async () => {});
    expect((c2.firstElementChild as HTMLElement).className).not.toContain(
      "pointer-events-none",
    );
  });

  it("各 prop 自定义值不抛（speed/scale/ring/spoke/sweep/color/bg/falloff/brightness）", async () => {
    await expect(
      act(async () => {
        render(
          <Radar
            speed={2}
            scale={0.8}
            ringCount={6}
            spokeCount={12}
            ringThickness={0.08}
            spokeThickness={0.02}
            sweepSpeed={1.5}
            sweepWidth={3}
            sweepLobes={2}
            color="oklch(0.65 0.22 285)"
            backgroundColor="#0a0a0a"
            falloff={3}
            brightness={1.4}
            mouseInfluence={0.2}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Radar />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染 fallback div，无 canvas）
// ---------------------------------------------------------------------------
describe("Radar · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div，带 absolute inset-0 z-0 + pointer-events-none + aria-hidden + chart token 渐变", async () => {
    const { container } = render(<Radar />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.className).toContain("pointer-events-none");
    expect(div.className).toContain("var(--color-chart-1)");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("自定义 fallback 内容被渲染，className 透传", async () => {
    const { getByTestId, container } = render(
      <Radar
        className="reduced-radar"
        fallback={<span data-testid="rf">静态雷达</span>}
      />,
    );
    await act(async () => {});
    expect(getByTestId("rf").textContent).toBe("静态雷达");
    expect(container.querySelector("div")!.className).toContain("reduced-radar");
  });
});
