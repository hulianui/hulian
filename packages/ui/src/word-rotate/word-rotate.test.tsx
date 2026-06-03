import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WordRotate } from "./word-rotate";

describe("WordRotate", () => {
  it("初始渲染首词", () => {
    const { container } = render(<WordRotate words={["快", "稳", "美"]} />);
    expect(container.textContent).toContain("快");
  });
  it("外层 overflow-hidden 包裹（裁切进出场位移）", () => {
    const { container } = render(<WordRotate words={["a", "b"]} />);
    expect(container.firstElementChild!.getAttribute("class")).toContain("overflow-hidden");
  });
  it("单词不报错（无 interval 分支）", () => {
    const { container } = render(<WordRotate words={["only"]} />);
    expect(container.textContent).toContain("only");
  });
  it("className 与 props 透传到当前词", () => {
    const { container } = render(<WordRotate words={["x"]} className="text-3xl" data-testid="wr" />);
    expect(container.querySelector('[data-testid="wr"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="wr"]')!.getAttribute("class")).toContain("text-3xl");
  });
});
