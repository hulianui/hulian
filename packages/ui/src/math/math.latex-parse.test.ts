// 解析器的测试。**渲染不在这里** —— 排版由 KaTeX/Formula 负责（见 math.test.tsx）。
// 这一层现在只服务两件事：mathToPlain 的检索降级，和 splitMathSegments 的分隔符切段。
// MathText 在 0.25.0 退役时这批用例特意从它的测试文件里留了下来 ——
// 组件没了但解析器还活着，覆盖不该跟着组件一起丢。
import { describe, expect, it } from "vitest";

import { mathToPlain, parseMath, splitMathSegments } from "./math.latex-parse";

describe("parseMath", () => {
  it("解析分数", () => {
    expect(parseMath("\\frac{3}{8}")).toEqual([
      { kind: "frac", num: [{ kind: "text", text: "3" }], den: [{ kind: "text", text: "8" }] },
    ]);
  });

  it("分数可嵌套在正文中间", () => {
    const nodes = parseMath("将\\frac{3}{8}化成小数");
    expect(nodes.map((n) => n.kind)).toEqual(["text", "frac", "text"]);
  });

  it("上标支持 {} 组与紧跟单字符两种写法", () => {
    expect(parseMath("x^{2}")).toEqual(parseMath("x^2"));
  });

  it("连续下划线是填空槽，单下划线是下标", () => {
    expect(parseMath("____")).toEqual([{ kind: "blank", length: 4 }]);
    expect(parseMath("a_1")).toEqual([
      { kind: "text", text: "a" },
      { kind: "sub", children: [{ kind: "text", text: "1" }] },
    ]);
  });

  it("根号可带根指数", () => {
    const [node] = parseMath("\\sqrt[3]{8}");
    expect(node.kind).toBe("sqrt");
  });

  it("不认识的反斜杠记号按字面保留，不吞内容", () => {
    expect(mathToPlain("\\oiint+1")).toBe("\\oiint+1");
  });

  it("残缺的 \\frac 不会让整段消失", () => {
    expect(mathToPlain("\\frac{3}")).toBe("\\frac{3}");
  });
});

describe("mathToPlain", () => {
  it("还原成可检索的朴素文本", () => {
    expect(mathToPlain("将\\frac{3}{8}化成小数,x^{2}+a_1=____")).toBe("将3/8化成小数,x^2+a_1=____");
  });
});

describe("LaTeX 符号表（按真实语料频次建表）", () => {
  it("高频几何/运算符号换成 Unicode", () => {
    expect(mathToPlain("\\angle ABC=60^{\\circ}")).toBe("∠ABC=60°");
    expect(mathToPlain("\\triangle ABC\\cong\\triangle DEF")).toBe("△ABC≌△DEF");
    expect(mathToPlain("a\\times b\\div c\\pm d")).toBe("a×b÷c±d");
    expect(mathToPlain("AB\\parallel CD,EF\\perp GH")).toBe("AB∥CD,EF⊥GH");
    expect(mathToPlain("x\\neq 0,y\\leqslant 3,z\\geq 1")).toBe("x≠0,y≤3,z≥1");
  });

  it("度数不套 sup —— \\circ 本身就在上标位，再抬一次会浮空", () => {
    const nodes = parseMath("60^{\\circ}");
    expect(nodes).toEqual([
      { kind: "text", text: "60" },
      { kind: "text", text: "°" },
    ]);
  });

  it("\\text / \\mathrm 只是字体包装，剥掉外壳保留内容", () => {
    expect(mathToPlain("\\text{甲组}+\\mathrm{cm}")).toBe("甲组+cm");
  });

  it("\\left \\right 只调定界符大小，不该出现在文本里", () => {
    expect(mathToPlain("\\left(a+b\\right)")).toBe("(a+b)");
  });

  it("\\overline / \\widehat 保留内容并加装饰线", () => {
    const [node] = parseMath("\\overline{AB}");
    expect(node.kind).toBe("decorate");
    expect(mathToPlain("\\overline{AB}")).toBe("AB");
  });

  it("矩阵/方程组环境降级成一行，不把 \\begin{array} 吐给用户", () => {
    expect(mathToPlain("\\begin{array}{l}x=1\\\\y=2\\end{array}")).toBe("x=1；y=2");
  });

  it("根号里的完整表达式（八下二次根式实测形态）", () => {
    expect(mathToPlain("\\sqrt{a^{2}+b^{2}}=\\frac{\\sqrt{2}}{2}")).toBe("√(a^2+b^2)=√(2)/2");
  });

  it("表里没有的命令按字面保留，暴露给人看而不是偷偷吞掉", () => {
    expect(mathToPlain("\\oiint x")).toBe("\\oiint x");
  });
});

