import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AuroraText } from "./aurora-text";

describe("AuroraText", () => {
  it("渲染 sr-only 真文本（AT 可读）+ aria-hidden 渐变层", () => {
    const { container } = render(<AuroraText>瑚琏</AuroraText>);
    const sr = container.querySelector(".sr-only");
    expect(sr?.textContent).toBe("瑚琏");
    const visual = container.querySelector('[aria-hidden="true"]');
    expect(visual?.textContent).toBe("瑚琏");
  });
  it("渐变层 bg-clip-text + 透明文字 + aurora 动画类", () => {
    const { container } = render(<AuroraText>x</AuroraText>);
    const visual = container.querySelector('[aria-hidden="true"]')!;
    expect(visual.getAttribute("class")).toContain("bg-clip-text");
    expect(visual.getAttribute("class")).toContain("text-transparent");
    expect(visual.getAttribute("class")).toContain("[animation:hulian-aurora");
  });
  it("默认色用 chart token 拼 linear-gradient", () => {
    const { container } = render(<AuroraText>x</AuroraText>);
    const visual = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(visual.style.backgroundImage).toContain("var(--color-primary)");
    expect(visual.style.backgroundImage).toContain("linear-gradient");
  });
  it("speed 换算成 duration CSS 变量（10/speed s）", () => {
    const { container } = render(<AuroraText speed={2}>x</AuroraText>);
    const visual = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(visual.style.getPropertyValue("--hulian-aurora-duration")).toBe("5s");
  });
  it("motion-reduce 停 + className/props 透传", () => {
    const { container } = render(<AuroraText className="text-4xl" data-testid="at">x</AuroraText>);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("text-4xl");
    expect(root.getAttribute("data-testid")).toBe("at");
    expect(container.querySelector('[aria-hidden="true"]')!.getAttribute("class")).toContain("motion-reduce:[animation:none]");
  });
});
