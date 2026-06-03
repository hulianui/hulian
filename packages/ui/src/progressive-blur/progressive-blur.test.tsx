import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ProgressiveBlur } from "./progressive-blur";

describe("ProgressiveBlur", () => {
  it("按 layers 渲染对应层数", () => {
    const { container } = render(<ProgressiveBlur layers={5} />);
    expect(container.firstElementChild!.children).toHaveLength(5);
  });

  it("逐层 backdrop-filter blur 翻倍", () => {
    const { container } = render(<ProgressiveBlur layers={3} blur={1} />);
    const kids = container.firstElementChild!.children;
    expect((kids[0] as HTMLElement).style.backdropFilter).toBe("blur(1px)");
    expect((kids[1] as HTMLElement).style.backdropFilter).toBe("blur(2px)");
    expect((kids[2] as HTMLElement).style.backdropFilter).toBe("blur(4px)");
  });

  it("side 决定 mask 渐变方向", () => {
    const { container } = render(<ProgressiveBlur side="right" layers={2} />);
    const first = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(first.style.maskImage).toContain("to right");
  });

  it("aria-hidden 不进无障碍树", () => {
    const { container } = render(<ProgressiveBlur />);
    expect(container.firstElementChild!.getAttribute("aria-hidden")).toBe("true");
  });
});
