import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ScrambledText } from "./scrambled-text";

describe("ScrambledText", () => {
  it("逐字拆成 span + token 类（font-mono / text-foreground）", () => {
    const { container } = render(<ScrambledText>Hi</ScrambledText>);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("font-mono");
    expect(root.getAttribute("class")).toContain("text-foreground");
    // "Hi" → 2 个字符 span
    expect(container.querySelectorAll("span").length).toBe(2);
  });

  it("可访问文本保留在 aria-label（span 标 aria-hidden）", () => {
    const { container } = render(<ScrambledText>Scramble</ScrambledText>);
    const p = container.querySelector("p")!;
    expect(p.getAttribute("aria-label")).toBe("Scramble");
    expect(container.querySelector("span")!.getAttribute("aria-hidden")).not.toBeNull();
  });

  it("className / props 透传到根元素", () => {
    const { container } = render(
      <ScrambledText className="text-sm" data-testid="st">
        x
      </ScrambledText>,
    );
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("text-sm");
    expect(root.getAttribute("data-testid")).toBe("st");
  });

  it("pointerMove 不抛错（jsdom 无真实布局，getBoundingClientRect 全 0）", () => {
    const { container } = render(<ScrambledText>abc</ScrambledText>);
    const root = container.firstElementChild! as HTMLElement;
    expect(() =>
      fireEvent.pointerMove(root, { clientX: 0, clientY: 0 }),
    ).not.toThrow();
  });
});
