import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { PrismaticBurst } from "./prismatic-burst";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内 matchMedia 抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默降级。
//    正常分支渲染 root <div>（canvas 由 helper 在 effect 内 append，WebGL 失败时不绘制）。
// ③ reduced 由 useEffect 读 matchMedia 决定：false → 渲染 root div；true → 渲染 fallback div。
// ④ getContext("2d") 在 jsdom 下返回 null → cssColorToBytes 走兜底，不抛。
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
// 正常路径（reduced=false → 渲染 root div）
// ---------------------------------------------------------------------------
describe("PrismaticBurst · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，带背景层 token 类（absolute inset-0 z-0 + 装饰属性）", async () => {
    const { container } = render(<PrismaticBurst />);
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
    const { container } = render(<PrismaticBurst className="test-custom-class" />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-custom-class");
  });

  it("mixBlendMode 透传为内联 mix-blend-mode 样式", async () => {
    const { container } = render(<PrismaticBurst mixBlendMode="lighten" />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.mixBlendMode).toBe("lighten");
  });

  it("mixBlendMode='none' 不写内联 mix-blend-mode", async () => {
    const { container } = render(<PrismaticBurst mixBlendMode="none" />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.mixBlendMode).toBe("");
  });

  it("各类 props 自定义值不抛（intensity/speed/animationType/colors/distort/rayCount/offset）", async () => {
    await expect(
      act(async () => {
        render(
          <PrismaticBurst
            intensity={3}
            speed={2}
            animationType="rotate3d"
            colors={["#6366f1", "oklch(0.7 0.25 30)", "var(--color-chart-2)"]}
            distort={20}
            noiseAmount={0.5}
            rayCount={6}
            offset={{ x: 40, y: -20 }}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("不渲染 fallback 内容（正常分支无 fallback）", async () => {
    const { queryByTestId } = render(
      <PrismaticBurst fallback={<div data-testid="fb">静态</div>} />,
    );
    await act(async () => {});
    expect(queryByTestId("fb")).toBeNull();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<PrismaticBurst />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染 fallback div）
// ---------------------------------------------------------------------------
describe("PrismaticBurst · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas），带 token 背景类与装饰属性", async () => {
    const { container } = render(<PrismaticBurst />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.className).toContain("pointer-events-none");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("自定义 fallback 内容被渲染", async () => {
    const { getByTestId } = render(
      <PrismaticBurst fallback={<span data-testid="custom-fallback">静态光爆</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("custom-fallback").textContent).toBe("静态光爆");
  });

  it("className 透传到 fallback div", async () => {
    const { container } = render(<PrismaticBurst className="reduced-custom" />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("reduced-custom");
  });

  it("reduced 路径不崩且卸载不崩", async () => {
    const { unmount } = render(
      <PrismaticBurst intensity={2} rayCount={6} colors={["#abc"]} />,
    );
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});
