import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Ballpit } from "./ballpit";

// ---------------------------------------------------------------------------
// jsdom 环境说明
//
// ① jsdom 无 window.matchMedia → 必须 stub，否则组件内 matchMedia 调用抛。
// ② jsdom 的 <canvas>.getContext("2d") 返回 null → 组件走「静默降级」分支：
//    移除 canvas、不启动 RAF 物理。根容器 div 仍在，不抛错。
// ③ matchMedia.matches=true → reduced=true → 渲染静态小球占位 div（不建 canvas）。
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
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(0), 16) as unknown as number;
    window.cancelAnimationFrame = (id) => clearTimeout(id as unknown as number);
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

describe("Ballpit · 正常路径（canvas 分支，jsdom 下 getContext 为 null 静默降级）", () => {
  it("渲染根容器 div，带 absolute inset-0 z-0 + 装饰属性，不抛错", async () => {
    const { container } = render(<Ballpit />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("followCursor=true 时根容器可接收指针事件（pointer-events-auto）", async () => {
    const { container } = render(<Ballpit followCursor />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "pointer-events-auto",
    );
  });

  it("followCursor=false 时根容器 pointer-events-none（纯背景不挡交互）", async () => {
    const { container } = render(<Ballpit followCursor={false} />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "pointer-events-none",
    );
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Ballpit className="test-ballpit-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-ballpit-class",
    );
  });

  it("自定义 props（count/gravity/bounce/colors/sizeRange）全不抛", async () => {
    await expect(
      act(async () => {
        render(
          <Ballpit
            count={120}
            gravity={400}
            bounce={0.7}
            colors={["#6366f1", "oklch(0.7 0.2 30)"]}
            sizeRange={[8, 20]}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Ballpit />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

describe("Ballpit · reduced-motion 路径（静态占位）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态占位 div（aria-hidden + pointer-events-none），不建 canvas", async () => {
    const { container } = render(<Ballpit />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("z-0");
    // reduced 分支不挂 canvas（占位用 span 小球）
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("自定义 fallback 内容被渲染", async () => {
    const { getByTestId } = render(
      <Ballpit fallback={<span data-testid="bp-fallback">静态球池</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("bp-fallback").textContent).toBe("静态球池");
  });

  it("className 透传到 reduced 占位 div", async () => {
    const { container } = render(<Ballpit className="reduced-bp" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "reduced-bp",
    );
  });
});
