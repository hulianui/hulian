import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { LineWaves } from "./line-waves";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
//
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默降级，
//    canvas 不绘制内容但根 div 已挂载。本组件测试只断言 DOM 结构 / token 类 / 透传 / 不崩。
// ③ reduced 用 useState(false) 初始化，再由 useEffect 读 matchMedia 更新：
//    - matches=false → 渲染 WebGL 根 div（带 inset-0 z-0…）
//    - matches=true  → 渲染静态 fallback div（带 chart token 线纹 background）
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
// 正常路径（reduced=false → WebGL 根 div）
// ---------------------------------------------------------------------------
describe("LineWaves · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，且带 absolute inset-0 z-0 h-full w-full（背景层 token 类）", async () => {
    const { container } = render(<LineWaves />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("根 div 带 aria-hidden + pointer-events-none（纯装饰，不挡交互）", async () => {
    const { container } = render(<LineWaves />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
  });

  it("className 透传到根 div；额外 DOM 属性（data-*）透传", async () => {
    const { container } = render(
      <LineWaves className="test-line-waves" data-testid="lw-root" />,
    );
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-line-waves");
    expect(root.getAttribute("data-testid")).toBe("lw-root");
  });

  it("全自定义 props（含 oklch 色 / 关交互）不崩，且无 WebGL 时不渲染 fallback 内容", async () => {
    const { queryByTestId } = render(
      <LineWaves
        speed={0.6}
        innerLineCount={20}
        outerLineCount={48}
        warpIntensity={1.5}
        rotation={30}
        brightness={0.4}
        color1="oklch(0.7 0.2 30)"
        color2="#22d3ee"
        color3="rgb(168, 85, 247)"
        enableMouseInteraction={false}
        mouseInfluence={3}
        fallback={<div data-testid="lw-fallback">静态</div>}
      />,
    );
    await act(async () => {});
    // fallback 仅在 reduced=true 时出现
    expect(queryByTestId("lw-fallback")).toBeNull();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<LineWaves />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 静态 fallback div）
// ---------------------------------------------------------------------------
describe("LineWaves · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态 fallback div（无 canvas），带 chart token 线纹 background + aria-hidden", async () => {
    const { container } = render(<LineWaves />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.firstElementChild as HTMLElement;
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("var(--color-chart-1)");
    expect(div.className).toContain("repeating-linear-gradient");
    expect(div.className).toContain("pointer-events-none");
  });

  it("className 与自定义 fallback 内容均渲染到 fallback div", async () => {
    const { container, getByTestId } = render(
      <LineWaves
        className="reduced-lw"
        fallback={<span data-testid="custom-fb">静态波纹</span>}
      />,
    );
    await act(async () => {});
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("reduced-lw");
    expect(getByTestId("custom-fb").textContent).toBe("静态波纹");
  });
});
