import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { DecryptedText } from "./decrypted-text";

// jsdom 无 IntersectionObserver → 打永不触发桩（同 TypingAnimation / NumberTicker），
// useInView 恒 false 不崩；组件落静息乱码态（scramble(0)），可见字符数仍等于明文码点数。
beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error test stub
  globalThis.IntersectionObserver = IO;
});

describe("DecryptedText", () => {
  it("整段挂 aria-label 明文（读屏读明文，乱码 aria-hidden）", () => {
    const { container } = render(<DecryptedText text="SECRET" />);
    expect(container.firstElementChild!.getAttribute("aria-label")).toBe("SECRET");
    expect(container.querySelector("[aria-hidden]")).not.toBeNull();
  });
  it("可见文本长度恒等于明文码点数（乱码不改变排版宽度）", () => {
    const { container } = render(<DecryptedText text="abcde" />);
    expect(Array.from(container.textContent ?? "").length).toBe(5);
  });
  it("等宽 + tabular-nums 防解码时字宽抖动", () => {
    const { container } = render(<DecryptedText text="x" />);
    const cls = container.firstElementChild!.getAttribute("class") ?? "";
    expect(cls).toContain("font-mono");
    expect(cls).toContain("tabular-nums");
  });
  it("className 透传外层", () => {
    const { container } = render(<DecryptedText text="x" className="text-2xl" />);
    expect(container.firstElementChild!.getAttribute("class")).toContain("text-2xl");
  });
});