describe("高中学段命令（issue #84：按 1324 题实测频次补表）", () => {
  it("逻辑与极限箭头", () => {
    expect(mathToPlain("p\\Leftrightarrow q")).toBe("p⇔q");
    expect(mathToPlain("x\\to 0")).toBe("x→0");
  });

  it("集合构建式：\\mid 与转义花括号一起才读得通", () => {
    expect(mathToPlain("\\{x\\mid x>0\\}")).toBe("{x∣x>0}");
  });

  it("\\mathbb 映射黑板粗体，而不是剥壳成裸字母", () => {
    // 剥壳会让「定义域为 ℝ」读起来像「定义域为 R」，与变量 R 混淆
    expect(mathToPlain("x\\in\\mathbb{R}")).toBe("x∈ℝ");
    expect(mathToPlain("\\mathbb{N}\\mathbb{Z}\\mathbb{Q}\\mathbb{C}")).toBe("ℕℤℚℂ");
  });

  it("\\mathbb 的参数不在字母表里时逐字符原样保留，不吞", () => {
    expect(mathToPlain("\\mathbb{R+}")).toBe("ℝ+");
  });

  it("内积尖括号、希腊字母、全称量词", () => {
    expect(mathToPlain("\\langle a,b\\rangle")).toBe("⟨a,b⟩");
    expect(mathToPlain("\\varphi+\\Gamma")).toBe("φ+Γ");
    expect(mathToPlain("\\forall x")).toBe("∀x");
  });

  it("\\underline 是给内容加下划线，与填空槽是两回事", () => {
    expect(parseMath("\\underline{甲}")).toEqual([
      { kind: "decorate", style: "underline", children: [{ kind: "text", text: "甲" }] },
    ]);
    expect(parseMath("____")).toEqual([{ kind: "blank", length: 4 }]);
  });

  it("\\overset 把上方记号叠在内容上（弧 AB 的规范写法）", () => {
    expect(parseMath("\\overset{\\frown}{AB}")).toEqual([
      {
        kind: "overset",
        above: [{ kind: "text", text: "⌢" }],
        children: [{ kind: "text", text: "AB" }],
      },
    ]);
    // 上方记号是有语义的内容（不同于 \overline 的纯样式线），检索时要留住
    expect(mathToPlain("\\overset{\\frown}{AB}")).toBe("⌢AB");
  });

  it("残缺的 \\overset 保持字面，不吞后面的内容", () => {
    expect(mathToPlain("\\overset{a}")).toBe("\\overset{a}");
  });

  it("LaTeX 转义字符还原成字面字符", () => {
    expect(mathToPlain("\\{a\\}\\%\\$\\&\\#")).toBe("{a}%$&#");
  });

  it("\\_ 是字面下划线，不会被当成填空槽", () => {
    expect(parseMath("\\_")).toEqual([{ kind: "text", text: "_" }]);
  });

  it("换行 \\\\ 不受转义字符处理影响", () => {
    expect(mathToPlain("\\begin{array}{l}x=1\\\\y=2\\end{array}")).toBe("x=1；y=2");
  });
});

describe("splitMathSegments", () => {
  const kinds = (src: string) => splitMathSegments(src).map((s) => `${s.type}${s.display ? ":block" : ""}`);

  it("按四种分隔符切段，分隔符本身不进结果", () => {
    expect(splitMathSegments("已知 $x>0$ 求解")).toEqual([
      { type: "text", content: "已知 ", display: false },
      { type: "math", content: "x>0", display: false },
      { type: "text", content: " 求解", display: false },
    ]);
    expect(kinds("$$x$$")).toEqual(["math:block"]);
    expect(kinds("\\[x\\]")).toEqual(["math:block"]);
    expect(kinds("\\(x\\)")).toEqual(["math"]);
  });

  it("$$ 先于 $ 匹配，不会被拆成两个空的行内公式", () => {
    expect(splitMathSegments("$$a+b$$")).toEqual([{ type: "math", content: "a+b", display: true }]);
  });

  it("落单的 $ 按字面文本走，不吞掉后半段", () => {
    expect(splitMathSegments("定价 $100 元")).toEqual([
      { type: "text", content: "定价 $100 元", display: false },
    ]);
  });

  it("\\$ 是字面美元符号，不参与配对且在文本段里被还原", () => {
    expect(splitMathSegments("\\$100 与 \\$200")).toEqual([
      { type: "text", content: "$100 与 $200", display: false },
    ]);
    // 公式内部的 \$ 也不该把公式提前截断
    expect(splitMathSegments("$a\\$b$")).toEqual([
      { type: "math", content: "a\\$b", display: false },
    ]);
  });

  it("行内分隔符不跨空行，块级不受此限", () => {
    expect(kinds("售价 $100\n\n成本 $80")).toEqual(["text"]);
    expect(kinds("$$\na+b\n\nc\n$$")).toEqual(["math:block"]);
  });

  it("闭分隔符以反斜杠开头时先匹配闭合，不被当成转义跳过", () => {
    expect(splitMathSegments("\\(x\\)y")).toEqual([
      { type: "math", content: "x", display: false },
      { type: "text", content: "y", display: false },
    ]);
  });
});
