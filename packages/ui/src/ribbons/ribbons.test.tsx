import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Ribbons } from "./ribbons";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 matchMedia → stub；matches=false 走 WebGL 分支（渲染容器 div），
//    matches=true 走 reduced fallback 分支。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默捕获，不抛。
// ③ ResizeObserver / IntersectionObserver / rAF 在 WebGL 失败时大多不触发，
//    但仍 stub 保险，确保不因缺 API 抛错。
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
// 正常路径（reduced=false → 渲染背景容器 div）
// ---------------------------------------------------------------------------
describe("Ribbons · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<Ribbons />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根容器带 absolute inset-0 z-0 + pointer-events-none + aria-hidden（背景装饰层）", async () => {
    const { container } = render(<Ribbons />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Ribbons className="test-ribbons-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-ribbons-class",
    );
  });

  it("自定义 props 全套不抛（colors/spring/thickness/fade/shaderEffect）", async () => {
    await expect(
      act(async () => {
        render(
          <Ribbons
            colors={["#fc8eac", "oklch(0.7 0.2 30)", "rgb(99,102,241)"]}
            baseSpring={0.05}
            baseFriction={0.85}
            baseThickness={40}
            offsetFactor={0.08}
            maxAge={800}
            pointCount={60}
            speedMultiplier={0.9}
            enableFade
            enableShaderEffect
            effectAmplitude={3}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Ribbons />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染静态渐变 fallback）
// ---------------------------------------------------------------------------
describe("Ribbons · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas），带 chart token 渐变 + aria-hidden", async () => {
    const { container } = render(<Ribbons />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("pointer-events-none");
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("自定义 fallback 内容被渲染，className 透传", async () => {
    const { getByTestId, container } = render(
      <Ribbons
        className="reduced-custom"
        fallback={<span data-testid="rb-fallback">静态飘带</span>}
      />,
    );
    await act(async () => {});
    expect(getByTestId("rb-fallback").textContent).toBe("静态飘带");
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "reduced-custom",
    );
  });
});
