import { describe, expect, it } from "vitest";

import { hasBareMath, splitBareMath } from "./math.bare";

/** 只取公式段，断言边界划得对不对 —— 这是本模块唯一真正的职责。 */
const maths = (src: string) =>
  splitBareMath(src)
    .filter((s) => s.type === "math")
    .map((s) => s.content);

describe("splitBareMath 边界", () => {
  it("命令连同参数整体成段，中文留在文本里", () => {
    expect(splitBareMath("将 \\frac{3}{8} 化成小数")).toEqual([
      { type: "text", content: "将 " },
      { type: "math", content: "\\frac{3}{8}" },
      { type: "text", content: " 化成小数" },
    ]);
  });

  it("上标触发时向左回溯到式子真正的开头", () => {
    // 只取 x^{2} 会让 y=ax 用正文字体、指数用数学字体，同一式子劈成两种字体
    expect(maths("已知抛物线 y=ax^{2} 经过点 P(2,3)")).toEqual(["y=ax^{2}"]);
  });

  it("不含触发字符的括号表达式一律留作文本", () => {
    // P(2,3) 误排成公式会变斜体，且中文题面里这种括号极多
    expect(maths("经过点 P(2,3) 与 (a+b) 两处")).toEqual([]);
    expect(hasBareMath("经过点 P(2,3)")).toBe(false);
  });

  it("选项标号不被吞进公式", () => {
    expect(splitBareMath("A.\\frac{1}{9}")).toEqual([
      { type: "text", content: "A." },
      { type: "math", content: "\\frac{1}{9}" },
    ]);
  });

  it("命令名后的空格是终止符，后续内容仍属同一段", () => {
    expect(maths("则 \\angle ABC 是直角")).toEqual(["\\angle ABC"]);
  });

  it("上标直接跟命令", () => {
    expect(maths("旋转 30^\\circ 后")).toEqual(["30^\\circ"]);
  });

  it("嵌套与多参数命令整体吃下", () => {
    expect(maths("\\sqrt[3]{\\frac{a^{2}}{b}} 的值")).toEqual(["\\sqrt[3]{\\frac{a^{2}}{b}}"]);
  });

  it("填空槽独立成段，单个下划线仍是下标", () => {
    expect(splitBareMath("可记作____万元")).toEqual([
      { type: "text", content: "可记作" },
      { type: "blank", content: "____" },
      { type: "text", content: "万元" },
    ]);
    expect(maths("首项 a_1 已知")).toEqual(["a_1"]);
  });

  it("公式紧邻填空槽时不把下划线吞进公式", () => {
    expect(splitBareMath("\\frac{3}{8}____")).toEqual([
      { type: "math", content: "\\frac{3}{8}" },
      { type: "blank", content: "____" },
    ]);
  });

  it("未闭合的分组不吞掉后文", () => {
    // 残缺数据必须看得见：`\frac` 单独交给 KaTeX 会红色报错，而漏写的 `{3` 与后文
    // 原样留在文本里 —— 绝不能让一个没闭合的括号把整段题面吃进公式
    expect(splitBareMath("残缺的 \\frac{3 与后文")).toEqual([
      { type: "text", content: "残缺的 " },
      { type: "math", content: "\\frac" },
      { type: "text", content: "{3 与后文" },
    ]);
  });

  it("整串无记号时返回单个文本段", () => {
    expect(splitBareMath("纯中文题干，没有任何记号。")).toEqual([
      { type: "text", content: "纯中文题干，没有任何记号。" },
    ]);
  });

  it("空串不炸", () => {
    expect(splitBareMath("")).toEqual([{ type: "text", content: "" }]);
  });

  it("真实题面：多个公式与填空混排", () => {
    expect(maths("将 \\frac{3}{8} 化成小数为 ____ ,并比较 \\sqrt{2} 与 \\frac{3}{2} 的大小。")).toEqual([
      "\\frac{3}{8}",
      "\\sqrt{2}",
      "\\frac{3}{2}",
    ]);
  });

  it("集合与逻辑记号", () => {
    expect(maths("设 A=\\{x\\mid x>0\\},则 x\\in A")).toEqual(["A=\\{x\\mid x>0\\}", "x\\in A"]);
  });
});
