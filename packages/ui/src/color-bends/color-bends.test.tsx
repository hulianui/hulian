import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { ColorBends } from "./color-bends";

// ---------------------------------------------------------------------------
// jsdom 环境：无 WebGL（useGlCanvas 内 setup 被 try/catch 静默降级）、无 matchMedia
// （必须 stub）。matchMedia.matches 控制走 WebGL 分支(false→canvas root) 还是
// reduced 分支(true→fallback div)。详见 silk.test.tsx 同款说明。
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

describe("ColorBends · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<ColorBends />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带关键 token 类：absolute inset-0 z-0 h-full w-full block + pointer-events-none + aria-hidden", async () => {
    const { container } = render(<ColorBends />);
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

  it("className prop 透传到 root div", async () => {
    const { container } = render(<ColorBends className="cb-custom-class" />);
    await act(async () => {});
    expect(
      (container.firstElementChild as HTMLElement).className,
    ).toContain("cb-custom-class");
  });

  it("各类 colors / 参数自定义不抛（hex+oklch 混传 + 全 prop）", async () => {
    await expect(
      act(async () => {
        render(
          <ColorBends
            colors={["#6366f1", "oklch(0.7 0.22 30)", "rgb(20, 200, 180)"]}
            rotation={45}
            autoRotate={10}
            speed={0.5}
            scale={1.4}
            frequency={2}
            warpStrength={1.5}
            iterations={3}
            intensity={2}
            bandWidth={8}
            noise={0}
            parallax={0.8}
            mouseInfluence={2}
            transparent={false}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<ColorBends />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

describe("ColorBends · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态渐变 fallback div（无 canvas），带 chart token 背景类", async () => {
    const { container } = render(<ColorBends />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.className).toContain("var(--color-chart-1)");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("自定义 fallback 内容被渲染 + className 透传", async () => {
    const { getByTestId, container } = render(
      <ColorBends
        className="reduced-cb"
        fallback={<span data-testid="cb-fallback">静态背景</span>}
      />,
    );
    await act(async () => {});
    expect(getByTestId("cb-fallback").textContent).toBe("静态背景");
    expect(container.querySelector("div")!.className).toContain("reduced-cb");
  });
});
