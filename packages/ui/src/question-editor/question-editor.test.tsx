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
