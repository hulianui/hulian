import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Galaxy } from "./galaxy";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 silk.test.tsx）
// ① jsdom 无 matchMedia / WebGL → 必须 stub matchMedia；WebGL 在 useGlCanvas 内被
//    try/catch 静默吞掉，canvas 元素挂载但无绘制。
// ② reduced 初值 false，由 useEffect 读 matchMedia 更新：
//    matches=false → 渲染 root div（WebGL 分支）；matches=true → 渲染 fallback div。
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
// 正常路径（reduced=false → 渲染 root div）
// ---------------------------------------------------------------------------
describe("Galaxy · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<Galaxy />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带背景层定位类 absolute inset-0 z-0 h-full w-full", async () => {
    const { container } = render(<Galaxy />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("root div 带 aria-hidden（纯装饰）", async () => {
    const { container } = render(<Galaxy />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("mouseInteraction=true（默认）时 root 接收指针事件 pointer-events-auto", async () => {
    const { container } = render(<Galaxy />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("pointer-events-auto");
  });

  it("mouseInteraction=false 时 root 放行点击穿透 pointer-events-none", async () => {
    const { container } = render(<Galaxy mouseInteraction={false} />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("pointer-events-none");
  });

  it("className prop 透传到 root div", async () => {
    const { container } = render(<Galaxy className="test-galaxy-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("test-galaxy-class");
  });

  it("自定义 props 全量不抛（focal/rotation/density/hueShift/...）", async () => {
    await expect(
      act(async () => {
        render(
          <Galaxy
            focal={[0.3, 0.7]}
            rotation={[0.707, 0.707]}
            starSpeed={1.2}
            density={1.5}
            hueShift={220}
            speed={2}
            glowIntensity={0.6}
            saturation={0.5}
            mouseRepulsion={false}
            repulsionStrength={3}
            twinkleIntensity={0.8}
            rotationSpeed={0.3}
            autoCenterRepulsion={1.5}
            transparent={false}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Galaxy />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → 渲染 fallback div，吃 chart token）
// ---------------------------------------------------------------------------
describe("Galaxy · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas）", async () => {
    const { container } = render(<Galaxy />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector("div")).not.toBeNull();
  });

  it("fallback div 带 chart token 径向渐变 + aria-hidden", async () => {
    const { container } = render(<Galaxy />);
    await act(async () => {});
    const div = container.querySelector("div") as HTMLElement;
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("className + 自定义 fallback 内容渲染", async () => {
    const { container, getByTestId } = render(
      <Galaxy className="reduced-galaxy" fallback={<span data-testid="fb">深空</span>} />,
    );
    await act(async () => {});
    const div = container.querySelector("div") as HTMLElement;
    expect(div.className).toContain("reduced-galaxy");
    expect(getByTestId("fb").textContent).toBe("深空");
  });

  it("reduced 卸载不崩", async () => {
    const { unmount } = render(<Galaxy />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});
