import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { RichTextEditor } from "./rich-text-editor";
import { sanitizePastedHtml } from "./rich-text-editor.sanitize";

afterEach(cleanup);

describe("sanitizePastedHtml（#175 粘贴净化）", () => {
  it("洗掉 class 与 <style>，保留内联排版", () => {
    const out = sanitizePastedHtml(
      '<style>.MsoNormal{mso-style:1}</style><p class="MsoNormal" style="text-align:center;mso-pagination:none">' +
        '<span style="color:#e4393c;font-family:宋体">红字</span></p>',
    );
    expect(out).not.toContain("MsoNormal");
    expect(out).not.toContain("<style");
    expect(out).not.toContain("mso-pagination");
    expect(out).not.toContain("font-family"); // Word 私有的字体栈不该带进正文
    expect(out).toContain("text-align:center");
    expect(out).toContain("color:#e4393c");
    expect(out).toContain("红字");
  });

  it("删事件属性与 javascript: 协议，保留正常链接与图片", () => {
    const out = sanitizePastedHtml(
      '<a href="javascript:alert(1)" onclick="steal()">x</a>' +
        '<a href="https://example.com">ok</a><img src="https://cdn/a.png" alt="图">',
    );
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("onclick");
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('src="https://cdn/a.png"');
    expect(out).toContain('alt="图"');
  });

  it("删注释（Word 的条件样式整块藏在这里）", () => {
    const out = sanitizePastedHtml("<!--[if gte mso 9]><xml>junk</xml><![endif]--><p>正文</p>");
    expect(out).not.toContain("mso");
    expect(out).toContain("<p>正文</p>");
  });

  it("保留表格结构与合并属性", () => {
    const out = sanitizePastedHtml(
      '<table class="t"><tr><td colspan="2" style="text-align:center">头</td></tr></table>',
    );
    expect(out).toContain("<table>");
    expect(out).toContain('colspan="2"');
    expect(out).not.toContain('class="t"');
  });
});

describe("RichTextEditor（#175）", () => {
  it("值进出是 HTML：defaultValue 原样进内容区", async () => {
    const { container } = render(
      <RichTextEditor defaultValue='<p style="text-align:center">居中的<strong>粗体</strong></p>' />,
    );
    await waitFor(() => expect(container.querySelector('[role="textbox"]')).toBeTruthy());
    const body = container.querySelector('[role="textbox"]')!;
    expect(body.querySelector("strong")).toBeTruthy();
    expect(body.querySelector("p")?.getAttribute("style")).toContain("center");
  });

  it("name 桥出隐藏 input，值是 HTML 串（原生表单可直接提交）", async () => {
    const { container } = render(<RichTextEditor name="content" defaultValue="<p>正文</p>" />);
    await waitFor(() => expect(container.querySelector('input[name="content"]')).toBeTruthy());
    const hidden = container.querySelector('input[name="content"]') as HTMLInputElement;
    expect(hidden.value).toBe("<p>正文</p>");
  });

  it("受控 value 外部变更同步进编辑器", async () => {
    const { container, rerender } = render(<RichTextEditor value="<p>第一版</p>" />);
    await waitFor(() => expect(container.textContent).toContain("第一版"));
    rerender(<RichTextEditor value="<p>第二版</p>" />);
    await waitFor(() => expect(container.textContent).toContain("第二版"));
  });

  it("默认工具栏含加粗 / 对齐 / 图片 / 表格 / 清格式", async () => {
    const { getByRole, findByRole } = render(<RichTextEditor />);
    expect(await findByRole("toolbar")).toBeTruthy();
    for (const name of ["加粗", "下划线", "居中", "图片", "表格", "清除格式"]) {
      expect(getByRole("button", { name })).toBeTruthy();
    }
  });

  it("toolbar 裁剪：只渲染点名的那几档", async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <RichTextEditor toolbar={["bold", "italic", "link"]} />,
    );
    await findByRole("toolbar");
    expect(getByRole("button", { name: "加粗" })).toBeTruthy();
    expect(queryByRole("button", { name: "表格" })).toBeNull();
    expect(queryByRole("button", { name: "居中" })).toBeNull();
  });

  it("toolbar=[] 整条工具栏不渲染", async () => {
    const { container, queryByRole } = render(<RichTextEditor toolbar={[]} defaultValue="<p>x</p>" />);
    await waitFor(() => expect(container.querySelector('[role="textbox"]')).toBeTruthy());
    expect(queryByRole("toolbar")).toBeNull();
  });

  it("disabled：内容区不可编辑且工具栏收起", async () => {
    const { container, queryByRole } = render(<RichTextEditor disabled defaultValue="<p>x</p>" />);
    await waitFor(() => expect(container.querySelector('[role="textbox"]')).toBeTruthy());
    expect(container.querySelector('[role="textbox"]')?.getAttribute("contenteditable")).toBe(
      "false",
    );
    expect(queryByRole("toolbar")).toBeNull();
  });

  it("invalid：外壳落 data-invalid（Field 也能经此驱动）", async () => {
    const { container } = render(<RichTextEditor invalid />);
    await waitFor(() => expect(container.querySelector("[data-invalid]")).toBeTruthy());
  });

  it("没有 onUploadImage 时图片按钮退回填 URL，绝不内联 base64", async () => {
    const prompt = vi.spyOn(window, "prompt").mockReturnValue("https://cdn/x.png");
    const { findByRole, container } = render(<RichTextEditor />);
    (await findByRole("button", { name: "图片" })).click();
    expect(prompt).toHaveBeenCalled();
    await waitFor(() => expect(container.querySelector("img")?.getAttribute("src")).toBe("https://cdn/x.png"));
    prompt.mockRestore();
  });

  it("给了 onUploadImage 时点图片按钮打开文件选择而不是弹 URL 输入", async () => {
    const prompt = vi.spyOn(window, "prompt").mockReturnValue(null);
    const onUploadImage = vi.fn().mockResolvedValue({ url: "https://cdn/up.png" });
    const { findByRole, container } = render(<RichTextEditor onUploadImage={onUploadImage} />);
    (await findByRole("button", { name: "图片" })).click();
    expect(prompt).not.toHaveBeenCalled();
    expect(container.querySelector('input[type="file"]')).toBeTruthy();
    prompt.mockRestore();
  });

  it("aria-label 落在内容区（读屏能报出这是什么控件）", async () => {
    const { findByRole } = render(<RichTextEditor aria-label="活动详情" />);
    expect(await findByRole("textbox", { name: "活动详情" })).toBeTruthy();
  });
});

