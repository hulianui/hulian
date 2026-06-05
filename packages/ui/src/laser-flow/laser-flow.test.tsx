import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { LaserFlow } from "./laser-flow";

// ---------------------------------------------------------------------------
// jsdom 环境说明（与 Silk 同款，复用 useGlCanvas）
//
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获静默返回，
//    canvas 元素已挂载但无绘制内容（getContext 返回 null 不抛）。
// ③ reduced 用 useState(false) 初始化，再由 useEffect 读 matchMedia 更新：
//    matches=false → 渲染 canvas 根容器；matches=true → 渲染 fallback div。
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
// 正常路径（reduced=false → 渲染 canvas 根容器）
// ---------------------------------------------------------------------------
describe("LaserFlow · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，且带 absolute inset-0 z-0 / pointer-events-none / aria-hidden（纯装饰背景层）", async () => {
    const { container } = render(<LaserFlow />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<LaserFlow className="test-laser-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-laser-class",
    );
  });

  it("无 WebGL context（jsdom getContext 返回 null）不抛错；默认 props 安全渲染", async () => {
    await expect(
      act(async () => {
        render(<LaserFlow />);
      }),
    ).resolves.not.toThrow();
  });

  it("全 props 自定义值不崩（含 color / 各因子 / mouseTiltStrength=0 关交互）", async () => {
    await expect(
      act(async () => {
        render(
          <LaserFlow
            color="oklch(0.7 0.2 30)"
            horizontalBeamOffset={0.1}
            verticalBeamOffset={-0.05}
            flowSpeed={0.5}
            verticalSizing={2.5}
            horizontalSizing={0.4}
            fogIntensity={0.6}
            fogScale={0.4}
            fogFallSpeed={0.8}
            wispDensity={1.5}
            wispSpeed={20}
            wispIntensity={6}
            flowStrength={0.3}
            decay={1.2}
            falloffStart={1.1}
            mouseTiltStrength={0}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染 fallback div，无 canvas）
// ---------------------------------------------------------------------------
describe("LaserFlow · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas）且带 absolute inset-0 z-0 / aria-hidden / chart token 渐变兜底", async () => {
    const { container } = render(<LaserFlow />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div).not.toBeNull();
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("className 透传 + 自定义 fallback 内容被渲染", async () => {
    const { container, getByTestId } = render(
      <LaserFlow
        className="reduced-laser"
        fallback={<span data-testid="lf-fallback">静态光束</span>}
      />,
    );
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("reduced-laser");
    expect(getByTestId("lf-fallback").textContent).toBe("静态光束");
  });
});
