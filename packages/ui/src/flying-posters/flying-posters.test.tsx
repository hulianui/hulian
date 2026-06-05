import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { FlyingPosters } from "./flying-posters";

// jsdom 说明（同 silk/orb 等 WebGL 件）：
// ① jsdom 无 WebGL → useGlCanvas 的 setup 被 try/catch 静默降级，不抛错。
// ② reduced 用 useState(false) 初始化，由 useEffect 读 matchMedia 更新：
//    matches=false → reduced=false → 渲染 canvas 容器分支；
//    matches=true  → reduced=true  → 渲染静态海报网格 fallback。

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

describe("FlyingPosters · 正常路径（WebGL 分支）", () => {
  it("无 items 时渲染单个根 div，不抛错", async () => {
    const { container } = render(<FlyingPosters />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.tagName).toBe("DIV");
  });

  it("根容器带 aria-hidden + 关键布局类", async () => {
    const { container } = render(<FlyingPosters items={["/a.jpg"]} />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("overflow-hidden");
  });

  it("className 透传到根容器", async () => {
    const { container } = render(
      <FlyingPosters className="test-flying-class" items={["/a.jpg"]} />,
    );
    await act(async () => {});
    expect(container.firstElementChild?.className).toContain("test-flying-class");
  });

  it("style 透传到根容器", async () => {
    const { container } = render(
      <FlyingPosters style={{ opacity: 0.5 }} items={["/a.jpg"]} />,
    );
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.5");
  });
});

describe("FlyingPosters · reduced-motion / 无 WebGL fallback", () => {
  it("渲染静态海报网格（token 边框）且 fallback 内容不消失", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
    const { container, getByText } = render(
      <FlyingPosters
        items={["/a.jpg", "/b.jpg"]}
        fallback={<span>瑚琏海报墙</span>}
      />,
    );
    await act(async () => {});
    expect(getByText("瑚琏海报墙")).not.toBeNull();
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBeGreaterThan(0);
    expect(imgs[0]?.className).toContain("border-border");
  });
});
