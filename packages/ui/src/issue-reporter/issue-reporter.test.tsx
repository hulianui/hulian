import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { IssueReporter } from "./issue-reporter";
import { IssueReporterModal } from "./issue-reporter-modal";
import { BUILTIN_ISSUE_TEMPLATES, buildIssueUrl, createIssueDraft } from "./issue-reporter.core";
import type { IssueDraft, IssueTemplate } from "./issue-reporter.types";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  if (!document.elementFromPoint) document.elementFromPoint = vi.fn(() => null);
});
afterEach(cleanup);

/** 按可见 label 找到对应控件（Field 经 Base UI 自动串 htmlFor/id）。 */
function control(label: string): HTMLElement {
  return screen.getByLabelText(label);
}

function typeIn(label: string, value: string) {
  fireEvent.change(control(label), { target: { value } });
}

describe("IssueReporter · 表单", () => {
  it("稳定父更新时跳过草稿器子树", async () => {
    await expectMemoSkipsSubtree(() => <IssueReporter />);
  });

  it("默认渲染 bug 模板的字段", () => {
    render(<IssueReporter />);
    expect(screen.getByText("问题描述")).toBeTruthy();
    expect(screen.getByText("复现步骤")).toBeTruthy();
    expect(screen.getByText("环境")).toBeTruthy();
  });

  it("defaultType 切到 feature → 换成 feature 的字段", () => {
    render(<IssueReporter defaultType="feature" />);
    expect(screen.getByText("需求描述")).toBeTruthy();
    expect(screen.getByText("期望 API")).toBeTruthy();
    expect(screen.queryByText("复现步骤")).toBeNull();
  });

  it("control:input 的字段渲染 <input>，其余渲染 <textarea>", () => {
    render(<IssueReporter />);
    expect(control("环境").tagName).toBe("INPUT");
    expect(control("问题描述").tagName).toBe("TEXTAREA");
  });

  it("没有 components 时不渲染「相关组件」字段", () => {
    render(<IssueReporter />);
    expect(screen.queryByText("相关组件")).toBeNull();
  });

  it("传 components 才渲染「相关组件」（组件自己不去 fetch 候选）", () => {
    render(<IssueReporter components={[{ slug: "select", name: "Select 选择器" }]} />);
    expect(screen.getByText("相关组件")).toBeTruthy();
  });
});

describe("IssueReporter · 预览", () => {
  it("实时把字段值渲染成 markdown 预览", () => {
    const { container } = render(<IssueReporter />);
    typeIn("问题描述", "clearable 点了没反应");
    expect(container.textContent).toContain("## 问题描述");
    expect(container.textContent).toContain("clearable 点了没反应");
  });

  it("空表单显示预览占位而非空代码块", () => {
    const { container } = render(<IssueReporter />);
    expect(container.textContent).toContain("填写字段后这里会实时显示 issue 正文。");
    expect(container.querySelector("pre")).toBeNull();
  });

  it("preview={false} 关掉整个预览区", () => {
    const { container } = render(<IssueReporter preview={false} />);
    typeIn("问题描述", "xxx");
    expect(container.textContent).not.toContain("Markdown 预览");
  });
});

