import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConfigProvider, enUS } from "../config";
import { MathText } from "./math-text";
import { mathToPlain, parseMath } from "./math-text.parse";

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

describe("MathText 渲染", () => {
  it("分数的分子分母都出现在 DOM 里", () => {
    render(<MathText>{"\\frac{16}{9}"}</MathText>);
    expect(screen.getByText("16")).toBeTruthy();
    expect(screen.getByText("9")).toBeTruthy();
  });

  it("填空槽渲染为可访问的空位而不是一串下划线字符", () => {
    const { container } = render(<MathText>{"可记作____万元"}</MathText>);
    expect(screen.getByLabelText("填空")).toBeTruthy();
    expect(container.textContent).not.toContain("____");
  });

  it("ConfigProvider locale=enUS localizes generated blanks and row separators", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <MathText>{"\\begin{array}{l}x=1\\\\y=2\\end{array}____"}</MathText>
      </ConfigProvider>,
    );
    expect(screen.getByLabelText("Blank")).toBeTruthy();
    expect(container.textContent).toContain("x=1;y=2");
    expect(container.textContent).not.toContain("；");
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

describe("向量箭头（issue #83：高中题面 \\overrightarrow 169 次 / \\vec 113 次）", () => {
  it("\\vec 与 \\overrightarrow 都走 decorate 的 arrow 档", () => {
    expect(parseMath("\\vec{a}")).toEqual([
      { kind: "decorate", style: "arrow", children: [{ kind: "text", text: "a" }] },
    ]);
    expect(parseMath("\\overrightarrow{AB}")).toEqual([
      { kind: "decorate", style: "arrow", children: [{ kind: "text", text: "AB" }] },
    ]);
  });

  it("箭头不吞内容：朴素文本仍是被装饰的那几个字母", () => {
    expect(mathToPlain("已知\\overrightarrow{AB}与\\vec{a}共线")).toBe("已知AB与a共线");
  });

  it("渲染出真箭头，而不是把 \\vec 原样露给读者", () => {
    const { container } = render(<MathText>{"\\overrightarrow{AB}"}</MathText>);
    expect(container.textContent).not.toContain("\\");
    expect(container.textContent).toContain("AB");
    // 箭头是覆盖层，宽度跟随内容，因此不能靠字符宽度撑开
    expect(container.querySelector("svg")).toBeTruthy();
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
