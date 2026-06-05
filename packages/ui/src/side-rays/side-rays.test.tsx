import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { SideRays } from "./side-rays";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk 测试）：
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 读取时抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默吞，
//    此时 root div 已挂载但无绘制。reduced=false 时渲染 canvas 容器 div。
// ③ matchMedia.matches=true → reduced=true → 渲染静态 fallback 装饰 div。
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
// 正常路径（reduced=false → 渲染 canvas 容器 div）
// ---------------------------------------------------------------------------
describe("SideRays · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，且带装饰层关键 token 类（absolute/inset-0/z-0/pointer-events-none/aria-hidden）", async () => {
    const { container } = render(<SideRays />);
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
    const { container } = render(<SideRays className="test-side-rays-class" />);
    await act(async () => {});
    expect(
      (container.firstElementChild as HTMLElement).className,
    ).toContain("test-side-rays-class");
  });

  it("各类 props（含 origin / 自定义颜色 / 极值）渲染不抛", async () => {
    await expect(
      act(async () => {
        render(
          <SideRays
            speed={4}
            rayColor1="#EAB308"
            rayColor2="oklch(0.7 0.18 240)"
            intensity={3}
            spread={1.2}
            origin="bottom-left"
            tilt={20}
            saturation={0}
            blend={0}
            falloff={2}
            opacity={0.6}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<SideRays />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染静态 fallback 装饰 div）
// ---------------------------------------------------------------------------
describe("SideRays · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态 fallback div（无 canvas），带 motion-reduce 禁用类 + chart token 渐变", async () => {
    const { container } = render(<SideRays />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("motion-reduce:[animation:none]");
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.style.backgroundImage).toContain("var(--color-chart-1)");
  });

  it("自定义 fallback 内容被渲染", async () => {
    const { getByTestId } = render(
      <SideRays fallback={<span data-testid="sr-fallback">静态</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("sr-fallback").textContent).toBe("静态");
  });

  it("origin 影响 fallback 渐变锚点（bottom-right → 100% 100%）", async () => {
    const { container } = render(<SideRays origin="bottom-right" />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.style.backgroundImage).toContain("100% 100%");
  });
});
