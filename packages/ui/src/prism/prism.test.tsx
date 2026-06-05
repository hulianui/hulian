import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Prism } from "./prism";

// ---------------------------------------------------------------------------
// jsdom 环境说明（与 Silk 同款）
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 静默捕获，<div> 容器仍挂载。
// ③ matchMedia.matches=false → reduced=false → 渲染 WebGL 容器 div。
//    matchMedia.matches=true  → reduced=true  → 渲染 fallback 渐变 div。
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
// 正常路径（reduced=false → WebGL 容器 div）
// ---------------------------------------------------------------------------
describe("Prism · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，带 absolute inset-0 z-0 / h-full w-full / block", async () => {
    const { container } = render(<Prism />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("block");
  });

  it("根容器带 aria-hidden + pointer-events-none（纯装饰，不挡交互）", async () => {
    const { container } = render(<Prism />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Prism className="test-prism-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-prism-class",
    );
  });

  it("三种 animationType + 自定义 props 渲染均不抛（getContext 返回 null 被兜底）", async () => {
    await expect(
      act(async () => {
        render(
          <>
            <Prism animationType="rotate" glow={1.2} noise={0} />
            <Prism animationType="3drotate" scale={2} timeScale={0} />
            <Prism
              animationType="hover"
              hoverStrength={3}
              inertia={0.1}
              hueShift={1.2}
              offset={{ x: 20, y: -10 }}
            />
          </>,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不抛", async () => {
    const { unmount } = render(<Prism animationType="hover" />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → fallback 渐变 div）
// ---------------------------------------------------------------------------
describe("Prism · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback 渐变 div（无 canvas）·带 chart token 径向渐变", async () => {
    const { container } = render(<Prism />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    const div = container.firstElementChild as HTMLElement;
    expect(div).not.toBeNull();
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
    expect(div.getAttribute("aria-hidden")).toBe("true");
    expect(div.className).toContain("var(--color-chart-1)");
  });

  it("className 透传 + 自定义 fallback 内容被渲染", async () => {
    const { container, getByTestId } = render(
      <Prism
        className="reduced-prism"
        fallback={<span data-testid="fb">静态棱镜</span>}
      />,
    );
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "reduced-prism",
    );
    expect(getByTestId("fb").textContent).toBe("静态棱镜");
  });
});
