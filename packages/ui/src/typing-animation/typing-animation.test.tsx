import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, act } from "@testing-library/react";
import { TypingAnimation } from "./typing-animation";

// jsdom 无 IntersectionObserver → 打永不触发桩（同 NumberTicker），useInView 恒 false 不崩
beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error test stub
  globalThis.IntersectionObserver = IO;
});

describe("TypingAnimation", () => {
  it("startOnView=false + 计时推进后打出全文", () => {
    vi.useFakeTimers();
    const { container } = render(<TypingAnimation text="瑚琏" duration={50} startOnView={false} />);
    act(() => {
      vi.advanceTimersByTime(50 * 5);
    });
    expect(container.textContent).toContain("瑚琏");
    vi.useRealTimers();
  });
  it("startOnView 默认（jsdom 不进视口）初始不打字", () => {
    const { container } = render(<TypingAnimation text="hello" />);
    // 未进视口 → 仅光标，无正文字符
    expect(container.textContent).not.toContain("hello");
  });
  it("showCursor=false 不渲染光标", () => {
    const { container } = render(<TypingAnimation text="x" showCursor={false} startOnView={false} />);
    expect(container.textContent).not.toContain("|");
  });
  it("className 与 props 透传", () => {
    const { container } = render(<TypingAnimation text="x" className="font-mono" data-testid="ta" />);
    const span = container.firstElementChild!;
    expect(span.getAttribute("class")).toContain("font-mono");
    expect(span.getAttribute("data-testid")).toBe("ta");
  });
});
