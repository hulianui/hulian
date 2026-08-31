import { describe, expect, it } from "vitest";
import { katexErrorAt } from "./katex-error";

describe("katexErrorAt", () => {
  it.each([
    ["纯文本", "两点之间线段最短。"],
    ["合法公式", "已知 $x^{2}$ 与 $$\\frac{a}{b}$$"],
    ["段内填空槽与 Formula 同一条替换，不误报", "$a=___$"],
    ["数学模式里的中文不报错（strict 已关）", "$x>0 时$"],
  ])("%s：null", (_name, text) => {
    expect(katexErrorAt(text)).toBeNull();
  });

  it("未定义命令：位置指向整串里该命令的起点", () => {
    const text = "已知 $\\foo{x}$";
    const issue = katexErrorAt(text);
    expect(issue).not.toBeNull();
    expect(issue!.index).toBe(text.indexOf("\\foo"));
    expect(issue!.message).toContain("Undefined control sequence");
    expect(issue!.message).not.toContain("at position");
  });

  it("只报第一段的第一个错", () => {
    const issue = katexErrorAt("$\\foo$ 与 $\\bar$");
    expect(issue!.index).toBe(1);
  });

  it("macros 透传：自定义宏不算错，且不改动调用方传入的对象", () => {
    const macros = { "\\RR": "\\mathbb{R}" };
    expect(katexErrorAt("$x \\in \\RR$", { macros })).toBeNull();
    expect(katexErrorAt("$x \\in \\RR$")).not.toBeNull();
    expect(macros).toEqual({ "\\RR": "\\mathbb{R}" });
  });
});
