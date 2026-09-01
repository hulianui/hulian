import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import type { MathFieldLikeProps } from "../math-textarea/math-textarea.types";
import type { StudentAnswer } from "../question/question.types";
import { QuestionAnswer } from "./question-answer";
import type { AnswerableQuestion, QuestionAnswerProps } from "./question-answer.types";

const CJK = /[㐀-䶿一-鿿]/u;

function Harness({
  initial,
  onValue,
  ...rest
}: { initial?: StudentAnswer; onValue?: (v: StudentAnswer) => void } & Omit<QuestionAnswerProps, "value" | "onChange">) {
  const [value, setValue] = useState<StudentAnswer | undefined>(initial);
  return (
    <QuestionAnswer
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

const single: AnswerableQuestion = {
  type: "single",
  stem: "下列正确的是",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
  ],
};
const multiple: AnswerableQuestion = {
  type: "multiple",
  stem: "下列正确的有",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
    { key: "C", text: "丙" },
  ],
};
const judge: AnswerableQuestion = { type: "judge", stem: "对顶角相等", options: null };
const twoBlanks: AnswerableQuestion = { type: "blank", stem: "甲____乙____", options: null, blankCount: 2 };
const oneBlank: AnswerableQuestion = { type: "blank", stem: "答案是____", options: null, blankCount: 1 };

const isLocked = (el: HTMLElement) => el.getAttribute("aria-disabled") === "true" || el.hasAttribute("data-disabled");

afterEach(() => vi.restoreAllMocks());

describe("QuestionAnswer：三条曾静默让学生「答不了」的 bug", () => {
  it('回归：判断题 options 为 null 时仍有「正确 / 错误」两项，选中后回传 "false"', () => {
    const onValue = vi.fn();
    render(<Harness question={judge} onValue={onValue} />);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: "错误" }));
    expect(onValue).toHaveBeenLastCalledWith("false");
    expect(screen.getByRole("radio", { name: "错误" }).getAttribute("aria-checked")).toBe("true");
  });

  it("回归：多空填空按 blankCount 给两个输入框，逐空回传数组", () => {
    const onValue = vi.fn();
    render(<Harness question={twoBlanks} onValue={onValue} />);
    const first = screen.getByLabelText("第 1 空");
    const second = screen.getByLabelText("第 2 空");
    fireEvent.change(first, { target: { value: "150" } });
    expect(onValue).toHaveBeenLastCalledWith(["150", ""]);
    fireEvent.change(second, { target: { value: "30" } });
    expect(onValue).toHaveBeenLastCalledWith(["150", "30"]);
  });

  it("回归：对象形 options 不被滤空，每个选项都能选，提交值是 key 不是首字符", () => {
    const onValue = vi.fn();
    render(
      <Harness
        question={{
          type: "single",
          stem: "角度",
          options: [
            { key: "A", text: "60°" },
            { key: "B", text: "30°" },
          ],
        }}
        onValue={onValue}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: "A. 60°" }));
    expect(onValue).toHaveBeenLastCalledWith("A");
  });

  it('字符串形 options（无字母前缀）也按下标补字母，提交 "A" 而不是 "6"', () => {
    const onValue = vi.fn();
    render(<Harness question={{ type: "single", stem: "角度", options: ["60°", "30°"] as never }} onValue={onValue} />);
    fireEvent.click(screen.getByRole("radio", { name: "A. 60°" }));
    expect(onValue).toHaveBeenLastCalledWith("A");
  });
});

