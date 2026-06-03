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

  it("隐藏 input 携带 name 与当前 markdown 值", async () => {
    const { container } = render(<MarkdownEditor name="detail" defaultValue="# 标题" aria-label="ed3" />);
    await screen.findByRole("textbox", { name: "ed3" });
    const hidden = container.querySelector('input[type="hidden"][name="detail"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toContain("# 标题");
  });

  it("invalid 落 data-invalid；disabled 不可编辑", async () => {
    const { container, rerender } = render(<MarkdownEditor invalid aria-label="ed4" />);
    await screen.findByRole("textbox", { name: "ed4" });
    expect(container.querySelector("[data-invalid]")).toBeTruthy();
    rerender(<MarkdownEditor disabled aria-label="ed4" />);
    const region = screen.getByRole("textbox", { name: "ed4" });
    expect(region.getAttribute("contenteditable")).toBe("false");
  });

  it("渲染工具栏标准集按钮", async () => {
    render(<MarkdownEditor defaultValue="abc" aria-label="ed5" />);
    await screen.findByRole("textbox", { name: "ed5" });
    expect(screen.getByRole("button", { name: "加粗" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "标题 1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "无序列表" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "链接" })).toBeTruthy();
  });

  it("disabled 时不渲染工具栏", async () => {
    render(<MarkdownEditor disabled defaultValue="abc" aria-label="ed6" />);
    await screen.findByRole("textbox", { name: "ed6" });
    expect(screen.queryByRole("button", { name: "加粗" })).toBeNull();
  });
});
