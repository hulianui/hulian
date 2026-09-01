import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { emptyQuestion } from "../question/question-shape";
import type { Question } from "../question/question.types";
import { BlanksSection } from "./question-editor-blanks";
import { FiguresStrip } from "./question-editor-figures";
import { OptionsSection } from "./question-editor-options";
import { SubjectiveSection } from "./question-editor-subjective";
import { QUESTION_EDITOR_LOCALE_ZH as L } from "./question-editor.locale";
import type { SectionContext } from "./question-editor.types";

type Section = (ctx: SectionContext) => ReactNode;

function Harness({
  initial,
  section: Section,
  onValue,
  errors = {},
}: {
  initial: Question;
  section: Section;
  onValue?: (q: Question) => void;
  errors?: SectionContext["errors"];
}) {
  const [value, setValue] = useState(initial);
  return (
    <Section
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
      disabled={false}
      L={L}
      textarea={{}}
      errors={errors}
    />
  );
}

const single = (): Question => ({
  ...emptyQuestion("single"),
  stem: "题干",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
    { key: "C", text: "丙" },
  ],
  answer: "C",
});

describe("OptionsSection", () => {
  it("每个选项一个输入框，无障碍名带字母；删除后答案跟着重排", () => {
    const onValue = vi.fn();
    render(<Harness initial={single()} section={OptionsSection} onValue={onValue} />);
    expect(screen.getByLabelText("选项 A")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "删除选项 A" }));
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: [
          { key: "A", text: "乙" },
          { key: "B", text: "丙" },
        ],
        answer: "B",
      }),
    );
  });

  it("上移 / 下移按钮在首尾禁用；上移后答案跟着内容走", () => {
    const onValue = vi.fn();
    render(<Harness initial={single()} section={OptionsSection} onValue={onValue} />);
    expect((screen.getByRole("button", { name: "上移选项 A" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "下移选项 C" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "上移选项 C" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: "B" }));
  });

  it("添加选项到 8 个为止", () => {
    render(<Harness initial={single()} section={OptionsSection} />);
    const add = screen.getByRole("button", { name: "添加选项" });
    for (let i = 0; i < 6; i++) fireEvent.click(add);
    expect(screen.getAllByLabelText(/^选项 [A-H]$/)).toHaveLength(8);
    expect((add as HTMLButtonElement).disabled).toBe(true);
  });

  it("单选答案是 Segmented，标签带选项文本前 20 字", () => {
    const onValue = vi.fn();
    render(<Harness initial={single()} section={OptionsSection} onValue={onValue} />);
    const a = screen.getByRole("radio", { name: "A 甲" });
    fireEvent.click(a);
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: "A" }));
  });

  it("多选答案是 CheckboxGroup，勾选结果按字母排序", () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial={{ ...single(), type: "multiple", answer: ["C"] }}
        section={OptionsSection}
        onValue={onValue}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "A 甲" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: ["A", "C"] }));
  });

  it("errors.options / errors.answer 挂到对应 Field", () => {
    render(
      <Harness
        initial={single()}
        section={OptionsSection}
        errors={{ options: "选项 A 不能为空", answer: "答案必须在选项范围内" }}
      />,
    );
    expect(screen.getByText("选项 A 不能为空")).toBeTruthy();
    expect(screen.getByText("答案必须在选项范围内")).toBeTruthy();
  });
});

