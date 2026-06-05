import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Lightning } from "./lightning";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 matchMedia → 必须 stub（useGlCanvas 会读 prefers-reduced-motion）。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默吞掉，不抛。
// ③ matchMedia.matches=false → reduced=false → 渲染根 div（canvas 由 helper 注入但 GL 失败）。
//    matchMedia.matches=true  → reduced=true  → 渲染静态 fallback div。
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

describe("Lightning · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，且带背景层 token 类（absolute inset-0 z-0 + aria-hidden）", async () => {
    const { container } = render(<Lightning />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Lightning className="test-lightning-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-lightning-class",
    );
  });

  it("默认 props 与全自定义 props 均不抛（hue/color/xOffset/speed/intensity/size）", async () => {
    await expect(
      act(async () => {
        render(<Lightning />);
        render(
          <Lightning
            hue={30}
            color="var(--color-chart-1)"
            xOffset={0.3}
            speed={1.5}
            intensity={1.2}
            size={1.4}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("正常分支不渲染 fallback 内容", async () => {
    const { queryByTestId } = render(
      <Lightning fallback={<div data-testid="lf">静态</div>} />,
    );
    await act(async () => {});
    expect(queryByTestId("lf")).toBeNull();
  });
});

describe("Lightning · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态 fallback div（无 canvas）+ chart token 辉光类 + aria-hidden", async () => {
    const { container } = render(<Lightning />);
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

  it("自定义 fallback 内容被渲染 + className 透传", async () => {
    const { getByTestId, container } = render(
      <Lightning
        className="reduced-custom"
        fallback={<span data-testid="custom-fb">静态闪电</span>}
      />,
    );
    await act(async () => {});
    expect(getByTestId("custom-fb").textContent).toBe("静态闪电");
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "reduced-custom",
    );
  });
});
