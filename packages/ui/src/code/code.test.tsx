import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Code } from "./code";

describe("Code", () => {
  it("渲染 code 标签 + 内容", () => {
    const { getByText } = render(<Code>npm install</Code>);
    expect(getByText("npm install").tagName).toBe("CODE");
  });

  it("默认皮肤 font-mono + surface-hover 底", () => {
    const { getByText } = render(<Code>x</Code>);
    const el = getByText("x");
    expect(el.className).toContain("font-mono");
    expect(el.className).toContain("bg-surface-hover");
  });

  it("tone=primary 皮肤类", () => {
    const { getByText } = render(<Code tone="primary">x</Code>);
    expect(getByText("x").className).toContain("text-primary");
  });

  it("透传 className", () => {
    const { getByText } = render(<Code className="my-code">x</Code>);
    expect(getByText("x").classList.contains("my-code")).toBe(true);
  });
});
