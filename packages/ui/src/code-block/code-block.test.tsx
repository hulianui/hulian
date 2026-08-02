import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { CodeBlock } from "./code-block";
import { tokenizeCode } from "./code-highlight";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

const writeText = vi.fn().mockResolvedValue(undefined);
beforeEach(() => {
  writeText.mockClear();
  Object.assign(navigator, { clipboard: { writeText } });
});

describe("CodeBlock", () => {
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

describe("tokenizeCode", () => {
  const typesOf = (code: string, lang?: string) =>
    Object.fromEntries(
      tokenizeCode(code, lang)
        .filter((t) => t.type !== "plain")
        .map((t) => [t.value, t.type]),
    );

  it("拼接所有 token 还原原文（无丢字）", () => {
    const code = `import { x } from "y"; // 注释\nconst n = 1.8;`;
    expect(tokenizeCode(code).map((t) => t.value).join("")).toBe(code);
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
    expect(tokenizeCode(code, "bash").map((t) => t.value).join("")).toBe(code);
  });
});
