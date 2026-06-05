import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Container } from "./container";

describe("Container", () => {
  it("默认 xl 宽度 + 居中内距", () => {
    const { container } = render(<Container>x</Container>);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("max-w-5xl");
    expect(cls).toContain("mx-auto");
  });

  it("size 映射最大宽度", () => {
    const { container } = render(<Container size="md">x</Container>);
    expect(container.firstElementChild!.className).toContain("max-w-3xl");
  });

  it("padded=false 去掉居中内距", () => {
    const { container } = render(<Container padded={false}>x</Container>);
    const cls = container.firstElementChild!.className;
    expect(cls).not.toContain("mx-auto");
    expect(cls).not.toContain("px-6");
  });

  it("as 渲染语义标签", () => {
    const { container } = render(<Container as="section">x</Container>);
    expect(container.querySelector("section")).toBeTruthy();
  });
});
