import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { DarkVeil } from "./dark-veil";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
//
// ① jsdom 无 window.matchMedia → 必须 stub（useGlCanvas 会读取）。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默返回；
//    此时根 div 仍挂载（结构由组件决定），但 canvas 不绘制内容。
// ③ reduced 用 useState(false) 初始化，再由 useEffect 读 matchMedia 更新：
//    matches=false → 渲染 WebGL 容器 div；matches=true → 渲染 fallback div。
// ④ ResizeObserver / IntersectionObserver / rAF 在 jsdom 缺失 → stub 防抛。
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
// 正常路径（matchMedia.matches=false → 渲染 WebGL 容器 div）
// ---------------------------------------------------------------------------

describe("DarkVeil · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，带 absolute inset-0 z-0（背景层）+ pointer-events-none + aria-hidden", async () => {
    const { container } = render(<DarkVeil />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("pointer-events-none");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<DarkVeil className="test-dark-veil-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-dark-veil-class",
    );
  });

  it("默认 props 不抛（jsdom 无 WebGL 被 useGlCanvas 静默降级）", async () => {
    await expect(
      act(async () => {
        render(<DarkVeil />);
      }),
    ).resolves.not.toThrow();
  });

  it("全量自定义 props 不抛", async () => {
    await expect(
      act(async () => {
        render(
          <DarkVeil
            hueShift={120}
            noiseIntensity={0.05}
            scanlineIntensity={0.3}
            speed={1.2}
            scanlineFrequency={2}
            warpAmount={0.1}
            resolutionScale={0.5}
            className="custom"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("speed=0 静止态不崩；卸载不崩", async () => {
    const { unmount } = render(<DarkVeil speed={0} />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（matchMedia.matches=true → 渲染 fallback div）
// ---------------------------------------------------------------------------

describe("DarkVeil · reduced-motion 路径（静态 fallback）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas），带 absolute inset-0 z-0 + aria-hidden + chart token 渐变", async () => {
    const { container } = render(<DarkVeil />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div).not.toBeNull();
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.getAttribute("aria-hidden")).toBe("true");
    // 兜底渐变吃 chart token（明暗自适应，须带 --color- 前缀）
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("className 透传到 fallback div；自定义 fallback 内容被渲染", async () => {
    const { getByTestId, container } = render(
      <DarkVeil
        className="reduced-custom"
        fallback={<span data-testid="fb">静态帷幕</span>}
      />,
    );
    await act(async () => {});
    expect((container.querySelector("div") as HTMLElement).className).toContain(
      "reduced-custom",
    );
    expect(getByTestId("fb").textContent).toBe("静态帷幕");
  });
});