describe("QuestionAnswer：按题型给控件", () => {
  it("单选：每个选项的无障碍名就是它自己那一行，没有重复", () => {
    render(<Harness question={single} />);
    expect(screen.getByRole("radio", { name: "A. 甲" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "B. 乙" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "单选作答" })).toBeTruthy();
  });

  it("多选：CheckboxGroup，每项无障碍名独立，回传排好序的 key 数组", () => {
    const onValue = vi.fn();
    render(<Harness question={multiple} onValue={onValue} />);
    expect(screen.getByRole("checkbox", { name: "A. 甲" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "C. 丙" })).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "C. 丙" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "A. 甲" }));
    expect(onValue).toHaveBeenLastCalledWith(["A", "C"]);
  });

  it("填空：blankCount 缺失按题干 ____ 数；都没有按 1 且不标空号", () => {
    const { unmount } = render(<Harness question={{ type: "blank", stem: "甲____乙____丙", options: null }} />);
    expect(screen.getByLabelText("第 1 空")).toBeTruthy();
    expect(screen.getByLabelText("第 2 空")).toBeTruthy();
    unmount();
    render(<Harness question={{ type: "blank", stem: "没有下划线", options: null }} />);
    expect(screen.getByLabelText("填空作答")).toBeTruthy();
    expect(screen.queryByText("第 1 空")).toBeNull();
  });

  it("续做：value 传服务端记的多空 JSON 字面量，输入框预填", () => {
    render(<Harness question={twoBlanks} initial={'["150","30"]'} />);
    expect((screen.getByLabelText("第 1 空") as HTMLInputElement).value).toBe("150");
    expect((screen.getByLabelText("第 2 空") as HTMLInputElement).value).toBe("30");
  });

  it("选项缺失：明说做不了，不渲染选项组，也不出提交按钮", () => {
    render(<Harness question={{ type: "single", stem: "题干", options: null }} onSubmit={() => {}} />);
    expect(screen.getByText("这道题暂时没法作答")).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("主观题：只读题面 + 「此题需教师批阅」，不出提交按钮", () => {
    render(<Harness question={{ type: "essay", stem: "证明", options: null }} onSubmit={() => {}} />);
    expect(screen.getByText("此题需教师批阅")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("未知题型：按主观题只读并 warnOnce（两次渲染只告警一次）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<Harness question={{ type: "matching", stem: "连线", options: null }} />);
    rerender(<Harness question={{ type: "matching", stem: "连线", options: null }} />);
    expect(screen.getByText("此题需教师批阅")).toBeTruthy();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("QuestionAnswer");
  });
});

describe("QuestionAnswer：提交", () => {
  it("没给 onSubmit 就没有提交按钮", () => {
    render(<Harness question={single} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("多空填一半按钮禁用，全填才能交，交的是逐空数组", () => {
    const onSubmit = vi.fn();
    render(<Harness question={twoBlanks} onSubmit={onSubmit} />);
    const button = screen.getByRole("button", { name: "提交答案" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("第 1 空"), { target: { value: "150" } });
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("第 2 空"), { target: { value: "30" } });
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith(["150", "30"]);
  });

  it("单空也交一项数组（压平是消费方 encodeBlanks 的事）", () => {
    const onSubmit = vi.fn();
    render(<Harness question={oneBlank} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("填空作答"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(onSubmit).toHaveBeenCalledWith(["7"]);
  });

  it("单选交 key 字符串", () => {
    const onSubmit = vi.fn();
    render(<Harness question={single} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("radio", { name: "B. 乙" }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(onSubmit).toHaveBeenCalledWith("B");
  });

  it("pending：按钮禁用、选项锁定", () => {
    render(<Harness question={single} initial="A" onSubmit={() => {}} pending />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(isLocked(screen.getByRole("radio", { name: "A. 甲" }))).toBe(true);
  });

  it("disabled：选项锁定、按钮禁用", () => {
    render(<Harness question={single} initial="A" onSubmit={() => {}} disabled />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(isLocked(screen.getByRole("radio", { name: "A. 甲" }))).toBe(true);
  });
});

describe("QuestionAnswer：结果区", () => {
  it("答错：回答错误 + 正确答案文字 + 解析，控件锁定，按钮变「已提交」并禁用", () => {
    render(
      <Harness
        question={single}
        initial="B"
        onSubmit={() => {}}
        result={{ correct: false, correctAnswer: "A", analysis: "由定义得 A" }}
      />,
    );
    expect(screen.getByText("回答错误")).toBeTruthy();
    expect(screen.getByText(/正确答案 A/)).toBeTruthy();
    expect(screen.getByText(/由定义得 A/)).toBeTruthy();
    expect(isLocked(screen.getByRole("radio", { name: "A. 甲" }))).toBe(true);
    const button = screen.getByRole("button", { name: "已提交" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("答对：回答正确 + correctHint，不重复印正确答案", () => {
    render(
      <Harness
        question={judge}
        initial="true"
        result={{ correct: true, correctAnswer: true }}
        correctHint="下次不会再推给你"
      />,
    );
    expect(screen.getByText("回答正确")).toBeTruthy();
    expect(screen.getByText("下次不会再推给你")).toBeTruthy();
    expect(screen.queryByText(/正确答案/)).toBeNull();
  });

  it("判断题答错：正确答案印成「正确 / 错误」而不是 true / false", () => {
    render(<Harness question={judge} initial="false" result={{ correct: false, correctAnswer: true }} />);
    expect(screen.getByText(/正确答案 正确/)).toBeTruthy();
  });

  it("多空填空答错：正确答案按空号列出", () => {
    render(
      <Harness question={twoBlanks} initial={["1", "2"]} result={{ correct: false, correctAnswer: ["150", "30"] }} />,
    );
    expect(screen.getByText(/第1空：150/)).toBeTruthy();
  });
});

describe("QuestionAnswer：题干、头部与注入", () => {
  it("resolveFigure：题干里的图切出来渲染成 img", () => {
    const { container } = render(
      <Harness question={{ ...single, stem: "如图\n\n![](import/a.png)" }} resolveFigure={(key) => `/files/${key}`} />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/files/import/a.png");
    expect(container.textContent).not.toContain("![](");
  });

  it("renderStem 覆盖缺省题干渲染", () => {
    render(<Harness question={single} renderStem={(stem) => <div data-testid="custom">{stem}</div>} />);
    expect(screen.getByTestId("custom").textContent).toBe("下列正确的是");
  });

  it("头部：题型标签 / 知识点 / 难度星 / header；reason 行", () => {
    render(
      <Harness
        question={{ ...single, difficulty: 3, topics: ["三角函数"] }}
        header={<span>第 3 题</span>}
        reason="上次这类题错了"
      />,
    );
    expect(screen.getByText("单选")).toBeTruthy();
    expect(screen.getByText("三角函数")).toBeTruthy();
    expect(screen.getByLabelText("难度 3 / 5").textContent).toBe("★★★");
    expect(screen.getByText("第 3 题")).toBeTruthy();
    expect(screen.getByText("上次这类题错了")).toBeTruthy();
  });

  it('blankInput="math" + mathField：每空渲染注入的组件，onChange 回流，已作答时 disabled', () => {
    const Stub = ({ value, onChange, disabled, "aria-label": label }: MathFieldLikeProps) => (
      <input
        data-testid="mf"
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    );
    const onValue = vi.fn();
    const { rerender } = render(<Harness question={oneBlank} blankInput="math" mathField={Stub} onValue={onValue} />);
    fireEvent.change(screen.getByTestId("mf"), { target: { value: "x^2" } });
    expect(onValue).toHaveBeenLastCalledWith(["x^2"]);
    rerender(
      <Harness question={oneBlank} blankInput="math" mathField={Stub} result={{ correct: true, correctAnswer: "x^2" }} />,
    );
    expect((screen.getByTestId("mf") as HTMLInputElement).disabled).toBe(true);
  });

  it('blankInput="math" 没给 mathField：回落成文本输入框并 warnOnce', () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Harness question={oneBlank} blankInput="math" />);
    expect(screen.getByLabelText("填空作答")).toBeTruthy();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("mathField");
  });

  it("enUS 下整卡无中文", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Harness
          question={{
            type: "judge",
            stem: "Vertical angles are equal",
            options: null,
            difficulty: 2,
            topics: ["Angles"],
          }}
          initial="false"
          onSubmit={() => {}}
          result={{ correct: false, correctAnswer: true, analysis: "By definition" }}
        />
      </ConfigProvider>,
    );
    expect(container.textContent ?? "").not.toMatch(CJK);
    expect(screen.getByRole("button", { name: "Submitted" })).toBeTruthy();
    expect(screen.getByText(/Correct answer True/)).toBeTruthy();
  });
});
