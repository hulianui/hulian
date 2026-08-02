import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MarkdownEditor } from "./markdown-editor";
import { ConfigProvider, enUS } from "../config";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  // @tiptap/extension-placeholder ≥3.24 的 viewportTracking 插件在初始化时调用
  // document.elementFromPoint；jsdom 未实现该 API，mock 为返回 null 即可通过
  if (!document.elementFromPoint) {
    document.elementFromPoint = vi.fn(() => null);
  }
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

  it("enUS localizes the formatting toolbar accessible labels", async () => {
    render(
      <ConfigProvider locale={enUS}>
        <MarkdownEditor defaultValue="abc" />
      </ConfigProvider>,
    );
    await screen.findByRole("textbox", { name: "Markdown editor" });
    expect(screen.getByRole("toolbar", { name: "Formatting toolbar" })).toBeTruthy();
    for (const label of [
      "Bold",
      "Italic",
      "Strikethrough",
      "Inline code",
      "Heading 1",
      "Unordered list",
      "Blockquote",
      "Horizontal rule",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
  });

  it("can toggle an explicit editor label in both directions without changing hook order", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const view = (ariaLabel?: string) => (
      <ConfigProvider locale={enUS}>
        <MarkdownEditor defaultValue="abc" aria-label={ariaLabel} />
      </ConfigProvider>
    );
    try {
      const { rerender } = render(view());
      await screen.findByRole("textbox", { name: "Markdown editor" });

      rerender(view("Knowledge editor"));
      await screen.findByRole("textbox", { name: "Knowledge editor" });

      rerender(view());
      await screen.findByRole("textbox", { name: "Markdown editor" });
      expect(consoleError.mock.calls.flat().join(" ")).not.toContain("change in the order of Hooks");
    } finally {
      consoleError.mockRestore();
    }
  });

  it("a legacy custom locale without markdownEditor keeps the Chinese labels", async () => {
    const locale = { ...enUS, components: { ...enUS.components!, markdownEditor: undefined } };
    render(
      <ConfigProvider locale={locale}>
        <MarkdownEditor defaultValue="abc" />
      </ConfigProvider>,
    );
    await screen.findByRole("textbox", { name: "Markdown 编辑器" });
    expect(screen.getByRole("toolbar", { name: "格式工具栏" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "加粗" })).toBeTruthy();
  });

  it("disabled 时不渲染工具栏", async () => {
    render(<MarkdownEditor disabled defaultValue="abc" aria-label="ed6" />);
    await screen.findByRole("textbox", { name: "ed6" });
    expect(screen.queryByRole("button", { name: "加粗" })).toBeNull();
  });

  it("空内容显示 placeholder", async () => {
    render(<MarkdownEditor placeholder="请输入内容" aria-label="ed7" />);
    const region = await screen.findByRole("textbox", { name: "ed7" });
    // Placeholder 扩展给空首段加 data-placeholder 属性
    expect(region.querySelector("[data-placeholder='请输入内容']")).toBeTruthy();
  });
});
