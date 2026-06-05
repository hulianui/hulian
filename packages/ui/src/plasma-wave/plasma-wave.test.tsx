import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PlasmaWave } from "./plasma-wave";

// jsdom 无 WebGL：useGlCanvas 懒载 ogl 后构造 Renderer 时 getContext 返回 null，
// setup 抛错被 helper 静默吞掉，组件不崩。须 stub matchMedia / observers / RAF / dpr。

function makeMatchMedia(reducedMotion: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion ? query.includes("prefers-reduced-motion") : false,
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

  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
    } as unknown as typeof IntersectionObserver;
  }

  globalThis.requestAnimationFrame = vi.fn().mockReturnValue(1);
  globalThis.cancelAnimationFrame = vi.fn();

  if (Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio")?.configurable !== false) {
    Object.defineProperty(globalThis, "devicePixelRatio", {
      value: 1,
      configurable: true,
      writable: true,
    });
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ────────────────────────────────────────────────────────────────
// 正常渲染路径（matchMedia.matches=false → canvas 容器）
// ────────────────────────────────────────────────────────────────
describe("PlasmaWave 正常渲染路径", () => {
  it("渲染根容器 div，不抛错", () => {
    expect(() => render(<PlasmaWave />)).not.toThrow();
    const { container } = render(<PlasmaWave />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带 block h-full w-full token 类", () => {
    const { container } = render(<PlasmaWave />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("block");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("root div 带 aria-hidden（装饰语义）", () => {
    const { container } = render(<PlasmaWave />);
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("className prop 透传到 root div", () => {
    const { container } = render(<PlasmaWave className="absolute inset-0 opacity-80" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("opacity-80");
  });

  it("全量 prop 透传（含极值）不抛", () => {
    expect(() =>
      render(
        <PlasmaWave
          colors={["oklch(0.7 0.2 30)", "oklch(0.6 0.18 200)"]}
          xOffset={40}
          yOffset={-20}
          rotationDeg={45}
          focalLength={1.4}
          speed1={0.2}
          speed2={0.1}
          dir2={-1}
          bend1={2}
          bend2={1}
        />,
      ),
    ).not.toThrow();
  });

  it("卸载不抛（dispose + context release）", () => {
    const { unmount } = render(<PlasmaWave />);
    expect(() => unmount()).not.toThrow();
  });

  it("多实例并排渲染各自一个 root div", () => {
    const { container } = render(
      <>
        <PlasmaWave />
        <PlasmaWave rotationDeg={90} />
      </>,
    );
    expect(container.children.length).toBe(2);
  });
});

// ────────────────────────────────────────────────────────────────
// reduced-motion 路径（matchMedia.matches=true → 静态渐变 fallback）
// ────────────────────────────────────────────────────────────────
describe("PlasmaWave reduced-motion fallback", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("reduced-motion 路径渲染不抛", () => {
    expect(() => render(<PlasmaWave />)).not.toThrow();
  });

  it("fallback slot 自定义内容不导致崩溃", () => {
    expect(() =>
      render(<PlasmaWave fallback={<span data-testid="fb">paused</span>} />),
    ).not.toThrow();
  });

  it("className 透传不抛（fallback 与 canvas 路径同名 root）", () => {
    expect(() => render(<PlasmaWave className="rounded-xl" />)).not.toThrow();
  });
});
