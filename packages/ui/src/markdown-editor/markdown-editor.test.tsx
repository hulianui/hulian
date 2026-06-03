import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MarkdownEditor } from "./markdown-editor";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("MarkdownEditor", () => {
  it("渲染 contenteditable 编辑区并解析初值 markdown", async () => {
    render(<MarkdownEditor defaultValue={"# 你好\n\n正文"} aria-label="详情编辑器" />);
    const region = await screen.findByRole("textbox", { name: "详情编辑器" });
    expect(region).toBeTruthy();
    expect(region.querySelector("h1")?.textContent).toBe("你好");
  });

  it("初次挂载不触发 onChange", async () => {
    const onChange = vi.fn();
    render(<MarkdownEditor defaultValue="abc" onChange={onChange} aria-label="ed" />);
    await screen.findByRole("textbox", { name: "ed" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("受控 value 外部变更同步进编辑区", async () => {
    const { rerender } = render(<MarkdownEditor value="# 一" aria-label="ed2" />);
    const region = await screen.findByRole("textbox", { name: "ed2" });
    expect(region.querySelector("h1")?.textContent).toBe("一");
    rerender(<MarkdownEditor value="# 二" aria-label="ed2" />);
    await Promise.resolve();
    expect(region.querySelector("h1")?.textContent).toBe("二");
  });
});
