import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LiquidChrome } from "./liquid-chrome";

afterEach(cleanup);

// jsdom 无 WebGL context，useGlCanvas 的 setup 中 import("ogl") 在测试环境不会完成
// （async，Effect 立即 mount/unmount 时不会真正运行 GL 路径）。
// 所有测试只断言 DOM 结构、prop 透传、不抛错。

// ---------------------------------------------------------------------------
// matchMedia helper
// ---------------------------------------------------------------------------
function mockMatchMedia(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  return () => {
    window.matchMedia = original;
  };
}

// ---------------------------------------------------------------------------
// canvas 渲染路径（reduced = false）
// ---------------------------------------------------------------------------
describe("LiquidChrome — canvas 渲染路径", () => {
  it("默认渲染 canvas 元素，不抛错", () => {
    const restore = mockMatchMedia(false);
    expect(() => render(<LiquidChrome />)).not.toThrow();
    restore();
  });

  it("root div 带 aria-hidden", () => {
    const restore = mockMatchMedia(false);
    const { container } = render(<LiquidChrome />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("aria-hidden")).toBe("true");
    restore();
  });

  it("root div 携带 absolute inset-0 定位类（背景层语义）", () => {
    const restore = mockMatchMedia(false);
    const { container } = render(<LiquidChrome />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    restore();
  });

  it("root div 携带 z-0（沉入父层叠栈底）", () => {
    const restore = mockMatchMedia(false);
    const { container } = render(<LiquidChrome />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("z-0");
    restore();
  });

  it("className 透传到 root div", () => {
    const restore = mockMatchMedia(false);
    const { container } = render(<LiquidChrome className="test-extra-cls" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-extra-cls");
    restore();
  });

  it("baseColor 数组 prop 不抛错", () => {
    const restore = mockMatchMedia(false);
    expect(() =>
      render(<LiquidChrome baseColor={[0.1, 0.2, 0.9]} />),
    ).not.toThrow();
    restore();
  });

  it("baseColor CSS 字符串 prop 不抛错", () => {
    const restore = mockMatchMedia(false);
    expect(() =>
      render(<LiquidChrome baseColor="#3b82f6" />),
    ).not.toThrow();
    restore();
  });

  it("speed/amplitude/frequencyX/frequencyY 自定义值不抛错", () => {
    const restore = mockMatchMedia(false);
    expect(() =>
      render(
        <LiquidChrome
          speed={0.5}
          amplitude={0.8}
          frequencyX={4}
          frequencyY={3}
        />,
      ),
    ).not.toThrow();
    restore();
  });

  it("interactive=false 不抛错", () => {
    const restore = mockMatchMedia(false);
    expect(() => render(<LiquidChrome interactive={false} />)).not.toThrow();
    restore();
  });

  it("fallback prop 在 canvas 路径下不出现在 DOM 中", () => {
    const restore = mockMatchMedia(false);
    const { queryByText } = render(
      <LiquidChrome fallback={<span>fallback-content</span>} />,
    );
    // canvas 路径下 fallback 不渲染
    expect(queryByText("fallback-content")).toBeNull();
    restore();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion fallback 路径（reduced = true）
// ---------------------------------------------------------------------------
describe("LiquidChrome — reduced-motion fallback 路径", () => {
  it("prefers-reduced-motion: reduce → 渲染 div 而非 canvas", () => {
    const restore = mockMatchMedia(true);
    const { container } = render(<LiquidChrome />);
    // 应无 canvas
    expect(container.querySelector("canvas")).toBeNull();
    // 应有 div（fallback 容器）
    expect(container.querySelector("div")).not.toBeNull();
    restore();
  });

  it("reduced 路径下 fallback div 带 aria-hidden", () => {
    const restore = mockMatchMedia(true);
    const { container } = render(<LiquidChrome />);
    // 找到含 aria-hidden 的 div（可能是嵌套）
    const ariaHiddenEl = container.querySelector("[aria-hidden='true']");
    expect(ariaHiddenEl).not.toBeNull();
    restore();
  });

  it("reduced 路径下 fallback 包含静态渐变 bg class", () => {
    const restore = mockMatchMedia(true);
    const { container } = render(<LiquidChrome />);
    // Tailwind 任意值 class 含括号，用 className 字符串判断（querySelector 属性选择器有括号 quoting 限制）
    const allDivs = Array.from(container.querySelectorAll("div"));
    const withGradient = allDivs.find((el) =>
      el.className.includes("bg-[linear-gradient"),
    );
    expect(withGradient).not.toBeUndefined();
    restore();
  });

  it("fallback children 在 reduced 路径下渲染", () => {
    const restore = mockMatchMedia(true);
    const { getByText } = render(
      <LiquidChrome fallback={<span>静态占位内容</span>} />,
    );
    expect(getByText("静态占位内容")).toBeTruthy();
    restore();
  });

  it("className 透传到 reduced fallback div", () => {
    const restore = mockMatchMedia(true);
    const { container } = render(<LiquidChrome className="reduced-extra" />);
    // className 应在某个 div 上
    const el = container.querySelector(".reduced-extra");
    expect(el).not.toBeNull();
    restore();
  });

  it("reduced 路径不抛错（baseColor 各种形式）", () => {
    const restore = mockMatchMedia(true);
    expect(() => render(<LiquidChrome baseColor={[0.5, 0.3, 0.8]} />)).not.toThrow();
    expect(() => render(<LiquidChrome baseColor="oklch(0.7 0.2 240)" />)).not.toThrow();
    expect(() => render(<LiquidChrome baseColor="var(--color-chart-1)" />)).not.toThrow();
    restore();
  });
});

// ---------------------------------------------------------------------------
// 卸载无泄漏（无报错）
// ---------------------------------------------------------------------------
describe("LiquidChrome — 卸载/重渲染", () => {
  it("mount → unmount 不抛错（canvas 路径）", () => {
    const restore = mockMatchMedia(false);
    const { unmount } = render(<LiquidChrome />);
    expect(() => unmount()).not.toThrow();
    restore();
  });

  it("mount → unmount 不抛错（reduced 路径）", () => {
    const restore = mockMatchMedia(true);
    const { unmount } = render(<LiquidChrome />);
    expect(() => unmount()).not.toThrow();
    restore();
  });

  it("多实例同时渲染不互相干扰", () => {
    const restore = mockMatchMedia(false);
    expect(() =>
      render(
        <>
          <LiquidChrome speed={0.1} />
          <LiquidChrome speed={0.3} baseColor={[0.2, 0.1, 0.5]} />
        </>,
      ),
    ).not.toThrow();
    restore();
  });
});
