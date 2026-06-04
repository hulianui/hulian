import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Snippet } from "./snippet";

const writeText = vi.fn().mockResolvedValue(undefined);
beforeEach(() => {
  writeText.mockClear();
  Object.assign(navigator, { clipboard: { writeText } });
});

describe("Snippet", () => {
  it("渲染内容 + 默认提示符 $（命令名 shell 着色后文本仍完整）", () => {
    const { getByText, container } = render(<Snippet>pnpm install</Snippet>);
    // 着色把命令名拆成 span，故按 <code> 整体 textContent 校验文本无丢失。
    expect(container.querySelector("code")!.textContent).toBe("pnpm install");
    expect(getByText("pnpm")).toBeTruthy(); // 命令名独立成着色 span
    expect(getByText("$")).toBeTruthy();
  });

  it("symbol={null} 不渲染提示符", () => {
    const { queryByText } = render(<Snippet symbol={null}>const x = 1</Snippet>);
    expect(queryByText("$")).toBeNull();
  });

  it("点击复制按钮调用 clipboard.writeText（默认取 children 字符串）", () => {
    const { getByLabelText } = render(<Snippet>npm run build</Snippet>);
    fireEvent.click(getByLabelText("复制"));
    expect(writeText).toHaveBeenCalledWith("npm run build");
  });

  it("text 优先于 children 作为复制内容", () => {
    const { getByLabelText } = render(<Snippet text="copied-text">显示文本</Snippet>);
    fireEvent.click(getByLabelText("复制"));
    expect(writeText).toHaveBeenCalledWith("copied-text");
  });

  it("复制后按钮 aria-label 切为已复制", () => {
    const { getByLabelText } = render(<Snippet>x</Snippet>);
    fireEvent.click(getByLabelText("复制"));
    expect(getByLabelText("已复制")).toBeTruthy();
  });

  it("透传 className 到外壳", () => {
    const { container } = render(<Snippet className="my-snip">x</Snippet>);
    expect(container.firstElementChild!.classList.contains("my-snip")).toBe(true);
  });
});
