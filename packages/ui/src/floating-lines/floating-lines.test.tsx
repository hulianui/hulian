import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { FloatingLines } from "./floating-lines";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 matchMedia → 必须 stub（useGlCanvas 内调用）。
// ② jsdom 无 WebGL context → useGlCanvas setup 被 try/catch 捕获静默降级，<canvas> 仍挂载但不绘制。
// ③ reduced=false → 渲染 root canvas 容器；reduced=true → 渲染静态渐变 fallback div。
// ④ ResizeObserver / IntersectionObserver / RAF stub 保险（WebGL 失败时多不调用）。
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

describe("FloatingLines · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<FloatingLines />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带 absolute inset-0 z-0 + pointer-events-none + aria-hidden（纯装饰背景层）", async () => {
    const { container } = render(<FloatingLines />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到 root div", async () => {
    const { container } = render(<FloatingLines className="test-fl-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-fl-class",
    );
  });

  it("自定义 props（colors/lineCount/speed/interactive/bend）不抛", async () => {
    await expect(
      act(async () => {
        render(
          <FloatingLines
            colors={["oklch(0.7 0.2 30)", "#6366f1", "rgb(40, 200, 180)"]}
            lineCount={9}
            lineDistance={8}
            animationSpeed={2}
            interactive={false}
            bendRadius={3}
            bendStrength={0.4}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("默认 props 不抛，且卸载不崩", async () => {
    const { unmount } = render(<FloatingLines />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

describe("FloatingLines · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态渐变 fallback div（带 chart token 背景类 + aria-hidden，无 canvas）", async () => {
    const { container } = render(<FloatingLines />);
    await act(async () => {});
    const div = container.firstElementChild as HTMLElement;
    expect(container.querySelector("canvas")).toBeNull();
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("自定义 fallback 内容被渲染 + className 透传", async () => {
    const { getByTestId, container } = render(
      <FloatingLines
        className="reduced-fl"
        fallback={<span data-testid="fl-fallback">静态背景</span>}
      />,
    );
    await act(async () => {});
    expect(getByTestId("fl-fallback").textContent).toBe("静态背景");
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "reduced-fl",
    );
  });
});
