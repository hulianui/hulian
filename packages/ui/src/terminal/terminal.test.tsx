import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Terminal } from "./terminal";
import type { TerminalLine } from "./terminal.types";

const lines: TerminalLine[] = [
  { prompt: "$", text: "pnpm dev", tone: "command" },
  { text: "ready", tone: "muted" },
  { text: "完成", tone: "success" },
];

describe("Terminal", () => {
  it("渲染所有行文本", () => {
    const { getByText } = render(<Terminal lines={lines} />);
    expect(getByText("pnpm dev")).toBeTruthy();
    expect(getByText("ready")).toBeTruthy();
    expect(getByText("完成")).toBeTruthy();
  });

  it("渲染行首提示符", () => {
    const { getByText } = render(<Terminal lines={lines} />);
    expect(getByText("$")).toBeTruthy();
  });

  it("tone 决定文字色类", () => {
    const { getByText } = render(<Terminal lines={lines} />);
    expect(getByText("ready").closest("div")!.className).toContain("text-muted");
    expect(getByText("完成").closest("div")!.className).toContain("text-primary");
  });

  it("渲染标题栏文字", () => {
    const { getByText } = render(<Terminal lines={lines} title="zsh" />);
    expect(getByText("zsh")).toBeTruthy();
  });
});
