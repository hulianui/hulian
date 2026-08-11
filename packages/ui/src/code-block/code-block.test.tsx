import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { CodeBlock } from "./code-block";
import { HighlightedCode } from "./highlighted-code";
import { tokenizeCode, splitTokensByLine } from "./code-highlight";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const writeText = vi.fn().mockResolvedValue(undefined);
beforeEach(() => {
  writeText.mockClear();
  Object.assign(navigator, { clipboard: { writeText } });
});

describe("CodeBlock", () => {
  it("稳定父更新时跳过代码块子树", async () => {
    await expectMemoSkipsSubtree(() => <CodeBlock code="const x = 1" lang="tsx" />);
  });

  it("横向可滚动代码区可用键盘聚焦", () => {
    const { container } = render(<CodeBlock code="const x = 1" />);
    expect(container.querySelector("pre")?.getAttribute("tabindex")).toBe("0");
  });

  it("渲染代码文本于 <pre><code>（着色切分后 textContent 仍为原文）", () => {
    const { container } = render(<CodeBlock code="const x = 1" />);
    const code = container.querySelector("pre code");
    expect(code).toBeTruthy();
    expect(code!.textContent).toBe("const x = 1");
  });

  it("highlight 切分出着色 span，关掉则纯文本", () => {
    const { container, rerender } = render(<CodeBlock code="const x = 1" copyable={false} />);
    expect(container.querySelectorAll("pre code span").length).toBeGreaterThan(0);
    rerender(<CodeBlock code="const x = 1" copyable={false} highlight={false} />);
    expect(container.querySelectorAll("pre code span").length).toBe(0);
    expect(container.querySelector("pre code")!.textContent).toBe("const x = 1");
  });

  it("默认渲染复制按钮，点击调用 clipboard.writeText(code)", () => {
    const { getByLabelText } = render(<CodeBlock code={"line1\nline2"} />);
    fireEvent.click(getByLabelText("复制"));
    expect(writeText).toHaveBeenCalledWith("line1\nline2");
  });

  it("复制后按钮 aria-label 切为已复制", () => {
    const { getByLabelText } = render(<CodeBlock code="x" />);
    fireEvent.click(getByLabelText("复制"));
    expect(getByLabelText("已复制")).toBeTruthy();
  });

  it("enUS localizes copy states and the code region label", () => {
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <CodeBlock code="x" lang="tsx" />
      </ConfigProvider>,
    );
    fireEvent.click(getByLabelText("Copy"));
    expect(getByLabelText("Copied")).toBeTruthy();
    expect(getByLabelText("tsx code")).toBeTruthy();
  });

  it("copyable={false} 不渲染复制按钮", () => {
    const { queryByLabelText } = render(<CodeBlock code="x" copyable={false} />);
    expect(queryByLabelText("复制")).toBeNull();
  });

  it("lang 渲染语言标签", () => {
    const { getByText } = render(<CodeBlock code="x" lang="tsx" />);
    expect(getByText("tsx")).toBeTruthy();
  });

  it("透传 className 到外壳", () => {
    const { container } = render(<CodeBlock code="x" className="my-cb" />);
    expect(container.firstElementChild!.classList.contains("my-cb")).toBe(true);
  });
});

