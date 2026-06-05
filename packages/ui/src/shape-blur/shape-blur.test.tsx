import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { ShapeBlur } from "./shape-blur";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 silk.test.tsx）
//
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL → useGlCanvas 的 setup 被 try/catch 静默捕获；canvas 已挂载但无绘制。
// ③ reduced 初值 false，effect 读 matchMedia 更新：
//    matches=false → 渲染 root <div>（内部 append canvas）；matches=true → 渲染 fallback div。
// ④ ResizeObserver / IntersectionObserver / RAF 仅 WebGL 成功后才用，jsdom 下不触发，
//    但仍 stub 兜底以防 helper 注册时抛。
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
    window.requestAnimationFrame = (cb) =>
      setTimeout(cb, 16) as unknown as number;
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  }

  if (!globalThis.ResizeObserver) {
    class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as unknown as Record<string, unknown>).ResizeObserver =
      MockResizeObserver;
  }

  if (!globalThis.IntersectionObserver) {
    (globalThis as unknown as Record<string, unknown>).IntersectionObserver =
      class {
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

describe("ShapeBlur · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，并带关键 token 类（absolute/inset-0/z-0/h-full/w-full）", async () => {
    const { container } = render(<ShapeBlur />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("root div 是纯装饰（aria-hidden + pointer-events-none）", async () => {
    const { container } = render(<ShapeBlur />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
  });

  it("className prop 透传到 root div", async () => {
    const { container } = render(<ShapeBlur className="test-custom-class" />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-custom-class");
  });

  it("各 variation + 自定义 props 渲染不抛", async () => {
    await expect(
      act(async () => {
        render(<ShapeBlur variation="round-rect" shapeSize={1.5} />);
        render(<ShapeBlur variation="circle-fill" circleSize={0.5} />);
        render(<ShapeBlur variation="circle-stroke" borderSize={0.1} />);
        render(
          <ShapeBlur
            variation="triangle"
            color="oklch(0.7 0.2 280)"
            damping={12}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<ShapeBlur />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染 fallback div）
// ---------------------------------------------------------------------------

describe("ShapeBlur · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas），带 absolute/inset-0/z-0 + aria-hidden", async () => {
    const { container } = render(<ShapeBlur />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div).not.toBeNull();
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到 fallback div，且自定义 fallback 内容被渲染", async () => {
    const { getByTestId, container } = render(
      <ShapeBlur
        className="reduced-custom"
        fallback={<span data-testid="custom-fallback">静态光晕</span>}
      />,
    );
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("reduced-custom");
    expect(getByTestId("custom-fallback").textContent).toBe("静态光晕");
  });
});
