import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { LightPillar } from "./light-pillar";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 内调用抛
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默返回；
//    <canvas> 已挂载但无绘制内容，根 div 仍渲染
// ③ matchMedia.matches=false → reduced=false → 渲染 WebGL 容器 div
//    matchMedia.matches=true  → reduced=true  → 渲染静态 fallback div
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

describe("LightPillar · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，带背景层关键 token 类（absolute inset-0 z-0 h-full w-full）", async () => {
    const { container } = render(<LightPillar />);
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
    const { container } = render(<LightPillar />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
  });

  it("className prop 透传到根 div", async () => {
    const { container } = render(<LightPillar className="test-pillar-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-pillar-class",
    );
  });

  it("全部 props 自定义不抛（含 color/intensity/旋转/几何参数）", async () => {
    await expect(
      act(async () => {
        render(
          <LightPillar
            topColor="oklch(0.65 0.22 285)"
            bottomColor="#ff9ffc"
            intensity={1.4}
            rotationSpeed={0.6}
            glowAmount={0.01}
            pillarWidth={4}
            pillarHeight={0.6}
            noiseIntensity={0}
            pillarRotation={30}
            className="custom"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<LightPillar />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

describe("LightPillar · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas），带 absolute inset-0 z-0 + aria-hidden", async () => {
    const { container } = render(<LightPillar />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("fallback 渐变层吃 chart token（--color-chart-1 / --color-chart-2）", async () => {
    const { container } = render(<LightPillar />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    const inner = root.firstElementChild as HTMLElement;
    expect(inner).not.toBeNull();
    expect(inner.className).toContain("var(--color-chart-1)");
    expect(inner.className).toContain("var(--color-chart-2)");
  });

  it("className 透传到 fallback 根 div，自定义 fallback 内容被渲染", async () => {
    const { container, getByTestId } = render(
      <LightPillar
        className="reduced-custom"
        fallback={<span data-testid="fb">静态光柱</span>}
      />,
    );
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "reduced-custom",
    );
    expect(getByTestId("fb").textContent).toBe("静态光柱");
  });
});
