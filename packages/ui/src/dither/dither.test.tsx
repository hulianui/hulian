import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Dither } from "./dither";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默吞掉；canvas DOM 已挂载但无绘制。
// ③ matchMedia.matches=false → reduced=false → 渲染 canvas 容器 div；=true → 渲染 fallback div。
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
describe("Dither · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<Dither />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带背景层关键 token 类（absolute inset-0 z-0 h-full w-full pointer-events-none）", async () => {
    const { container } = render(<Dither />);
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
    const { container } = render(<Dither />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到 root div", async () => {
    const { container } = render(<Dither className="test-dither-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("test-dither-class");
  });

  it("各类 props 自定义值不抛（waveSpeed/waveFrequency/waveColor/colorNum/pixelSize/disableAnimation）", async () => {
    await expect(
      act(async () => {
        render(
          <Dither
            waveSpeed={0.2}
            waveFrequency={5}
            waveAmplitude={0.5}
            waveColor="oklch(0.65 0.22 285)"
            colorNum={6}
            pixelSize={4}
            disableAnimation
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Dither />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染 fallback div）
// ---------------------------------------------------------------------------
describe("Dither · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas），带 absolute inset-0 z-0 + aria-hidden", async () => {
    const { container } = render(<Dither />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传 + 自定义 fallback 内容被渲染", async () => {
    const { getByTestId, container } = render(
      <Dither
        className="reduced-dither"
        fallback={<span data-testid="dither-fallback">静态</span>}
      />,
    );
    await act(async () => {});
    expect(container.querySelector("div")!.className).toContain("reduced-dither");
    expect(getByTestId("dither-fallback").textContent).toBe("静态");
  });
});