describe("CodeBlock lineNumbers", () => {
  const gutterCells = (container: HTMLElement) =>
    [...container.querySelectorAll('[data-slot="code-block-line-number"]')] as HTMLElement[];

  it("默认不渲染行号（零改动）", () => {
    const { container } = render(<CodeBlock code={"a\nb"} />);
    expect(gutterCells(container)).toHaveLength(0);
  });

  it("lineNumbers 每行一个行号，从 1 起", () => {
    const { container } = render(<CodeBlock code={"a\n\nc"} lang="python" lineNumbers />);
    expect(gutterCells(container).map((el) => el.textContent)).toEqual(["1", "2", "3"]);
  });

  it("lineNumbers={{ start }} 从指定行号起算", () => {
    const { container } = render(<CodeBlock code={"a\nb"} lineNumbers={{ start: 120 }} />);
    expect(gutterCells(container).map((el) => el.textContent)).toEqual(["120", "121"]);
  });

  it("行号 aria-hidden + select-none：屏幕阅读器不念、框选复制不带走", () => {
    const { container } = render(<CodeBlock code={"a\nb"} lineNumbers />);
    for (const cell of gutterCells(container)) {
      expect(cell.getAttribute("aria-hidden")).toBe("true");
      expect(cell.classList.contains("select-none")).toBe(true);
    }
  });

  it("行号列 sticky left-0 + 不透明底色：横向滚动时不被带走", () => {
    const { container } = render(<CodeBlock code={"a\nb"} lineNumbers />);
    const cell = gutterCells(container)[0]!;
    expect(cell.classList.contains("sticky")).toBe(true);
    expect(cell.classList.contains("left-0")).toBe(true);
    expect(cell.classList.contains("bg-surface")).toBe(true);
  });

  it("行号列宽按最大行号的位数算，不写死", () => {
    const twoDigits = render(
      <CodeBlock code={Array.from({ length: 12 }, () => "x").join("\n")} lineNumbers />,
    );
    const wide = render(<CodeBlock code={"x\ny"} lineNumbers={{ start: 1840 }} />);
    const gutterVar = (el: HTMLElement) =>
      (el.querySelector('[data-slot="code-block-lines"]') as HTMLElement).style.getPropertyValue(
        "--hl-cb-gutter",
      );
    expect(gutterVar(twoDigits.container)).toBe("2ch");
    expect(gutterVar(wide.container)).toBe("4ch"); // 1840→1841 共 4 位
  });

  it("复制按钮复制的仍是原始 code，行号不进剪贴板", () => {
    const { getByLabelText } = render(<CodeBlock code={"line1\nline2"} lineNumbers />);
    fireEvent.click(getByLabelText("复制"));
    expect(writeText).toHaveBeenCalledWith("line1\nline2");
  });

  it("行号可与 highlight={false} 共存（纯文本仍逐行）", () => {
    const { container } = render(<CodeBlock code={"a\nb"} lineNumbers highlight={false} />);
    expect(gutterCells(container)).toHaveLength(2);
    // 着色 token 是唯一带 color 的 span；行号槽与行盒不着色
    expect([...container.querySelectorAll("span")].filter((el) => el.style.color)).toHaveLength(0);
  });

  it("行号档下父级稳定更新仍跳过子树", async () => {
    await expectMemoSkipsSubtree(() => <CodeBlock code={"a\nb"} lang="python" lineNumbers />);
  });
});

describe("HighlightedCode", () => {
  // CodeBlock 的 memo 只挡父级更新；复制按钮 1.5s 内切两回 copied，
  // 这条路径靠 HighlightedCode 自己的 memo 才不会整段重新分词。
  it("code/lang 不变时跳过重新分词", async () => {
    await expectMemoSkipsSubtree(() => <HighlightedCode code="const x = 1" lang="tsx" />);
  });
});

