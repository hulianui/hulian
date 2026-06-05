import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { EvilEye } from "./evil-eye";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk/Orb 等 WebGL 件）
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内 matchMedia 抛。
// ② jsdom 无 WebGL → useGlCanvas 的 setup 被 try/catch 静默捕获，<canvas> 已挂载但不绘制。
// ③ reduced 用 useState(false) 初始化，再由 useEffect 读 matchMedia 更新。
//    matchMedia.matches=true → reduced=true → 渲染静态 fallback div。
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
// 正常路径（reduced=false → 渲染 canvas 容器）
// ---------------------------------------------------------------------------
describe("EvilEye · 正常路径（WebGL 分支）", () => {
  it("渲染根容器，带 block h-full w-full + aria-hidden", async () => {
    const { container } = render(<EvilEye />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("block");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到根容器", async () => {
    const { container } = render(<EvilEye className="test-evil-class" />);
    await act(async () => {});
    expect(container.firstElementChild?.className).toContain("test-evil-class");
  });

  it("默认 props 不抛", async () => {
    await expect(
      act(async () => {
        render(<EvilEye />);
      }),
    ).resolves.not.toThrow();
  });

  it("全量自定义 props（含 eyeColor token / oklch）不抛", async () => {
    await expect(
      act(async () => {
        render(
          <EvilEye
            eyeColor="oklch(0.72 0.22 30)"
            backgroundColor="#000000"
            intensity={2}
            pupilSize={0.4}
            irisWidth={0.3}
            glowIntensity={0.5}
            scale={1}
            noiseScale={1.5}
            pupilFollow={0}
            flameSpeed={1.8}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<EvilEye />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 静态 fallback div）
// ---------------------------------------------------------------------------
describe("EvilEye · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态 fallback div（无 canvas），带 chart token 渐变 + aria-hidden", async () => {
    const { container } = render(<EvilEye />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.querySelector("div")!;
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("var(--color-chart-3)");
  });

  it("className 透传到 fallback div + 自定义 fallback 内容渲染", async () => {
    const { getByTestId, container } = render(
      <EvilEye className="reduced-evil" fallback={<span data-testid="fb">静态邪眼</span>} />,
    );
    await act(async () => {});
    expect(container.querySelector("div")!.className).toContain("reduced-evil");
    expect(getByTestId("fb").textContent).toBe("静态邪眼");
  });
});
