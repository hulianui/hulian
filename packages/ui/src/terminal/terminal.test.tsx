import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Terminal } from "./terminal";
import { tokenizeTerminal } from "./terminal-highlight";
import type { TerminalLine } from "./terminal.types";

const lines: TerminalLine[] = [
  { prompt: "$", text: "pnpm dev", tone: "command" },
  { text: "ready", tone: "muted" },
  { text: "完成", tone: "success" },
];

describe("Terminal", () => {
  it("渲染所有行文本", () => {
    const { container, getByText } = render(<Terminal lines={lines} />);
    // command 行被着色拆分为多 span，整体文本仍在
    expect(container.textContent).toContain("pnpm dev");
    expect(getByText("ready")).toBeTruthy();
    expect(getByText("完成")).toBeTruthy();
  });

  it("渲染行首提示符", () => {
    const { getByText } = render(<Terminal lines={lines} />);
    expect(getByText("$")).toBeTruthy();
  });

  it("tone 决定文字色类", () => {
    const { getByText } = render(<Terminal lines={lines} />);
    expect(getByText("ready").closest("div")!.className).toContain("text-muted-foreground");
    expect(getByText("完成").closest("div")!.className).toContain("text-primary");
  });

  it("渲染标题栏文字", () => {
    const { getByText } = render(<Terminal lines={lines} title="zsh" />);
    expect(getByText("zsh")).toBeTruthy();
  });

  it("默认高亮：命令行首词单独着色（keyword）", () => {
    const { getByText } = render(<Terminal lines={lines} />);
    const cmd = getByText("pnpm");
    expect(cmd.tagName).toBe("SPAN");
    expect(cmd.getAttribute("style")).toContain("--code-keyword");
  });

  it("highlight=false：命令行保持完整文本节点", () => {
    const { getByText } = render(<Terminal lines={lines} highlight={false} />);
    expect(getByText("pnpm dev")).toBeTruthy();
  });
});

describe("tokenizeTerminal", () => {
  it("识别 URL / 数字 / flag / 字符串，其余 plain", () => {
    const toks = tokenizeTerminal('curl -L https://a.com 200 "ok"');
    const byType = (t: string) => toks.filter((x) => x.type === t).map((x) => x.value);
    expect(byType("url")).toContain("https://a.com");
    expect(byType("number")).toContain("200");
    expect(byType("flag")).toContain("-L");
    expect(byType("string")).toContain('"ok"');
  });

  it("URL 整段吞，内部数字不二次着色", () => {
    const toks = tokenizeTerminal("http://localhost:5512");
    expect(toks).toHaveLength(1);
    expect(toks[0]).toEqual({ type: "url", value: "http://localhost:5512" });
  });

  it("纯文本不产生着色 token", () => {
    const toks = tokenizeTerminal("hello world");
    expect(toks.every((t) => t.type === "plain")).toBe(true);
  });
});
