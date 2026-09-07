import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { emptyQuestion } from "../question/question-shape";
import type { Question } from "../question/question.types";
import { QuestionEditor } from "./question-editor";
import type { QuestionEditorProps } from "./question-editor.types";

const CJK = /[㐀-䶿一-鿿]/u;

function Harness({
  initial,
  onValue,
  ...rest
}: { initial: Question; onValue?: (q: Question) => void } & Omit<QuestionEditorProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <QuestionEditor
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

const single = (): Question => ({
  ...emptyQuestion("single"),
  stem: "下列正确的是",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
  ],
  answer: "A",
});

const alertDialog = () => document.querySelector('[role="alertdialog"]') as HTMLElement | null;

describe("QuestionEditor", () => {
  it("七个题型都在，题干 / 解析 / 难度 / 分值 / 用时齐全", () => {
    render(<Harness initial={emptyQuestion("single")} />);
    for (const name of ["单选", "多选", "判断", "填空", "简答", "计算", "解答"]) {
      expect(screen.getByRole("radio", { name })).toBeTruthy();
    }
    expect(screen.getByLabelText("题干")).toBeTruthy();
    expect(screen.getByLabelText("解析")).toBeTruthy();
    expect(screen.getByLabelText("分值")).toBeTruthy();
    expect(screen.getByLabelText("预估用时（分钟）")).toBeTruthy();
  });

  it("干净的题切题型直接重置形状，不弹确认", () => {
    const onValue = vi.fn();
    render(<Harness initial={emptyQuestion("single")} onValue={onValue} />);
    fireEvent.click(screen.getByRole("radio", { name: "判断" }));
    expect(alertDialog()).toBeNull();
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "judge", options: null, answer: true, score: 3 }),
    );
  });

  it("有内容的题切题型先确认：取消保留，确认清空并换默认分", async () => {
    const onValue = vi.fn();
    render(<Harness initial={single()} onValue={onValue} />);
    fireEvent.click(screen.getByRole("radio", { name: "解答" }));
    await waitFor(() => expect(alertDialog()).not.toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(alertDialog()).toBeNull());
    expect(onValue).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("radio", { name: "解答" }));
    await waitFor(() => expect(alertDialog()).not.toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "清空并切换" }));
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "essay", options: null, answer: "", score: 8, stem: "下列正确的是" }),
    );
  });

  it("defaultScoreByType 覆盖默认分", () => {
    const onValue = vi.fn();
    render(<Harness initial={emptyQuestion("single")} onValue={onValue} defaultScoreByType={{ blank: 6 }} />);
    fireEvent.click(screen.getByRole("radio", { name: "填空" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ type: "blank", score: 6 }));
  });

  it("填空：题干多写一个 ____ 后答案区出对齐提示", () => {
    render(<Harness initial={{ ...emptyQuestion("blank"), stem: "a=____", answer: ["1"] }} />);
    fireEvent.change(screen.getByLabelText("题干"), { target: { value: "a=____，b=____" } });
    expect(screen.getByText("题干有 2 个空，答案有 1 项")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "按题干对齐为 2 空" }));
    expect(screen.getByLabelText("第 2 空")).toBeTruthy();
  });

  it("判断题答案是「正确 / 错误」两段", () => {
    const onValue = vi.fn();
    render(<Harness initial={emptyQuestion("judge")} onValue={onValue} />);
    fireEvent.click(screen.getByRole("radio", { name: "错误" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: false }));
  });

  it("校验：默认只显示改过的字段；showAllIssues 全部显示", () => {
    const { rerender } = render(<Harness initial={emptyQuestion("single")} />);
    expect(screen.queryByText("题干不能为空")).toBeNull();
    fireEvent.change(screen.getByLabelText("题干"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("题干"), { target: { value: "" } });
    expect(screen.getByText("题干不能为空")).toBeTruthy();
    expect(screen.queryByText("选项 A 不能为空")).toBeNull();
    rerender(<Harness initial={emptyQuestion("single")} showAllIssues />);
    expect(screen.getByText("选项 A 不能为空")).toBeTruthy();
    expect(screen.getByText("答案必须在选项范围内")).toBeTruthy();
  });

  it("复核条列出 issues，「已处理」回调 label", () => {
    const onResolveIssue = vi.fn();
    render(
      <Harness
        initial={single()}
        issues={[{ label: "选项疑似缺失" }, { label: "答案存疑", tone: "danger" }]}
        onResolveIssue={onResolveIssue}
      />,
    );
    expect(screen.getByText("选项疑似缺失")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "已处理" })[1]);
    expect(onResolveIssue).toHaveBeenCalledWith("答案存疑");
  });

  it("extra 渲染在题型之后、题干之前", () => {
    render(<Harness initial={single()} extra={<div data-testid="extra">学科</div>} />);
    const extra = screen.getByTestId("extra");
    const typeGroup = screen.getByRole("radiogroup", { name: "题型" });
    const stem = screen.getByLabelText("题干");
    expect(typeGroup.compareDocumentPosition(extra) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(extra.compareDocumentPosition(stem) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("预览是带答案的 QuestionCard；题干为空时显示占位；preview=false 不渲染", () => {
    // Harness 用 useState(initial)，rerender 换 initial 不会重置，所以三种情况各自挂载。
    const withAnswer = render(<Harness initial={single()} />);
    const preview = withAnswer.container.querySelector('[data-slot="question-editor-preview"]') as HTMLElement;
    expect(preview.querySelector('[data-slot="question-answer"]')).not.toBeNull();
    expect(preview.textContent).toContain("甲");
    withAnswer.unmount();

    const empty = render(<Harness initial={emptyQuestion("single")} />);
    expect(screen.getByText("输入题干后显示预览")).toBeTruthy();
    empty.unmount();

    const noPreview = render(<Harness initial={single()} preview={false} />);
    expect(noPreview.container.querySelector('[data-slot="question-editor-preview"]')).toBeNull();
  });

  it("题图：输入框只见正文；上传成功后 stem 末尾多一行 ![](key)，预览渲染成 img", async () => {
    const onValue = vi.fn();
    const upload = vi.fn<(file: File) => Promise<string>>().mockResolvedValue("import/new.png");
    const { container } = render(
      <Harness
        initial={{ ...single(), stem: "如图\n\n![](import/old.png)" }}
        onValue={onValue}
        resolveFigure={(key) => `/files/${key}`}
        onUploadFigure={upload}
      />,
    );
    expect((screen.getByLabelText("题干") as HTMLTextAreaElement).value).toBe("如图");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "new.png", { type: "image/png" })] } });
    await waitFor(() =>
      expect(onValue).toHaveBeenLastCalledWith(
        expect.objectContaining({ stem: "如图\n\n![](import/old.png)\n![](import/new.png)" }),
      ),
    );
    const preview = container.querySelector('[data-slot="question-editor-preview"]') as HTMLElement;
    expect(Array.from(preview.querySelectorAll("img")).map((i) => i.getAttribute("src"))).toEqual([
      "/files/import/old.png",
      "/files/import/new.png",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "删除题图 1" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ stem: "如图\n\n![](import/new.png)" }));
  });

  it("figureFilter：行内公式图留在题干框里、不进缩略图条，编辑一轮位置与 alt 都不动", () => {
    const onValue = vi.fn();
    const stem = "不等式![7x+5<5x+1](import/formula/f1.png)的解集为______．\n\n![](question-image/g.png)";
    render(
      <Harness
        initial={{ ...single(), stem }}
        onValue={onValue}
        resolveFigure={(key) => `/files/${key}`}
        figureFilter={(key) => !key.startsWith("import/formula/")}
      />,
    );
    const textarea = screen.getByLabelText("题干") as HTMLTextAreaElement;
    expect(textarea.value).toBe("不等式![7x+5<5x+1](import/formula/f1.png)的解集为______．");
    // 缩略图条只有那张手工题图（公式图不可删）
    expect(screen.getByRole("button", { name: "删除题图 1" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "删除题图 2" })).toBeNull();

    fireEvent.change(textarea, { target: { value: `${textarea.value}改` } });
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        stem: "不等式![7x+5<5x+1](import/formula/f1.png)的解集为______．改\n\n![](question-image/g.png)",
      }),
    );
  });

  it("题干预览：figureFilter 划出去的行内公式图画成图，不再印成源码（#355）", () => {
    const stem = "不等式![7x+5<5x+1](import/formula/f1.png)的解集为 $x<1$";
    const { container } = render(
      <Harness
        initial={{ ...single(), stem }}
        resolveFigure={(key) => `/files/${key}`}
        figureFilter={(key) => !key.startsWith("import/formula/")}
      />,
    );
    const previews = container.querySelectorAll('[data-slot="math-textarea-preview"]');
    expect(previews.length).toBe(1); // 只有题干这一个框有公式 / 有图
    const preview = previews[0] as HTMLElement;
    const img = preview.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/files/import/formula/f1.png");
    // 引用自带的 alt 就是这张图念出来是什么，比「题图 1」有信息
    expect(img?.getAttribute("alt")).toBe("7x+5<5x+1");
    expect(preview.textContent).not.toContain("import/formula");
  });

  it("题干预览：没给 resolveFigure 时退回默认的公式预览（解析不出图，不多包一层）", () => {
    const stem = "不等式![7x+5<5x+1](import/formula/f1.png)的解集为 $x<1$";
    const { container } = render(<Harness initial={{ ...single(), stem }} />);
    const preview = container.querySelector('[data-slot="math-textarea-preview"]') as HTMLElement;
    expect(preview.querySelector("img")).toBeNull();
  });

  it("题干预览：既没公式也没图时整块收起（预览与输入框逐字相同 = 噪音）", () => {
    const { container } = render(
      <Harness initial={{ ...single(), stem: "下列正确的是" }} resolveFigure={(key) => `/files/${key}`} />,
    );
    expect(container.querySelector('[data-slot="math-textarea-preview"]')).toBeNull();
  });

  it("题图调序：前移 / 后移改的是题干里的书写顺序（#354）", () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial={{ ...single(), stem: "如图\n\n![](a.png)\n![](b.png)" }}
        onValue={onValue}
        resolveFigure={(key) => `/files/${key}`}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "题图 1 后移" }));
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ stem: "如图\n\n![](b.png)\n![](a.png)" }),
    );
    expect((screen.getByRole("button", { name: "题图 1 前移" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "题图 2 后移" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("只有一张题图时不出调序按钮", () => {
    render(
      <Harness
        initial={{ ...single(), stem: "如图\n\n![](a.png)" }}
        resolveFigure={(key) => `/files/${key}`}
      />,
    );
    expect(screen.queryByRole("button", { name: "题图 1 后移" })).toBeNull();
  });

  it("点缩略图看大图（#354）", async () => {
    render(
      <Harness
        initial={{ ...single(), stem: "如图\n\n![](a.png)\n![](b.png)" }}
        resolveFigure={(key) => `/files/${key}`}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "查看题图 2" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector('img[src="/files/b.png"]')).toBeTruthy();
  });

  it("上传失败留住那个 File，点一下重试再传一遍（#354）", async () => {
    const onValue = vi.fn();
    const upload = vi
      .fn<(file: File) => Promise<string>>()
      .mockRejectedValueOnce(new Error("网络断了"))
      .mockResolvedValueOnce("import/new.png");
    const { container } = render(
      <Harness
        initial={{ ...single(), stem: "如图" }}
        onValue={onValue}
        resolveFigure={(key) => `/files/${key}`}
        onUploadFigure={upload}
      />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "g.png", { type: "image/png" })] } });
    const retry = await screen.findByRole("button", { name: "重试上传 g.png" });
    fireEvent.click(retry);
    await waitFor(() =>
      expect(onValue).toHaveBeenLastCalledWith(
        expect.objectContaining({ stem: "如图\n\n![](import/new.png)" }),
      ),
    );
    expect(upload).toHaveBeenCalledTimes(2);
    // 重试传的是同一个 File，不必回文件对话框里重新找一遍
    expect(upload.mock.calls[1][0]).toBe(upload.mock.calls[0][0]);
    expect(screen.queryByRole("button", { name: "重试上传 g.png" })).toBeNull();
  });

  it("没给 onUploadFigure 时没有「插入图片」", () => {
    render(<Harness initial={single()} />);
    expect(screen.queryByRole("button", { name: "插入图片" })).toBeNull();
  });

  it("disabled 时输入与按钮全部禁用", () => {
    render(<Harness initial={single()} disabled />);
    expect((screen.getByLabelText("题干") as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "添加选项" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText("分值") as HTMLInputElement).disabled).toBe(true);
  });

  it("enUS 下英文站零中文", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Harness
          initial={{
            ...single(),
            stem: "Which is right",
            options: [
              { key: "A", text: "a" },
              { key: "B", text: "b" },
            ],
          }}
          showAllIssues
        />
      </ConfigProvider>,
    );
    expect(container.textContent).not.toMatch(CJK);
    for (const el of container.querySelectorAll("[aria-label], [placeholder]")) {
      expect(el.getAttribute("aria-label") ?? "").not.toMatch(CJK);
      expect(el.getAttribute("placeholder") ?? "").not.toMatch(CJK);
    }
  });
});
