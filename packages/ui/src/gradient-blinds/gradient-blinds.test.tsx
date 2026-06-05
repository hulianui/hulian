import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { GradientBlinds } from "./gradient-blinds";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）：
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内 matchMedia 调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默捕获，仅挂载 <canvas>。
// ③ reduced 用 useState(false) 初始化，再由 useEffect 读 matchMedia 更新：
//    matches=false → 渲染正常态 root div；matches=true → 渲染静态 fallback 兜底层。
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

describe("GradientBlinds · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div 且带背景层定位类（absolute inset-0 h-full w-full）", async () => {
    const { container } = render(<GradientBlinds />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("根 div 带 aria-hidden（纯装饰背景）", async () => {
    const { container } = render(<GradientBlinds />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到根容器", async () => {
    const { container } = render(<GradientBlinds className="test-blinds-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("test-blinds-class");
  });

  it("style 透传到根容器", async () => {
    const { container } = render(<GradientBlinds style={{ mixBlendMode: "lighten" }} />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).style.mixBlendMode).toBe("lighten");
  });

  it("默认 props 不抛（angle/noise/blindCount/spotlight* 全默认）", async () => {
    await expect(
      (async () => {
        render(<GradientBlinds />);
        await act(async () => {});
      })(),
    ).resolves.not.toThrow();
  });

  it("传入自定义 gradientColors / angle / blindCount 不抛", async () => {
    await expect(
      (async () => {
        render(
          <GradientBlinds
            gradientColors={["oklch(0.7 0.2 30)", "oklch(0.6 0.18 200)"]}
            angle={45}
            blindCount={24}
            mirrorGradient
            distortAmount={0.5}
          />,
        );
        await act(async () => {});
      })(),
    ).resolves.not.toThrow();
  });
});

describe("GradientBlinds · reduced-motion 降级路径", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced 时渲染静态兜底层（仍是 absolute inset-0 + aria-hidden，DOM 不消失）", async () => {
    const { container } = render(<GradientBlinds />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    // 静态兜底吃 chart token 渐变
    expect(root.getAttribute("style") ?? "").toContain("var(--color-chart-1)");
  });

  it("reduced 时渲染传入的 fallback 内容", async () => {
    const { queryByTestId } = render(
      <GradientBlinds fallback={<div data-testid="gb-fallback">静态</div>} />,
    );
    await act(async () => {});
    expect(queryByTestId("gb-fallback")).not.toBeNull();
  });
});
