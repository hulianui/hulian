import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SparklesText } from "./sparkles-text";

describe("SparklesText", () => {
  it("渲染 children 文本（z-20 真文本层）", () => {
    const { container } = render(<SparklesText>瑚琏</SparklesText>);
    expect(container.textContent).toContain("瑚琏");
  });
  it("useEffect 后生成星 SVG（默认 8 颗）", () => {
    const { container } = render(<SparklesText sparklesCount={6}>x</SparklesText>);
    // useEffect 同步跑完 → 星 svg 出现
    expect(container.querySelectorAll("svg").length).toBe(6);
  });
  it("relative inline-block 容器 + className/props 透传", () => {
    const { container } = render(<SparklesText className="text-4xl" data-testid="sp">x</SparklesText>);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("relative");
    expect(root.getAttribute("class")).toContain("text-4xl");
    expect(root.getAttribute("data-testid")).toBe("sp");
  });
});
