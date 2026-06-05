import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FuzzyText } from "./fuzzy-text";

// jsdom 下 HTMLCanvasElement.getContext 默认返回 null，init() 会早退，
// 因此这里只验证：根 canvas 渲染、token 类、prop 透传、不因 getContext null 抛错。
describe("FuzzyText", () => {
  it("渲染 canvas 根节点，getContext 为 null 也不抛错", () => {
    const { container } = render(<FuzzyText>瑚琏</FuzzyText>);
    const canvas = container.firstElementChild as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("带 max-w-full token 类，className 合并透传", () => {
    const { container } = render(
      <FuzzyText className="opacity-80">Fuzzy</FuzzyText>,
    );
    const cls = (container.firstElementChild as HTMLElement).getAttribute("class")!;
    expect(cls).toContain("max-w-full");
    expect(cls).toContain("opacity-80");
  });

  it("任意 DOM 属性透传到 canvas（如 data-*、aria-*）", () => {
    const { container } = render(
      <FuzzyText data-testid="ft" aria-label="噪点标题">
        x
      </FuzzyText>,
    );
    const canvas = container.firstElementChild as HTMLElement;
    expect(canvas.getAttribute("data-testid")).toBe("ft");
    expect(canvas.getAttribute("aria-label")).toBe("噪点标题");
  });

  it("style 透传到 canvas 内联样式", () => {
    const { container } = render(
      <FuzzyText style={{ display: "block" }}>x</FuzzyText>,
    );
    expect((container.firstElementChild as HTMLElement).style.display).toBe(
      "block",
    );
  });

  it("不同 direction / color 参数下均能稳定渲染（不抛错）", () => {
    const { container } = render(
      <FuzzyText direction="both" color="var(--color-primary)" fontSize={64}>
        OK
      </FuzzyText>,
    );
    expect(container.firstElementChild?.tagName).toBe("CANVAS");
  });
});
