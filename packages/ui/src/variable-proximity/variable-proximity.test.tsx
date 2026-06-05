import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VariableProximity } from "./variable-proximity";

const FROM = "'wght' 400, 'opsz' 9";
const TO = "'wght' 900, 'opsz' 40";

describe("VariableProximity", () => {
  it("逐字拆分 + sr-only 完整副本朗读", () => {
    const { container } = render(
      <VariableProximity label="Hi all" fromFontVariationSettings={FROM} toFontVariationSettings={TO} />,
    );
    const root = container.firstElementChild!;
    // 根容器走 inline + foreground token
    expect(root.getAttribute("class")).toContain("text-foreground");
    expect(root.getAttribute("class")).toContain("inline");
    // sr-only 副本含完整文本
    const sr = container.querySelector(".sr-only");
    expect(sr?.textContent).toBe("Hi all");
  });

  it("每个字形 aria-hidden 且初始定格在 from 设置", () => {
    const { container } = render(
      <VariableProximity label="ab" fromFontVariationSettings={FROM} toFontVariationSettings={TO} />,
    );
    const letters = container.querySelectorAll('span[aria-hidden="true"]');
    // a、b 两个字形（不含词间空隙，这里单词内无空格）
    const glyphs = Array.from(letters).filter((el) => /^[ab]$/.test(el.textContent ?? ""));
    expect(glyphs).toHaveLength(2);
    glyphs.forEach((el) => {
      expect((el as HTMLElement).style.fontVariationSettings).toBe(FROM);
    });
  });

  it("className / style 透传到根 span", () => {
    const { container } = render(
      <VariableProximity
        label="x"
        fromFontVariationSettings={FROM}
        toFontVariationSettings={TO}
        className="text-2xl"
        style={{ letterSpacing: "2px" }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("text-2xl");
    expect(root.style.letterSpacing).toBe("2px");
  });

  it("多词时词间补不可断空隙且不抛错（jsdom 无真实布局）", () => {
    const { container } = render(
      <VariableProximity label="one two" fromFontVariationSettings={FROM} toFontVariationSettings={TO} />,
    );
    // 词容器 inline-block whitespace-nowrap
    const wordSpan = container.querySelector("span > span.inline-block.whitespace-nowrap");
    expect(wordSpan).toBeTruthy();
    expect(container.querySelector(".sr-only")?.textContent).toBe("one two");
  });
});
