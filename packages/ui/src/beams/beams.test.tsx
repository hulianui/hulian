import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Beams } from "./beams";

// ---------------------------------------------------------------------------
// jsdom 说明（同 Silk）：
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 读 matchMedia 抛。
// ② jsdom 无 WebGL → useGlCanvas 的 setup 被 try/catch 静默吞掉，canvas 不绘制但 DOM 已挂。
// ③ reduced 由 matchMedia.matches 决定：false → 渲染 canvas 容器；true → 渲染 fallback div。
// 这里不真正建 WebGL，只断言根容器渲染、token 类、prop 透传、reduced 分支。
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

describe("Beams · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，且不抛", async () => {
    const { container } = render(<Beams />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根 div 带背景层关键 token 类（absolute inset-0 z-0 + 装饰属性）", async () => {
    const { container } = render(<Beams />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到根 div", async () => {
    const { container } = render(<Beams className="test-beams-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-beams-class",
    );
  });

  it("自定义全部 props（含 lightColor）不抛", async () => {
    await expect(
      act(async () => {
        render(
          <Beams
            beamNumber={20}
            beamWidth={3}
            speed={5}
            lightColor="oklch(0.7 0.2 30)"
            noiseIntensity={0}
            scale={0.5}
            rotation={-15}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Beams />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

describe("Beams · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态 fallback div（无 canvas），带 chart token 渐变 + 装饰属性", async () => {
    const { container } = render(<Beams />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.className).toContain("var(--color-chart-1)");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("自定义 fallback 内容被渲染（两态结构一致，不条件卸载内容）", async () => {
    const { getByTestId } = render(
      <Beams fallback={<span data-testid="bm-fb">静态光束</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("bm-fb").textContent).toBe("静态光束");
  });
});
