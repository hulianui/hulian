import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Ferrofluid } from "./ferrofluid";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内 matchMedia 调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默返回，
//    canvas.getContext 返回 null 也不抛。组件渲染根容器 div（带 ref，canvas 由 helper 异步挂）。
// ③ reduced 初值 false（useState），useEffect 读 matchMedia 更新：
//    matches=false → 渲染根容器 div；matches=true → 渲染 fallback div。
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

describe("Ferrofluid · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<Ferrofluid />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根容器带关键 token 类：absolute inset-0 z-0 + pointer-events-none + aria-hidden", async () => {
    const { container } = render(<Ferrofluid />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Ferrofluid className="test-ferro-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-ferro-class",
    );
  });

  it("默认 props 与自定义全 props 均不抛（jsdom 无 WebGL 走静默降级）", async () => {
    await expect(
      act(async () => {
        render(<Ferrofluid />);
      }),
    ).resolves.not.toThrow();
    await expect(
      act(async () => {
        render(
          <Ferrofluid
            colors={["#ff0000", "oklch(0.7 0.2 200)", "var(--color-chart-3)"]}
            speed={1}
            scale={2}
            turbulence={2}
            fluidity={0.3}
            rimWidth={0.4}
            sharpness={4}
            shimmer={0}
            glow={3}
            flowDirection="left"
            opacity={0.6}
            mouseInteraction={false}
            mouseDampening={0}
            dpr={1}
            className="custom"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不抛", async () => {
    const { unmount } = render(<Ferrofluid />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

describe("Ferrofluid · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas），带 token 类与 aria-hidden", async () => {
    const { container } = render(<Ferrofluid />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div).not.toBeNull();
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.className).toContain("pointer-events-none");
    expect(div.getAttribute("aria-hidden")).toBe("true");
    // 兜底用 chart token 径向渐变（DOM 不依赖运动状态变化）
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("className 透传 + 自定义 fallback 内容渲染", async () => {
    const { container, getByTestId } = render(
      <Ferrofluid
        className="reduced-custom"
        fallback={<span data-testid="ferro-fallback">静态液面</span>}
      />,
    );
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("reduced-custom");
    expect(getByTestId("ferro-fallback").textContent).toBe("静态液面");
  });
});
