import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FallingText } from "./falling-text";

// jsdom 下 getBoundingClientRect 返回 0，物理循环的 width<=0 守卫会提前 return，
// 不触碰任何 canvas/WebGL，仅断言 DOM 结构 / token 类 / props 透传 / 词块拆分。

describe("FallingText", () => {
  it("按空格拆词，每词渲染一个 [data-word] span", () => {
    const { container } = render(<FallingText text="瑚琏 组件 库" />);
    const wordEls = container.querySelectorAll("[data-word]");
    expect(wordEls.length).toBe(3);
    expect(wordEls[0]?.textContent).toBe("瑚琏");
    expect(wordEls[2]?.textContent).toBe("库");
  });

  it("highlightWords 前缀匹配的词带高亮类（默认 text-primary token）", () => {
    const { container } = render(
      <FallingText text="hello token world" highlightWords={["token"]} />,
    );
    const words = Array.from(container.querySelectorAll("[data-word]"));
    const hi = words.find((w) => w.textContent === "token")!;
    const plain = words.find((w) => w.textContent === "hello")!;
    expect(hi.getAttribute("class")).toContain("text-primary");
    expect(plain.getAttribute("class")).not.toContain("text-primary");
  });

  it("自定义 highlightClass 覆盖默认高亮类", () => {
    const { container } = render(
      <FallingText
        text="hi accent"
        highlightWords={["accent"]}
        highlightClass="text-chart-2"
      />,
    );
    const hi = Array.from(container.querySelectorAll("[data-word]")).find(
      (w) => w.textContent === "accent",
    )!;
    expect(hi.getAttribute("class")).toContain("text-chart-2");
    expect(hi.getAttribute("class")).not.toContain("text-primary");
  });

  it("根容器吃 token（text-foreground / overflow-hidden），className + style 透传", () => {
    const { container } = render(
      <FallingText text="x" className="test-falling" style={{ height: 200 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("text-foreground");
    expect(root.getAttribute("class")).toContain("overflow-hidden");
    expect(root.getAttribute("class")).toContain("test-falling");
    expect(root.style.height).toBe("200px");
  });

  it("fontSize 透传到文本层；空文本不渲染词块且不抛错", () => {
    const { container, rerender } = render(<FallingText text="a b" fontSize="2rem" />);
    const textLayer = container.querySelector("[data-falling-text]") as HTMLElement;
    expect(textLayer.style.fontSize).toBe("2rem");

    rerender(<FallingText text="" />);
    expect(container.querySelectorAll("[data-word]").length).toBe(0);
  });
});
// 见 hulianui/hulian#107：解构默认只认 undefined，null 须显式回落。
describe("FallingText · null 回落", () => {
  it("highlightWords 传 null 不抛错", () => {
    const { container } = render(<FallingText text="瑚琏 组件" highlightWords={null as never} />);
    expect(container.querySelectorAll("[data-word]").length).toBe(2);
  });
});
