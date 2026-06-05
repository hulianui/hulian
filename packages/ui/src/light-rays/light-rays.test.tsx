import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { LightRays } from "./light-rays";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk 一致，因共用 useGlCanvas）
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默捕获，<canvas> 仍挂载但不绘制。
// ③ matchMedia.matches=false → reduced=false → 渲染 canvas 容器；=true → 渲染静态兜底 div。
// ④ getContext("2d") 在 jsdom 返回 null → cssColorToRgb01 走兜底分支，不抛（仅 WebGL 路径才调）。
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
describe("LightRays · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<LightRays />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带背景层 token 类（absolute inset-0 z-0 + pointer-events-none + aria-hidden）", async () => {
    const { container } = render(<LightRays />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到 root div", async () => {
    const { container } = render(<LightRays className="test-rays-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-rays-class",
    );
  });

  it("style 透传到 root div", async () => {
    const { container } = render(<LightRays style={{ opacity: 0.5 }} />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.5");
  });

  it("各 prop 自定义值组合渲染不抛（含八向原点 / 鼠标跟随 / 脉动 / 噪点 / 扭曲）", async () => {
    await expect(
      act(async () => {
        render(
          <LightRays
            raysOrigin="bottom-right"
            raysColor="#ffcc00"
            raysSpeed={2}
            lightSpread={0.5}
            rayLength={3}
            pulsating
            fadeDistance={0.8}
            saturation={0.6}
            followMouse
            mouseInfluence={0.4}
            noiseAmount={0.3}
            distortion={0.5}
            className="custom"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不抛", async () => {
    const { unmount } = render(<LightRays />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染静态兜底 div，无 canvas）
// ---------------------------------------------------------------------------
describe("LightRays · reduced-motion 路径（静态兜底）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态兜底 div（无 canvas），带背景层 token 类 + aria-hidden", async () => {
    const { container } = render(<LightRays />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.firstElementChild as HTMLElement;
    expect(div).not.toBeNull();
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("自定义 fallback 内容被渲染", async () => {
    const { getByTestId } = render(
      <LightRays fallback={<span data-testid="rays-fallback">静态光束</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("rays-fallback").textContent).toBe("静态光束");
  });

  it("className 透传到兜底 div", async () => {
    const { container } = render(<LightRays className="reduced-rays" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "reduced-rays",
    );
  });
});
