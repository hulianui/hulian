import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThinkingBlock } from "./thinking-block";

describe("ThinkingBlock", () => {
  it("默认标题「思考过程」", () => {
    const { getByText } = render(<ThinkingBlock>推理内容</ThinkingBlock>);
    expect(getByText("思考过程")).toBeTruthy();
  });
  it("thinking 时渲转圈 spinner（animate-spin）", () => {
    const { container } = render(<ThinkingBlock thinking>x</ThinkingBlock>);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });
  it("非 thinking 不渲 spinner", () => {
    const { container } = render(<ThinkingBlock>x</ThinkingBlock>);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