describe("IssueReporter · 提交回吐", () => {
  it("标题为空 → 不提交、就地标红", () => {
    const onSubmit = vi.fn();
    render(<IssueReporter onSubmit={onSubmit} />);
    typeIn("问题描述", "有描述没标题");
    fireEvent.click(screen.getByRole("button", { name: "生成草稿" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("标题 必填")).toBeTruthy();
  });

  it("必填模板字段为空 → 不提交", () => {
    const onSubmit = vi.fn();
    render(<IssueReporter onSubmit={onSubmit} />);
    typeIn("标题", "只有标题");
    fireEvent.click(screen.getByRole("button", { name: "生成草稿" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("问题描述 必填")).toBeTruthy();
  });

  it("校验通过 → onSubmit 拿到结构化草稿（含 body / labels / type）", () => {
    const onSubmit = vi.fn();
    render(<IssueReporter onSubmit={onSubmit} components={[{ slug: "select" }]} />);
    typeIn("标题", "Select clearable 失效");
    typeIn("问题描述", "点 × 没反应");
    typeIn("复现步骤", "1. 打开\n2. 点 ×");
    fireEvent.click(screen.getByRole("button", { name: "生成草稿" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const draft = onSubmit.mock.calls[0]![0] as IssueDraft;
    expect(draft.type).toBe("bug");
    expect(draft.title).toBe("Select clearable 失效");
    expect(draft.labels).toEqual(["bug"]);
    expect(draft.values.summary).toBe("点 × 没反应");
    expect(draft.body).toContain("## 问题描述\n\n点 × 没反应");
    expect(draft.body).toContain("## 复现步骤");
  });

  it("一进来不展示必填错误，提交失败后才展示", () => {
    render(<IssueReporter />);
    expect(screen.queryByText("标题 必填")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "生成草稿" }));
    expect(screen.getByText("标题 必填")).toBeTruthy();
  });

  it("onDraftChange 每次输入都回吐最新草稿", () => {
    const onDraftChange = vi.fn();
    render(<IssueReporter onDraftChange={onDraftChange} />);
    typeIn("标题", "A");
    const last = onDraftChange.mock.calls.at(-1)![0] as IssueDraft;
    expect(last.title).toBe("A");
  });
});

describe("IssueReporter · GitHub 预填链接", () => {
  it("点「在 GitHub 上打开」回吐 URL 并开新标签页", () => {
    const onOpenUrl = vi.fn();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<IssueReporter onOpenUrl={onOpenUrl} repo="acme/demo" />);
    typeIn("标题", "标题");
    fireEvent.click(screen.getByRole("button", { name: /在 GitHub 上打开/ }));

    const url = onOpenUrl.mock.calls[0]![0] as string;
    expect(url.startsWith("https://github.com/acme/demo/issues/new?")).toBe(true);
    expect(url).toContain(`title=${encodeURIComponent("标题")}`);
    expect(open).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
    open.mockRestore();
  });

  it("openInNewTab={false} 只回吐 URL 不开窗（交给消费方自己路由）", () => {
    const onOpenUrl = vi.fn();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<IssueReporter onOpenUrl={onOpenUrl} openInNewTab={false} />);
    fireEvent.click(screen.getByRole("button", { name: /在 GitHub 上打开/ }));
    expect(onOpenUrl).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });
});

describe("IssueReporter · 超长降级", () => {
  it("URL 超限 → 藏掉「在 GitHub 上打开」并给出提示", () => {
    render(<IssueReporter urlLimit={200} />);
    typeIn("问题描述", "长".repeat(200));
    expect(screen.queryByRole("button", { name: /在 GitHub 上打开/ })).toBeNull();
    expect(screen.getByText("内容过长，不能用预填链接打开")).toBeTruthy();
    expect(screen.getByRole("button", { name: /复制 Markdown/ })).toBeTruthy();
  });

  it("回到限额内 → 按钮回来、提示消失", () => {
    render(<IssueReporter urlLimit={400} />);
    typeIn("问题描述", "长".repeat(200));
    expect(screen.queryByRole("button", { name: /在 GitHub 上打开/ })).toBeNull();
    typeIn("问题描述", "短");
    expect(screen.getByRole("button", { name: /在 GitHub 上打开/ })).toBeTruthy();
    expect(screen.queryByText("内容过长，不能用预填链接打开")).toBeNull();
  });

  it("降级判据量的是整条 URL：只有长标题、body 为空也会触发", () => {
    render(<IssueReporter urlLimit={120} />);
    typeIn("标题", "很长的标题".repeat(20));
    expect(screen.queryByRole("button", { name: /在 GitHub 上打开/ })).toBeNull();
  });
});

describe("IssueReporter · 复制 Markdown", () => {
  it("复制的是 markdown 正文而非 URL，并切换成「已复制」", () => {
    const writeText = vi.fn((_text: string) => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const onCopy = vi.fn();
    render(<IssueReporter onCopy={onCopy} />);
    typeIn("问题描述", "点了没反应");
    fireEvent.click(screen.getByRole("button", { name: /复制 Markdown/ }));

    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0]![0];
    expect(copied).toContain("## 问题描述");
    expect(copied).not.toContain("https://github.com");
    expect(onCopy).toHaveBeenCalledWith(copied);
    expect(screen.getByRole("button", { name: /已复制/ })).toBeTruthy();
  });
});

describe("IssueReporter · 可换模板", () => {
  const docs: IssueTemplate = {
    type: "docs",
    label: "文档纠错",
    labels: ["documentation"],
    fields: [{ name: "page", label: "页面地址", control: "input", required: true }],
    toMarkdown: (values) => `页面：${values.page ?? ""}`,
  };

  it("templates 传入自定义模板 → 字段与 markdown 全按它走", () => {
    const onSubmit = vi.fn();
    render(<IssueReporter templates={[docs]} onSubmit={onSubmit} />);
    typeIn("标题", "文档写错了");
    typeIn("页面地址", "/components/select");
    fireEvent.click(screen.getByRole("button", { name: "生成草稿" }));

    const draft = onSubmit.mock.calls[0]![0] as IssueDraft;
    expect(draft.type).toBe("docs");
    expect(draft.labels).toEqual(["documentation"]);
    expect(draft.body).toBe("页面：/components/select");
  });

  it("组件产出的 URL 与纯函数直接算的一致（组件层没有自己的一套拼法）", () => {
    const onOpenUrl = vi.fn();
    render(
      <IssueReporter
        templates={[docs]}
        onOpenUrl={onOpenUrl}
        repo="acme/demo"
        openInNewTab={false}
      />,
    );
    typeIn("标题", "文档写错了");
    typeIn("页面地址", "/x");
    fireEvent.click(screen.getByRole("button", { name: /在 GitHub 上打开/ }));

    const expected = buildIssueUrl(
      createIssueDraft({ type: "docs", title: "文档写错了", values: { page: "/x" } }, docs),
      "acme/demo",
    );
    expect(onOpenUrl.mock.calls[0]![0]).toBe(expected);
  });
});

describe("IssueReporter · 文案与内置模板", () => {
  it("text 可整体覆盖界面文案", () => {
    render(<IssueReporter text={{ submit: "Create draft", titleLabel: "Title" }} />);
    expect(screen.getByRole("button", { name: "Create draft" })).toBeTruthy();
    expect(screen.getByText("Title")).toBeTruthy();
  });

  it("内置三套模板 type 稳定", () => {
    expect(BUILTIN_ISSUE_TEMPLATES.map((t) => t.type)).toEqual(["bug", "feature", "enhancement"]);
  });

  it("showSubmit={false} 不渲染内置提交按钮（弹层版由 ModalForm 出页脚）", () => {
    render(<IssueReporter showSubmit={false} />);
    expect(screen.queryByRole("button", { name: "生成草稿" })).toBeNull();
  });
});

describe("IssueReporter · markdown 控件", () => {
  const rich: IssueTemplate = {
    type: "rich",
    label: "富文本",
    fields: [{ name: "detail", label: "详情", control: "markdown" }],
    toMarkdown: (values) => `${values.detail ?? ""}`,
  };

  it("control:markdown 渲染 MarkdownEditor（可编辑区而非 textarea）", async () => {
    render(<IssueReporter templates={[rich]} preview={false} />);
    const region = await screen.findByRole("textbox", { name: "详情" });
    expect(region.getAttribute("contenteditable")).toBe("true");
  });
});

describe("IssueReporterModal", () => {
  it("弹层内不渲染内置提交按钮，ModalForm 页脚提交能拿到草稿", () => {
    const onSubmit = vi.fn();
    render(<IssueReporterModal defaultOpen onSubmit={onSubmit} modalTitle="反馈" />);
    expect(screen.queryByRole("button", { name: "生成草稿" })).toBeNull();

    typeIn("标题", "弹层里提交");
    typeIn("问题描述", "描述");
    fireEvent.click(screen.getByRole("button", { name: "提交" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect((onSubmit.mock.calls[0]![0] as IssueDraft).title).toBe("弹层里提交");
  });

  it("校验不过 → 弹层保持打开", () => {
    const onSubmit = vi.fn();
    render(<IssueReporterModal defaultOpen onSubmit={onSubmit} modalTitle="反馈" />);
    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("标题 必填")).toBeTruthy();
  });
});

describe("IssueReporter · apiRef", () => {
  it("submit() 校验不过返回 null，通过返回草稿", () => {
    const api: { current: import("./issue-reporter.types").IssueReporterApi | null } = {
      current: null,
    };
    render(<IssueReporter apiRef={api} showSubmit={false} />);
    // act 的返回值是 thenable 而非回调返回值，故用容器接住 submit() 的结果
    const out: { draft?: IssueDraft | null } = {};
    act(() => {
      out.draft = api.current!.submit();
    });
    expect(out.draft).toBeNull();

    typeIn("标题", "T");
    typeIn("问题描述", "D");
    act(() => {
      out.draft = api.current!.submit();
    });
    expect(out.draft?.title).toBe("T");
    expect(api.current!.getUrl()).toContain("/issues/new?");
  });

  it("reset() 清空已填内容", () => {
    const api: { current: import("./issue-reporter.types").IssueReporterApi | null } = {
      current: null,
    };
    render(<IssueReporter apiRef={api} />);
    typeIn("标题", "T");
    expect((control("标题") as HTMLInputElement).value).toBe("T");
    act(() => {
      api.current!.reset();
    });
    expect((control("标题") as HTMLInputElement).value).toBe("");
  });
});
