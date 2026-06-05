import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SplitText } from "./split-text";

describe("SplitText", () => {
  it("整段挂 aria-label，读屏读完整文本", () => {
    const { container } = render(<SplitText text="瑚琏" />);
    expect(container.firstElementChild!.getAttribute("aria-label")).toBe("瑚琏");
  });
  it("char 模式逐字渲染（各字进 DOM）", () => {
    const { container } = render(<SplitText text="快稳美" />);
    expect(container.textContent).toBe("快稳美");
    // 三个字 → 三个 aria-hidden 段
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(3);
  });
  it("word 模式按空白切，保留空白排版段", () => {
    const { container } = render(<SplitText text="a b" splitType="word" />);
    expect(container.textContent).toBe("a b");
  });
  it("className 透传到外层", () => {
    const { container } = render(<SplitText text="x" className="text-3xl" />);
    expect(container.firstElementChild!.getAttribute("class")).toContain("text-3xl");
  });
});
