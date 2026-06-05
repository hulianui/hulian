import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { GridDistortion } from "./grid-distortion";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk 套路）
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 读 matchMedia 抛。
// ② jsdom 无 WebGL → useGlCanvas setup 被 try/catch 静默降级；<canvas> 不会绘制但根容器仍渲染。
// ③ reduced 由 useEffect 读 matchMedia 决定：false→渲染 WebGL 容器；true→渲染 fallback 网格 div。
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
// 正常路径（reduced=false → 渲染 WebGL 根容器）
// ---------------------------------------------------------------------------
describe("GridDistortion · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<GridDistortion />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根容器带 absolute inset-0 z-0 + h-full w-full block 定位类", async () => {
    const { container } = render(<GridDistortion />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("根容器带 aria-hidden（纯装饰）", async () => {
    const { container } = render(<GridDistortion />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到根容器", async () => {
    const { container } = render(<GridDistortion className="test-grid-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("test-grid-class");
  });

  it("自定义 props（grid/mouse/strength/relaxation/color/imageSrc）不抛", async () => {
    await expect(
      act(async () => {
        render(
          <GridDistortion
            grid={20}
            mouse={0.2}
            strength={0.3}
            relaxation={0.85}
            color="oklch(0.7 0.2 250)"
            imageSrc="/local.png"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<GridDistortion />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染静态网格 fallback）
// ---------------------------------------------------------------------------
describe("GridDistortion · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态网格 div（无 canvas），带 aria-hidden + 网格底纹类", async () => {
    const { container } = render(<GridDistortion />);
    await act(async () => {});
    const div = container.firstElementChild as HTMLElement;
    expect(container.querySelector("canvas")).toBeNull();
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("[background-image:linear-gradient");
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("className 透传到 fallback div，且仍带 absolute inset-0 z-0", async () => {
    const { container } = render(<GridDistortion className="reduced-grid" />);
    await act(async () => {});
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("reduced-grid");
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
  });

  it("自定义 fallback 内容被渲染", async () => {
    const { getByTestId } = render(
      <GridDistortion fallback={<span data-testid="gd-fb">静态网格</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("gd-fb").textContent).toBe("静态网格");
  });
});
