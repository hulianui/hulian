import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { Shuffle } from "./shuffle";

// jsdom 下 rAF 存在但帧时序不真实；不依赖动画推进，只断言：
// 根渲染 + token 类 + aria 保真 + prop 透传 + reduced-motion 直落终态。
describe("Shuffle", () => {
  beforeEach(() => {
    // 默认非 reduced-motion
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });
  afterEach(() => vi.restoreAllMocks());

  it("渲染根标签 + 终态文本走 aria-label（乱码态对读屏保真）", () => {
    const { container } = render(
      <Shuffle text="HULIAN" triggerOnView={false} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.tagName).toBe("P"); // 默认 tag=p
    expect(root.getAttribute("aria-label")).toBe("HULIAN");
  });

  it("带 token 类：font-mono + text-foreground，可视字符在 aria-hidden span 内", () => {
    const { container } = render(
      <Shuffle text="x" triggerOnView={false} />,
    );
    const root = container.firstElementChild as HTMLElement;
    const cls = root.getAttribute("class")!;
    expect(cls).toContain("font-mono");
    expect(cls).toContain("text-foreground");
    const visible = root.querySelector("[aria-hidden]");
    expect(visible).not.toBeNull();
  });

  it("tag / className / textAlign prop 透传", () => {
    const { container } = render(
      <Shuffle
        text="Hi"
        tag="h2"
        className="test-shuffle-class"
        textAlign="left"
        triggerOnView={false}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("H2");
    expect(root.getAttribute("class")).toContain("test-shuffle-class");
    expect(root.style.textAlign).toBe("left");
  });

  it("reduced-motion：直接落终态文本并触发 onShuffleComplete", async () => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: true, // prefers-reduced-motion: reduce
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const onDone = vi.fn();
    const { container } = render(
      <Shuffle
        text="DECRYPT"
        triggerOnView={false}
        onShuffleComplete={onDone}
      />,
    );
    const visible = container.querySelector("[aria-hidden]") as HTMLElement;
    // 终态文本立即可见（DOM 字符与动画终态一致）
    expect(visible.textContent).toBe("DECRYPT");
    expect(onDone).toHaveBeenCalled();
  });

  it("triggerOnView=true 且未进入视口时不抛错（useInView 默认 false）", () => {
    expect(() =>
      render(<Shuffle text="LAZY" triggerOnView />),
    ).not.toThrow();
  });
});
