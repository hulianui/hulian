import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Threads } from "./threads";

// ---------------------------------------------------------------------------
// jsdom 无 WebGL，canvas.getContext("webgl") 返回 null。
// useGlCanvas setup() 内 new Renderer() 会抛错并被 try/catch 静默吞掉（组件逻辑一致）。
// 测试策略：断言 DOM 结构、prop 透传、不抛错即可。
// ---------------------------------------------------------------------------

afterEach(cleanup);

// ---------------------------------------------------------------------------
// matchMedia mock 工具
// ---------------------------------------------------------------------------
function mockMatchMedia(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  return () => {
    window.matchMedia = original;
  };
}

// ---------------------------------------------------------------------------
// 正常渲染（matchMedia.matches = false → reduced=false → 渲染 canvas）
// ---------------------------------------------------------------------------
describe("Threads — 正常渲染（reduced=false）", () => {
  beforeEach(() => {
    // matchMedia 默认 false（不 prefers-reduced-motion）
    mockMatchMedia(false);
  });

  it("渲染根容器 div 元素，不抛错", () => {
    expect(() => render(<Threads />)).not.toThrow();
    const { container } = render(<Threads />);
    expect(container.firstElementChild).not.toBeNull();
  });

  it("root div 带 aria-hidden", () => {
    const { container } = render(<Threads />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("root div 带 absolute inset-0 定位类", () => {
    const { container } = render(<Threads />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
  });

  it("root div 带 z-0 负层级", () => {
    const { container } = render(<Threads />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("z-0");
  });

  it("className 透传到 root div", () => {
    const { container } = render(<Threads className="test-threads-cls" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-threads-cls");
  });

  it("各 prop 默认值不抛错", () => {
    expect(() =>
      render(
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
        />,
      ),
    ).not.toThrow();
  });

  it("color 传数组 [r,g,b] 不抛错", () => {
    expect(() => render(<Threads color={[0.2, 0.5, 0.9]} />)).not.toThrow();
  });

  it("color 传 CSS hex 字符串不抛错", () => {
    expect(() => render(<Threads color="#3b82f6" />)).not.toThrow();
  });

  it("color 传 CSS var(--token) 字符串不抛错", () => {
    expect(() => render(<Threads color="var(--color-chart-2)" />)).not.toThrow();
  });

  it("amplitude=0 不抛错", () => {
    expect(() => render(<Threads amplitude={0} />)).not.toThrow();
  });

  it("amplitude=3 不抛错", () => {
    expect(() => render(<Threads amplitude={3} />)).not.toThrow();
  });

  it("distance=2 不抛错", () => {
    expect(() => render(<Threads distance={2} />)).not.toThrow();
  });

  it("enableMouseInteraction=false 不抛错", () => {
    expect(() => render(<Threads enableMouseInteraction={false} />)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// reduced-motion 降级（matchMedia.matches = true → reduced=true → 渲染 fallback div）
// ---------------------------------------------------------------------------
describe("Threads — reduced-motion 降级", () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockMatchMedia(true);
  });
  afterEach(() => restore());

  it("prefers-reduced-motion 时不抛错", () => {
    expect(() => render(<Threads />)).not.toThrow();
  });

  it("渲染 div 而非 canvas（fallback 分支）", () => {
    const { container } = render(<Threads />);
    // 不应有 canvas
    expect(container.querySelector("canvas")).toBeNull();
    // 应有 div（fallback 容器）
    expect(container.querySelector("div")).not.toBeNull();
  });

  it("默认 fallback 包含 aria-hidden 渐变层", () => {
    const { container } = render(<Threads />);
    const hidden = container.querySelector("[aria-hidden]");
    expect(hidden).not.toBeNull();
  });

  it("传入 fallback=null 时 fallback 容器为空", () => {
    const { container } = render(<Threads fallback={null} />);
    // 最外层 fallback 包装 div 存在，但内部无 aria-hidden
    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });

  it("传入自定义 fallback ReactNode 可正确渲染", () => {
    const { getByText } = render(
      <Threads fallback={<span>静态替代内容</span>} />,
    );
    expect(getByText("静态替代内容")).not.toBeNull();
  });

  it("className 在降级状态也透传到外层 div", () => {
    const { container } = render(<Threads className="reduced-cls" />);
    const root = container.querySelector("div");
    expect(root?.className).toContain("reduced-cls");
  });

  it("降级 div 带 absolute inset-0 z-0 定位类", () => {
    const { container } = render(<Threads />);
    const root = container.querySelector("div")!;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
  });
});