describe("tokenizeCode", () => {
  const typesOf = (code: string, lang?: string) =>
    Object.fromEntries(
      tokenizeCode(code, lang)
        .filter((t) => t.type !== "plain")
        .map((t) => [t.value, t.type]),
    );

  it("拼接所有 token 还原原文（无丢字）", () => {
    const code = `import { x } from "y"; // 注释\nconst n = 1.8;`;
    expect(
      tokenizeCode(code)
        .map((t) => t.value)
        .join(""),
    ).toBe(code);
  });

  it("识别关键字 / 字符串 / 注释 / 数字 / JSX 标签 / 属性", () => {
    const t = typesOf(`<Lens zoom={1.8}>{/* c */}</Lens>\nimport "a"`);
    expect(t["<Lens"]).toBe("tag");
    expect(t["</Lens"]).toBe("tag");
    expect(t["zoom"]).toBe("attr");
    expect(t["1.8"]).toBe("number");
    expect(t["import"]).toBe("keyword");
    expect(t['"a"']).toBe("string");
  });

  it("字符串内的关键字不被二次着色", () => {
    const toks = tokenizeCode(`const s = "import const"`);
    const str = toks.find((t) => t.value === '"import const"');
    expect(str?.type).toBe("string");
    // 字符串整体作为一个 string token，内部不再拆出 keyword
    expect(toks.filter((t) => t.type === "keyword").map((t) => t.value)).toEqual(["const"]);
  });

  it("Shell 语言走 # 注释与 shell 关键字", () => {
    const t = typesOf(`# 装依赖\npnpm add x`, "bash");
    expect(t["# 装依赖"]).toBe("comment");
  });

  it("Shell：命令名着 command、flag 着 flag、命令参数不着色", () => {
    const t = typesOf(`pnpm --filter @hulianui/ui build`, "bash");
    expect(t["pnpm"]).toBe("command");
    expect(t["--filter"]).toBe("flag");
    expect(t["build"]).toBeUndefined(); // 命令参数为 plain
    expect(t["@hulianui/ui"]).toBeUndefined();
  });

  it("Shell：管道/列表操作符后重回命令位，sudo 前缀词不占命令槽", () => {
    const t = typesOf(`cd /app && sudo pnpm i`, "bash");
    expect(t["cd"]).toBe("command");
    expect(t["sudo"]).toBe("command"); // sudo 自身着色
    expect(t["pnpm"]).toBe("command"); // sudo 后仍是命令位
  });

  it("Shell：拼接所有 token 还原原文（无丢字）", () => {
    const code = `# c\npnpm --filter x build\necho "hi" | grep h`;
    expect(
      tokenizeCode(code, "bash")
        .map((t) => t.value)
        .join(""),
    ).toBe(code);
  });
});

