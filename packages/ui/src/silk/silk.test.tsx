import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Silk } from "./silk";

// ---------------------------------------------------------------------------
// jsdom 环境说明
//
// ① jsdom 无 window.matchMedia → 必须 stub，否则 useGlCanvas 内 matchMedia 调用抛。
// ② jsdom 无 WebGL context → useGlCanvas 的 setup 被 try/catch 捕获，静默返回。
//    此时 <canvas> 元素已挂载（DOM 由组件决定）但没有绘制内容。
// ③ useGlCanvas 中 reduced 用 useState(false) 初始化，再由 useEffect 读 matchMedia 更新。
//    - matchMedia.matches=false → reduced 保持 false → 渲染 <canvas>
//    - matchMedia.matches=true  → reduced 变 true  → 渲染 fallback div
// ④ ResizeObserver / IntersectionObserver 在 useGlCanvas 内，WebGL 失败则不建，不需要 stub。
//    但 requestAnimationFrame 在 WebGL 失败时也不会被调用，无需特别处理。
// ---------------------------------------------------------------------------

/** 创建符合 MediaQueryList 接口的最小 stub */
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
  // 默认：reduced-motion=false，组件走 WebGL 分支（渲染 <canvas>）
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: makeMatchMedia(false),
  });

  // devicePixelRatio（useGlCanvas 内 Renderer 会读）
  Object.defineProperty(window, "devicePixelRatio", {
    writable: true,
    configurable: true,
    value: 1,
  });

  // requestAnimationFrame stub（WebGL 失败后 RAF 不被调用；但 helper 会 register，确保不抛）
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb) => setTimeout(cb, 16) as unknown as number;
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  }

  // ResizeObserver stub（useGlCanvas WebGL 路径才用；无 WebGL 时不调用，但 jsdom 无此 API 需要保险）
  if (!globalThis.ResizeObserver) {
    class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = MockResizeObserver;
  }

  // IntersectionObserver stub
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
// 正常路径（matchMedia.matches=false → reduced=false → 渲染 canvas）
// ---------------------------------------------------------------------------

describe("Silk · 正常路径（WebGL 分支）", () => {
  it("渲染根容器 div 元素", async () => {
    const { container } = render(<Silk />);
    // useEffect 设置 reduced，需 act flush
    await act(async () => {});
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带 absolute inset-0 z-0 block h-full w-full", async () => {
    const { container } = render(<Silk />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("block");
  });

  it("root div 带 aria-hidden（纯装饰）", async () => {
    const { container } = render(<Silk />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("root div 带 pointer-events-none", async () => {
    const { container } = render(<Silk />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("pointer-events-none");
  });

  it("root div 带 z-0（背景层）", async () => {
    const { container } = render(<Silk />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("z-0");
  });

  it("className prop 透传到 root div", async () => {
    const { container } = render(<Silk className="test-custom-class" />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-custom-class");
  });

  it("不渲染 fallback div（正常分支无 fallback）", async () => {
    const { queryByTestId } = render(
      <Silk fallback={<div data-testid="fallback-inner">静态</div>} />,
    );
    await act(async () => {});
    // fallback 只在 reduced=true 时出现
    expect(queryByTestId("fallback-inner")).toBeNull();
  });

  it("默认 props 不抛（speed/scale/noiseIntensity/rotation 全默认）", async () => {
    await expect(
      act(async () => {
        render(<Silk />);
      }),
    ).resolves.not.toThrow();
  });

  it("所有 props 自定义值不抛", async () => {
    await expect(
      act(async () => {
        render(
          <Silk
            speed={10}
            scale={2}
            color="#6366f1"
            noiseIntensity={3}
            rotation={Math.PI / 6}
            className="custom"
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("speed=0 不崩", async () => {
    await expect(act(async () => { render(<Silk speed={0} />); })).resolves.not.toThrow();
  });

  it("scale=0.1 不崩", async () => {
    await expect(act(async () => { render(<Silk scale={0.1} />); })).resolves.not.toThrow();
  });

  it("noiseIntensity=0 不崩（无颗粒）", async () => {
    await expect(act(async () => { render(<Silk noiseIntensity={0} />); })).resolves.not.toThrow();
  });

  it("color oklch 字符串不崩", async () => {
    await expect(
      act(async () => { render(<Silk color="oklch(0.65 0.22 285)" />); }),
    ).resolves.not.toThrow();
  });

  it("color hex 字符串不崩", async () => {
    await expect(
      act(async () => { render(<Silk color="#7b7481" />); }),
    ).resolves.not.toThrow();
  });

  it("color rgb() 字符串不崩", async () => {
    await expect(
      act(async () => { render(<Silk color="rgb(99, 102, 241)" />); }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Silk />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });

  it("多实例同时渲染，各自独立 root div", async () => {
    const { container } = render(
      <>
        <Silk className="inst-a" />
        <Silk className="inst-b" />
      </>,
    );
    await act(async () => {});
    // helper 将 canvas append 进各自的 root div，root div 本身带 className
    const instA = container.querySelector(".inst-a");
    const instB = container.querySelector(".inst-b");
    expect(instA).not.toBeNull();
    expect(instB).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 路径（matchMedia.matches=true → reduced=true → 渲染 fallback div）
// ---------------------------------------------------------------------------

describe("Silk · reduced-motion 路径（fallback 分支）", () => {
  beforeEach(() => {
    // 覆盖：reduced-motion=true
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染 fallback div（无 canvas）", async () => {
    const { container } = render(<Silk />);
    await act(async () => {});
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector("div")).not.toBeNull();
  });

  it("fallback div 带 absolute inset-0 z-0", async () => {
    const { container } = render(<Silk />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("absolute");
    expect(div.className).toContain("inset-0");
    expect(div.className).toContain("z-0");
  });

  it("fallback div 带 aria-hidden", async () => {
    const { container } = render(<Silk />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.getAttribute("aria-hidden")).toBe("true");
  });

  it("fallback div 带 pointer-events-none", async () => {
    const { container } = render(<Silk />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("pointer-events-none");
  });

  it("className 透传到 fallback div", async () => {
    const { container } = render(<Silk className="reduced-custom" />);
    await act(async () => {});
    const div = container.querySelector("div")!;
    expect(div.className).toContain("reduced-custom");
  });

  it("自定义 fallback 内容被渲染", async () => {
    const { getByTestId } = render(
      <Silk fallback={<span data-testid="custom-fallback">静态背景</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("custom-fallback")).not.toBeNull();
    expect(getByTestId("custom-fallback").textContent).toBe("静态背景");
  });

  it("reduced 路径不崩（不建 WebGL）", async () => {
    await expect(
      act(async () => {
        render(<Silk speed={5} scale={1.5} color="#abc" />);
      }),
    ).resolves.not.toThrow();
  });

  it("reduced 卸载不崩", async () => {
    const { unmount } = render(<Silk />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// rerender 路径（props 变化时 WebGL deps 更新，组件不崩）
// ---------------------------------------------------------------------------

describe("Silk · rerender props 变化", () => {
  it("speed 变化后 rerender 不崩", async () => {
    const { rerender } = render(<Silk speed={5} />);
    await act(async () => {});
    await expect(
      act(async () => {
        rerender(<Silk speed={10} />);
      }),
    ).resolves.not.toThrow();
  });

  it("color 动态切换不崩", async () => {
    const { rerender } = render(<Silk color="#6366f1" />);
    await act(async () => {});
    await expect(
      act(async () => {
        rerender(<Silk color="oklch(0.7 0.25 30)" />);
      }),
    ).resolves.not.toThrow();
  });
});