describe("BlanksSection", () => {
  const blank = (): Question => ({ ...emptyQuestion("blank"), stem: "a=____，b=____", answer: ["1", "2"] });

  it("每空一行；加等价写法后多一行输入框", () => {
    const onValue = vi.fn();
    render(<Harness initial={blank()} section={BlanksSection} onValue={onValue} />);
    expect(screen.getByLabelText("第 1 空")).toBeTruthy();
    expect(screen.getByLabelText("第 2 空")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "第 1 空加一种等价写法" }));
    expect(screen.getByLabelText("第 1 空写法 2")).toBeTruthy();
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: [["1", ""], "2"] }));
  });

  it("空数与题干不一致时出提示，一键对齐", () => {
    const onValue = vi.fn();
    render(<Harness initial={{ ...blank(), answer: ["1"] }} section={BlanksSection} onValue={onValue} />);
    expect(screen.getByText("题干有 2 个空，答案有 1 项")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "按题干对齐为 2 空" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: ["1", ""] }));
    expect(screen.queryByText("题干有 2 个空，答案有 1 项")).toBeNull();
  });

  it("只剩一空时删除按钮禁用", () => {
    render(<Harness initial={{ ...blank(), stem: "a=____", answer: ["1"] }} section={BlanksSection} />);
    expect((screen.getByRole("button", { name: "删除第 1 空" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("SubjectiveSection", () => {
  it("简答题：参考答案框，没有分步给分开关", () => {
    render(<Harness initial={emptyQuestion("short_answer")} section={SubjectiveSection} />);
    expect(screen.getByLabelText("参考答案")).toBeTruthy();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("计算题：打开分步给分得到 Rubric，合计与分值并排显示；关掉回到文本", () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial={{ ...emptyQuestion("calculation"), answer: "参考" }}
        section={SubjectiveSection}
        onValue={onValue}
      />,
    );
    fireEvent.click(screen.getByRole("switch", { name: "分步给分" }));
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ answer: { reference: "参考", rubric: [{ point: "" }] } }),
    );
    expect(screen.getByLabelText("得分点 1")).toBeTruthy();
    expect(screen.getByText("得分点合计 0 分，题目分值 8 分")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "添加得分点" }));
    expect(screen.getByLabelText("得分点 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("switch", { name: "分步给分" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: "参考" }));
  });
});

describe("FiguresStrip", () => {
  it("没有图也没有上传回调时什么都不渲染", () => {
    const { container } = render(
      <FiguresStrip keys={[]} disabled={false} onAdd={() => {}} onRemove={() => {}} L={L} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("resolveFigure 给了渲染缩略图，删除回调传 key", () => {
    const onRemove = vi.fn();
    const { container } = render(
      <FiguresStrip
        keys={["import/a.png"]}
        disabled={false}
        resolveFigure={(key) => `/files/${key}`}
        onAdd={() => {}}
        onRemove={onRemove}
        L={L}
      />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/files/import/a.png");
    fireEvent.click(screen.getByRole("button", { name: "删除题图 1" }));
    expect(onRemove).toHaveBeenCalledWith("import/a.png");
  });

  it("没给 resolveFigure：显示 key 文本占位并只告警一次", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <FiguresStrip
        keys={["import/a.png", "import/b.png"]}
        disabled={false}
        onAdd={() => {}}
        onRemove={() => {}}
        L={L}
      />,
    );
    expect(screen.getByText("import/a.png")).toBeTruthy();
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("resolveFigure")).length).toBeLessThanOrEqual(1);
    warn.mockRestore();
  });

  it("选文件 → onUploadFigure → 成功后 onAdd(key)，失败行可关闭", async () => {
    const onAdd = vi.fn();
    const upload = vi
      .fn<(file: File) => Promise<string>>()
      .mockResolvedValueOnce("import/new.png")
      .mockRejectedValueOnce(new Error("太大了"));
    const { container } = render(
      <FiguresStrip
        keys={[]}
        disabled={false}
        onUploadFigure={upload}
        onAdd={onAdd}
        onRemove={() => {}}
        L={L}
      />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "ok.png", { type: "image/png" })] } });
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith("import/new.png"));
    fireEvent.change(input, { target: { files: [new File(["x"], "bad.png", { type: "image/png" })] } });
    await screen.findByText("bad.png 上传失败：太大了");
    fireEvent.click(screen.getByRole("button", { name: "关闭上传提示" }));
    expect(screen.queryByText("bad.png 上传失败：太大了")).toBeNull();
  });
});