describe("RichTextEditor 高度上限（#264）", () => {
  /** 正文滚动容器 = 内容区（role=textbox）的父节点。 */
  const scrollerOf = (container: HTMLElement) =>
    container.querySelector('[role="textbox"]')?.parentElement as HTMLElement;

  it("不给上限时正文容器既不定高也不滚（与不认识这两个 prop 时一致）", async () => {
    const { container } = render(<RichTextEditor defaultValue="<p>x</p>" />);
    await waitFor(() => expect(scrollerOf(container)).toBeTruthy());
    expect(scrollerOf(container).style.maxHeight).toBe("");
    expect(scrollerOf(container).className).not.toContain("overflow-y-auto");
  });

  it("maxRows 与 minRows 同一把尺子（1 行 = 1.75rem），落在正文容器上并开纵向滚动", async () => {
    const { container } = render(<RichTextEditor minRows={8} maxRows={20} defaultValue="<p>x</p>" />);
    await waitFor(() => expect(scrollerOf(container)).toBeTruthy());
    expect(scrollerOf(container).style.maxHeight).toBe("35rem"); // 20 * 1.75
    expect(scrollerOf(container).className).toContain("overflow-y-auto");
  });

  it("工具栏在滚动容器**外面** —— 正文滚到第几千 px 也够得着按钮", async () => {
    const { container, findByRole } = render(<RichTextEditor maxRows={12} defaultValue="<p>x</p>" />);
    const toolbar = await findByRole("toolbar");
    const scroller = scrollerOf(container);
    expect(scroller.contains(toolbar)).toBe(false);
    // 外壳自己不滚：滚动只能落在正文那一层，否则工具栏会跟着一起滚走
    expect((container.firstElementChild as HTMLElement).className).not.toContain("overflow-y-auto");
  });

  it("maxHeight：数值按 px，字符串按任意 CSS 长度", async () => {
    const { container, rerender } = render(<RichTextEditor maxHeight={480} defaultValue="<p>x</p>" />);
    await waitFor(() => expect(scrollerOf(container)).toBeTruthy());
    expect(scrollerOf(container).style.maxHeight).toBe("480px");
    rerender(<RichTextEditor maxHeight="60vh" defaultValue="<p>x</p>" />);
    expect(scrollerOf(container).style.maxHeight).toBe("60vh");
  });

  it("两个都给：以 maxHeight 为准，并在 dev 下点名 maxRows 被忽略", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<RichTextEditor maxRows={20} maxHeight={480} defaultValue="<p>x</p>" />);
    await waitFor(() => expect(scrollerOf(container)).toBeTruthy());
    expect(scrollerOf(container).style.maxHeight).toBe("480px");
    expect(warn.mock.calls.flat().join("\n")).toContain("maxHeight 与 maxRows 同给");
    warn.mockRestore();
  });

  it("maxRows 小于 minRows：CSS 里 min 压过 max，什么都不会发生，所以要告警", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<RichTextEditor minRows={8} maxRows={4} defaultValue="<p>x</p>" />);
    await waitFor(() => expect(scrollerOf(container)).toBeTruthy());
    expect(warn.mock.calls.flat().join("\n")).toContain("小于 minRows");
    warn.mockRestore();
  });
});
