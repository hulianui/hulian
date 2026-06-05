import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act, fireEvent } from "@testing-library/react";
import { Balatro } from "./balatro";

// ---------------------------------------------------------------------------
// jsdom 环境说明（同 Silk）
// ① jsdom 无 matchMedia → 必须 stub，否则 useGlCanvas 内调用抛。
// ② jsdom 无 WebGL → useGlCanvas 的 setup 被 try/catch 静默捕获，仅留下挂载的 canvas/容器。
// ③ reduced 用 useState(false) 初始化，再由 effect 读 matchMedia 更新：
//    matches=false → 渲染交互容器 div；matches=true → 渲染 conic-gradient fallback div。
// ④ getContext("2d") 在 jsdom 返回 null → cssColorToVec4 走兜底，不抛（且 WebGL 已先静默失败）。
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
// 正常路径（reduced=false → 交互容器分支）
// ---------------------------------------------------------------------------
describe("Balatro · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div，不抛错", async () => {
    const { container } = render(<Balatro />);
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("根容器带 absolute inset-0 z-0 block h-full w-full 关键 token 类", async () => {
    const { container } = render(<Balatro />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("根容器带 aria-hidden（纯装饰）", async () => {
    const { container } = render(<Balatro />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("mouseInteraction 默认 true：根容器不带 pointer-events-none（接收指针事件）", async () => {
    const { container } = render(<Balatro />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).not.toContain("pointer-events-none");
  });

  it("mouseInteraction=false：根容器带 pointer-events-none", async () => {
    const { container } = render(<Balatro mouseInteraction={false} />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("pointer-events-none");
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Balatro className="test-balatro-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain("test-balatro-class");
  });

  it("pointermove 不抛（鼠标交互写 ref）", async () => {
    const { container } = render(<Balatro />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(() => fireEvent.pointerMove(root, { clientX: 10, clientY: 10 })).not.toThrow();
  });

  it("默认 props + 全自定义 props 均不抛", async () => {
    await expect(
      act(async () => {
        render(<Balatro />);
        render(
          <Balatro
            spinRotation={-1}
            spinSpeed={4}
            offset={[0.1, -0.05]}
            color1="#DE443B"
            color2="oklch(0.6 0.18 250)"
            color3="rgb(22, 35, 37)"
            contrast={4}
            lighting={0.6}
            spinAmount={0.4}
            pixelFilter={500}
            spinEase={1.2}
            isRotate
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Balatro />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（reduced=true → conic-gradient fallback）
// ---------------------------------------------------------------------------
describe("Balatro · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas）", async () => {
    const { container } = render(<Balatro />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector("div")).not.toBeNull();
  });

  it("fallback 带 conic-gradient + chart token + pointer-events-none + aria-hidden", async () => {
    const { container } = render(<Balatro />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("conic-gradient");
    expect(div.className).toContain("var(--color-chart-1)");
    expect(div.className).toContain("pointer-events-none");
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 透传到 fallback；自定义 fallback 内容被渲染", async () => {
    const { getByTestId, container } = render(
      <Balatro className="reduced-custom" fallback={<span data-testid="fb">静态</span>} />,
    );
    await act(async () => {});
    expect(container.querySelector("div")!.className).toContain("reduced-custom");
    expect(getByTestId("fb").textContent).toBe("静态");
  });
});
