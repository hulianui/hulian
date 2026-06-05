import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Plasma } from "./plasma";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内 matchMedia 抛。
// ② jsdom 无 WebGL2 context → useGlCanvas 的 setup 被 try/catch 捕获，静默返回；
//    canvas 离屏 getContext("2d") 解析颜色那段也被 try/catch 兜底，不抛。
// ③ reduced=false → 渲染 canvas 容器；reduced=true → 渲染 fallback div。
// ④ ResizeObserver / IntersectionObserver / rAF 在 WebGL 失败时不建，但需 stub 防 jsdom 缺 API。
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
describe("Plasma · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div 元素", async () => {
    const { container } = render(<Plasma />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带 absolute inset-0 z-0 h-full w-full 等关键 token 类", async () => {
    const { container } = render(<Plasma />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("pointer-events-none");
  });

  it("root div 带 aria-hidden（纯装饰）", async () => {
    const { container } = render(<Plasma />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到 root div", async () => {
    const { container } = render(<Plasma className="test-plasma-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("test-plasma-class");
  });

  it("各 props 自定义值均不抛（color/speed/direction/scale/opacity/mouseInteractive）", async () => {
    await expect(
      act(async () => {
        render(
          <Plasma
            color="#6366f1"
            speed={2}
            direction="pingpong"
            scale={1.5}
            opacity={0.6}
            mouseInteractive={false}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("direction=reverse / pingpong 不崩", async () => {
    await expect(
      act(async () => {
        render(<Plasma direction="reverse" />);
        render(<Plasma direction="pingpong" />);
      }),
    ).resolves.not.toThrow();
  });

  it("color oklch / rgb 字符串不崩", async () => {
    await expect(
      act(async () => {
        render(<Plasma color="oklch(0.7 0.22 30)" />);
        render(<Plasma color="rgb(99, 102, 241)" />);
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Plasma />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染 fallback div）
// ---------------------------------------------------------------------------
describe("Plasma · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas），带 token 类与 aria-hidden", async () => {
    const { container } = render(<Plasma />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.className).toContain("pointer-events-none");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("fallback 渐变吃 chart token（--color-chart-1）", async () => {
    const { container } = render(<Plasma />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("className 透传 + 自定义 fallback 内容被渲染", async () => {
    const { container, getByTestId } = render(
      <Plasma className="reduced-plasma" fallback={<span data-testid="fb">静态</span>} />,
    );
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("reduced-plasma");
    expect(getByTestId("fb").textContent).toBe("静态");
  });

  it("reduced 路径不崩 + 卸载不崩", async () => {
    const { unmount } = render(<Plasma color="#abc" direction="reverse" />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});
