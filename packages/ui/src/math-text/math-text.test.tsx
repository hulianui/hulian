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

describe("上下标的单 token 简写可以是一个完整命令", () => {
  it("`90^\\circ` 与 `90^{\\circ}` 等价 —— 前者才是题面里写度数的常见形态", () => {
    expect(mathToPlain("90^\\circ")).toBe("90°");
    expect(parseMath("90^\\circ")).toEqual(parseMath("90^{\\circ}"));
  });

  it("上标与下标都认命令简写", () => {
    expect(mathToPlain("x^\\alpha")).toBe("x^α");
    expect(parseMath("x^\\alpha")).toEqual(parseMath("x^{\\alpha}"));
    expect(mathToPlain("a_\\beta")).toBe("a_β");
    expect(parseMath("a_\\beta")).toEqual(parseMath("a_{\\beta}"));
  });

  it("命令名的边界就是上标的边界：`x^\\alpha b` 里 b 是正文", () => {
    expect(parseMath("x^\\alpha b")).toEqual([
      { kind: "text", text: "x" },
      { kind: "sup", children: [{ kind: "text", text: "α" }] },
      { kind: "text", text: "b" },
    ]);
  });

  it("既有的单字符与花括号写法不受影响", () => {
    expect(parseMath("x^2")).toEqual([
      { kind: "text", text: "x" },
      { kind: "sup", children: [{ kind: "text", text: "2" }] },
    ]);
    expect(parseMath("x^{2}")).toEqual(parseMath("x^2"));
  });

  it("不认识的命令仍原样保留，不吞内容", () => {
    expect(mathToPlain("x^\\oiint")).toBe("x^\\oiint");
  });

  it("渲染 `90^\\circ` 不把反斜杠露给读者", () => {
    const { container } = render(<MathText>{"\\angle ABC=90^\\circ"}</MathText>);
    expect(container.textContent).not.toContain("\\");
    expect(container.textContent).toContain("90°");
  });
});

describe("符号间距（关系符两侧对称留白，前缀记号紧贴）", () => {
  const opNodes = (src: string) => parseMath(src).filter((n) => n.kind === "op");

  it("二元关系符切成 op 节点，命令写法与裸 Unicode 一致", () => {
    expect(parseMath("A\\Rightarrow B")).toEqual([
      { kind: "text", text: "A" },
      { kind: "op", text: "⇒", spacing: "relation" },
      { kind: "text", text: "B" },
    ]);
    expect(parseMath("A⇒B")).toEqual(parseMath("A\\Rightarrow B"));
    expect(parseMath("x=1")).toEqual([
      { kind: "text", text: "x" },
      { kind: "op", text: "=", spacing: "relation" },
      { kind: "text", text: "1" },
    ]);
  });

  it("留白与作者打没打空格无关：三种写法解析成同一棵树", () => {
    const spaced = parseMath("A \\Rightarrow B");
    expect(spaced).toEqual(parseMath("A\\Rightarrow B"));
    expect(spaced).toEqual(parseMath("A ⇒ B"));
  });

  it("二元运算符是另一档间距，不与关系符混为一谈", () => {
    expect(opNodes("a\\times b")).toEqual([{ kind: "op", text: "×", spacing: "binary" }]);
    expect(opNodes("A\\cup B")).toEqual([{ kind: "op", text: "∪", spacing: "binary" }]);
  });

  it("前面没有操作数时二元运算符降级：`±3` 是正负号不是加减", () => {
    expect(opNodes("\\pm 3")).toEqual([]);
    expect(opNodes("(\\pm 3)")).toEqual([]);
    expect(opNodes("a\\pm 3")).toEqual([{ kind: "op", text: "±", spacing: "binary" }]);
  });

  it("前缀记号不切 op，`∠ABC` 必须紧贴", () => {
    expect(parseMath("\\angle ABC")).toEqual([
      { kind: "text", text: "∠" },
      { kind: "text", text: "ABC" },
    ]);
    expect(opNodes("\\triangle ABC")).toEqual([]);
    expect(opNodes("\\therefore x")).toEqual([]);
    // 弧号在本组件里只作为 \overset 的上方记号出现，留白会把它推歪
    expect(parseMath("\\overset{\\frown}{AB}")[0]).toMatchObject({
      above: [{ kind: "text", text: "⌢" }],
    });
  });

  it("mathToPlain 保持紧凑：留白只属于 DOM", () => {
    expect(mathToPlain("A \\Rightarrow B")).toBe("A⇒B");
    expect(mathToPlain("x = 1")).toBe("x=1");
    expect(mathToPlain("x\\neq 0,y\\leqslant 3,z\\geq 1")).toBe("x≠0,y≤3,z≥1");
  });

  it("渲染时关系符左右各有一层外边距，前缀记号没有", () => {
    const { container } = render(<MathText>{"A \\Rightarrow B,\\angle ABC"}</MathText>);
    const spans = [...container.querySelectorAll("span")];
    const arrow = spans.find((el) => el.textContent === "⇒");
    expect(arrow?.className).toContain("mx-[0.2em]");
    // 前缀记号没有独立包裹层，跟后面的字母同在一个文本节点里
    expect(spans.some((el) => el.textContent === "∠")).toBe(false);
    expect(container.textContent).toContain("∠ABC");
  });

  it("留白是 margin 不是空格：textContent 仍可直接比对", () => {
    const { container } = render(<MathText>{"A \\Rightarrow B"}</MathText>);
    expect(container.textContent).toBe("A⇒B");
  });
});
