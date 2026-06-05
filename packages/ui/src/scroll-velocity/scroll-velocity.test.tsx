import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ScrollVelocity } from "./scroll-velocity";

describe("ScrollVelocity", () => {
  it("按行渲染文本 + 每行复制 numCopies 份", () => {
    const { container } = render(
      <ScrollVelocity texts={["瑚琏组件库"]} numCopies={4} />,
    );
    const section = container.querySelector("section")!;
    expect(section).toBeTruthy();
    // 4 份复制 span
    const spans = section.querySelectorAll("span");
    expect(spans.length).toBe(4);
    expect(spans[0].textContent).toContain("瑚琏组件库");
  });

  it("根 section 走 text-foreground token + 多行各一条 parallax 轨", () => {
    const { container } = render(
      <ScrollVelocity texts={["A", "B"]} numCopies={2} />,
    );
    const section = container.querySelector("section")!;
    expect(section.getAttribute("class")).toContain("text-foreground");
    // 两行 → 两个 overflow-hidden 视差容器
    const rows = section.querySelectorAll(":scope > div");
    expect(rows.length).toBe(2);
    rows.forEach((r) => expect(r.getAttribute("class")).toContain("overflow-hidden"));
  });

  it("className / containerClassName 透传", () => {
    const { container } = render(
      <ScrollVelocity
        texts={["x"]}
        numCopies={1}
        className="text-primary"
        containerClassName="my-section"
      />,
    );
    const section = container.querySelector("section")!;
    expect(section.getAttribute("class")).toContain("my-section");
    const span = section.querySelector("span")!;
    expect(span.getAttribute("class")).toContain("text-primary");
    // 复制 span 保留 flex-shrink-0 防压缩
    expect(span.getAttribute("class")).toContain("flex-shrink-0");
  });

  it("空 texts 渲染空 section（不抛错）", () => {
    const { container } = render(<ScrollVelocity />);
    const section = container.querySelector("section")!;
    expect(section).toBeTruthy();
    expect(section.querySelectorAll("span").length).toBe(0);
  });
});