// Python 分支（#167）：重点不只是「Python 关键字着上色」，还有「JS 关键字别被着成关键字」——
// 静默着错比不着色更糟：看得到颜色，所以没人会怀疑它错了。
describe("tokenizeCode · Python", () => {
  const typesOf = (code: string, lang = "python") =>
    Object.fromEntries(
      tokenizeCode(code, lang)
        .filter((t) => t.type !== "plain")
        .map((t) => [t.value, t.type]),
    );
  const typeOfFirst = (code: string, value: string) =>
    tokenizeCode(code, "python").find((t) => t.value === value)?.type;

  it("py / python / python3 三个别名都走 Python 分支", () => {
    for (const lang of ["py", "python", "python3", "Python"]) {
      expect(typesOf("# c\ndef f(): pass", lang)["# c"]).toBe("comment");
    }
  });

  it("拼接所有 token 还原原文（无丢字）", () => {
    const code = `# 猜数字\ndef guess(n: int = 0) -> str:\n    """文档\n    第二行"""\n    if n is None or n < 0b1010:\n        return f"你猜的是 {n}"\n    return "ok"\n`;
    expect(
      tokenizeCode(code, "python")
        .map((t) => t.value)
        .join(""),
    ).toBe(code);
  });

  it("# 注释整行着 comment", () => {
    expect(typesOf("x = 1  # type: ignore")["# type: ignore"]).toBe("comment");
  });

  it("关键字：def / elif / None / True / not / lambda / with / raise 等", () => {
    const t = typesOf(
      "def f():\n    if not x:\n        pass\n    elif y is None or z in w:\n        raise E\n    with open(p) as fp:\n        del fp\n    g = lambda a: True",
    );
    for (const kw of [
      "def",
      "if",
      "not",
      "pass",
      "elif",
      "is",
      "None",
      "or",
      "in",
      "raise",
      "with",
      "as",
      "del",
      "lambda",
      "True",
    ]) {
      expect([kw, t[kw]]).toEqual([kw, "keyword"]);
    }
  });

  it("内置名走 tag 档，与关键字区分开", () => {
    const t = typesOf("print(len(sorted(range(10))))");
    expect(t["print"]).toBe("tag");
    expect(t["len"]).toBe("tag");
    expect(t["sorted"]).toBe("tag");
    expect(t["range"]).toBe("tag");
  });

  it("JS 关键字在 Python 里当变量名不被误着成关键字", () => {
    const code = "var = 1\nlet = 2\nfunction = 3\ninterface = 4\nconst = 5\ntypeof = 6";
    const t = typesOf(code);
    for (const name of ["var", "let", "function", "interface", "const", "typeof"]) {
      expect([name, t[name]]).toEqual([name, undefined]);
    }
    // 同一段代码走 JS 分支就是错的那份对照
    expect(typesOf(code, "js")["var"]).toBe("keyword");
  });

  it("三引号文档串是一个 string token，不被拆成两个空串", () => {
    const toks = tokenizeCode('"""第一行\n第二行"""\nx = 1', "python");
    const strings = toks.filter((t) => t.type === "string");
    expect(strings).toHaveLength(1);
    expect(strings[0]!.value).toBe('"""第一行\n第二行"""');
    expect(toks.filter((t) => t.value === "")).toHaveLength(0);
  });

  it("三引号未闭合时整段吞掉，不把后文当代码扫", () => {
    const toks = tokenizeCode('s = """未闭合\ndef fake():', "python");
    expect(toks.find((t) => t.type === "string")!.value).toBe('"""未闭合\ndef fake():');
    expect(toks.some((t) => t.type === "keyword")).toBe(false);
  });

  it("f / r / b / rb 前缀吞进 string token，不掉在外面", () => {
    expect(typeOfFirst('x = f"你猜的是 {n}"', 'f"你猜的是 {n}"')).toBe("string");
    expect(typeOfFirst("p = r'\\d+'", "r'\\d+'")).toBe("string");
    expect(typeOfFirst('b = b"bytes"', 'b"bytes"')).toBe("string");
    expect(typeOfFirst('m = rb"raw"', 'rb"raw"')).toBe("string");
    expect(typeOfFirst('F = F"""大写也认"""', 'F"""大写也认"""')).toBe("string");
  });

  it("f-string 内嵌引号与花括号不把字符串截断", () => {
    const toks = tokenizeCode(`msg = f"值 {d['k']} 结束"\nn = 1`, "python");
    expect(toks.find((t) => t.type === "string")!.value).toBe(`f"值 {d['k']} 结束"`);
    expect(toks.find((t) => t.type === "number")!.value).toBe("1");
  });

  it("标识符尾字母不会被当成字符串前缀", () => {
    const toks = tokenizeCode('printf"x"', "python");
    expect(toks.find((t) => t.type === "string")!.value).toBe('"x"');
  });

  it("# 出现在字符串内部不当注释", () => {
    const toks = tokenizeCode('color = "#fff"  # 真注释', "python");
    expect(toks.find((t) => t.type === "string")!.value).toBe('"#fff"');
    expect(toks.filter((t) => t.type === "comment").map((t) => t.value)).toEqual(["# 真注释"]);
  });

  it("字符串里的关键字不被二次着色", () => {
    const toks = tokenizeCode('s = "def class import"', "python");
    expect(toks.filter((t) => t.type === "keyword")).toHaveLength(0);
  });

  it("装饰器整段走 attr（含点分限定名）", () => {
    const t = typesOf("@staticmethod\n@app.route\ndef f(): pass");
    expect(t["@staticmethod"]).toBe("attr");
    expect(t["@app.route"]).toBe("attr");
  });

  it("数字：进制前缀 / 下划线分隔 / 指数 / 虚数后缀", () => {
    const t = typesOf("a = 0b1010\nb = 0o17\nc = 0xFF\nd = 1_000_000\ne = 1.5e-3\nf = 3j");
    expect(t["0b1010"]).toBe("number");
    expect(t["0o17"]).toBe("number");
    expect(t["0xFF"]).toBe("number");
    expect(t["1_000_000"]).toBe("number");
    expect(t["1.5e-3"]).toBe("number");
    expect(t["3j"]).toBe("number");
  });
});

// splitTokensByLine 从 code-editor 搬来这里作单一真源（行号档要用；code-editor 侧改为再导出）。
describe("splitTokensByLine", () => {
  it('行数恒等于 code.split("\\n").length，行内不含换行', () => {
    const code = '"""跨行\n文档串"""\n\nx = 1';
    const lines = splitTokensByLine(tokenizeCode(code, "python"));
    expect(lines).toHaveLength(code.split("\n").length);
    expect(lines.flat().some((t) => t.value.includes("\n"))).toBe(false);
    expect(lines[2]).toEqual([]); // 空行是空数组
    expect(lines.map((l) => l.map((t) => t.value).join("")).join("\n")).toBe(code);
  });
});
