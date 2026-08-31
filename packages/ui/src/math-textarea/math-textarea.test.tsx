import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { MathTextarea } from "./math-textarea";
import type { MathFieldLikeProps, MathTextareaProps } from "./math-textarea.types";

const CJK = /[㐀-䶿一-鿿]/u;

function Harness({
  initial,
  onValue,
  ...rest
}: { initial: string; onValue?: (v: string) => void } & Omit<MathTextareaProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <MathTextarea
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

function FakeMathField({ value, onChange, "aria-label": ariaLabel }: MathFieldLikeProps) {
  return (
    <input
      aria-label={ariaLabel ?? "fake"}
      data-testid="fake-field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

async function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: "公式" }));
  return screen.findByRole("button", { name: "插入分式" });
}

describe("MathTextarea", () => {
  it("默认单行渲染 Input；multiline 渲染 Textarea", () => {
    const { rerender } = render(<Harness initial="" aria-label="选项 A" />);
    expect(screen.getByLabelText("选项 A").tagName).toBe("INPUT");
    rerender(<Harness initial="" aria-label="题干" multiline />);
    expect(screen.getByLabelText("题干").tagName).toBe("TEXTAREA");
  });

  it("模板插到光标处，重渲染后光标落回第一个空槽", async () => {
    const onValue = vi.fn();
    render(<Harness initial="已知 " aria-label="题干" multiline onValue={onValue} />);
    const el = screen.getByLabelText("题干") as HTMLTextAreaElement;
    el.setSelectionRange(3, 3);
    const fraction = await openPanel();
    fireEvent.click(fraction);
    expect(onValue).toHaveBeenLastCalledWith("已知 $\\frac{}{}$");
    await waitFor(() => expect(el.selectionStart).toBe(10));
    expect(document.activeElement).toBe(el);
  });

  it("选中一段再点模板：选中内容进第一个槽", async () => {
    const onValue = vi.fn();
    render(<Harness initial="求 x 的值" aria-label="题干" multiline onValue={onValue} />);
    const el = screen.getByLabelText("题干") as HTMLTextAreaElement;
    el.setSelectionRange(2, 3);
    fireEvent.click(await openPanel());
    expect(onValue).toHaveBeenLastCalledWith("求 $\\frac{x}{}$ 的值");
  });

  it("光标已在公式内：模板不再套一层 $", async () => {
    const onValue = vi.fn();
    render(<Harness initial="$x + $" aria-label="题干" onValue={onValue} />);
    const el = screen.getByLabelText("题干") as HTMLInputElement;
    el.setSelectionRange(5, 5);
    await openPanel();
    fireEvent.click(screen.getByRole("button", { name: "插入根式" }));
    expect(onValue).toHaveBeenLastCalledWith("$x + \\sqrt{}$");
  });

  it("「行内公式」把选区框成 $…$", async () => {
    const onValue = vi.fn();
    render(<Harness initial="求 x+1 的值" aria-label="题干" onValue={onValue} />);
    const el = screen.getByLabelText("题干") as HTMLInputElement;
    el.setSelectionRange(2, 5);
    await openPanel();
    fireEvent.click(screen.getByRole("button", { name: "行内公式 $…$" }));
    expect(onValue).toHaveBeenLastCalledWith("求 $x+1$ 的值");
  });

  it("没有 $ 时显示写法提示；有 $ 后提示消失", () => {
    const { rerender } = render(<Harness key="plain" initial="纯文本" aria-label="题干" />);
    expect(screen.getByText("公式用 $…$ 包起来，如 $x^{2}$")).toBeTruthy();
    // 换 key 重挂载：Harness 的 useState 只认首挂载的 initial。
    rerender(<Harness key="math" initial="$x$" aria-label="题干" />);
    expect(screen.queryByText("公式用 $…$ 包起来，如 $x^{2}$")).toBeNull();
  });

  it("语法错误：报行列，不渲染预览", () => {
    const { container } = render(
      <Harness initial={"第一行\n定价 $100 元"} aria-label="题干" multiline />,
    );
    const error = container.querySelector('[data-slot="math-textarea-error"]');
    expect(error?.textContent).toContain("第 2 行第 4 个字符处的「$」没有闭合");
    expect(container.querySelector('[data-slot="math-textarea-preview"]')).toBeNull();
    expect(container.querySelector(".katex")).toBeNull();
  });

  it("合法公式：预览走 KaTeX，带说明文字", () => {
    const { container } = render(<Harness initial="已知 $x^{2}$" aria-label="题干" />);
    const preview = container.querySelector('[data-slot="math-textarea-preview"]');
    expect(preview?.querySelector(".katex")).not.toBeNull();
    expect(screen.getByText("预览（与题目展示用同一套排版）")).toBeTruthy();
    expect(container.querySelector('[data-slot="math-textarea-katex-error"]')).toBeNull();
  });

  it("KaTeX 解析不了：预览照渲染（标红）+ 给出字符位置与错误信息", () => {
    const { container } = render(<Harness initial={"已知 $\\foo{x}$"} aria-label="题干" />);
    // KaTeX 0.18 对未定义命令做局部恢复：不整段 .katex-error，而是把那一段用 errorColor 标红。
    const preview = container.querySelector('[data-slot="math-textarea-preview"]');
    expect(preview?.querySelector(".katex")).not.toBeNull();
    expect(preview?.innerHTML).toContain("var(--color-danger)");
    const err = container.querySelector('[data-slot="math-textarea-katex-error"]');
    expect(err?.textContent).toContain("第 5 个字符附近");
    expect(err?.textContent).toContain("Undefined control sequence");
  });

  it("compact：预览无说明文字", () => {
    render(<Harness initial={"$\\frac{5}{9}$"} aria-label="选项 A" compact />);
    expect(screen.queryByText("预览（与题目展示用同一套排版）")).toBeNull();
    expect(screen.queryByText(/红色源码/)).toBeNull();
  });

  it("renderPreview 替换默认预览", () => {
    render(
      <Harness
        initial="$x$"
        aria-label="题干"
        renderPreview={(v) => <em data-testid="custom">{v.length}</em>}
      />,
    );
    expect(screen.getByTestId("custom").textContent).toBe("3");
  });

  it("templates 覆盖默认模板组：用自定义 title / label", async () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial=""
        aria-label="题干"
        onValue={onValue}
        templates={[
          {
            id: "vectors",
            title: "向量",
            items: [{ id: "vec", label: "向量", latex: "\\vec{}", sample: "$\\vec{a}$" }],
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "公式" }));
    const vec = await screen.findByRole("button", { name: "插入向量" });
    expect(screen.queryByRole("button", { name: "插入分式" })).toBeNull();
    fireEvent.click(vec);
    expect(onValue).toHaveBeenLastCalledWith("$\\vec{}$");
  });

  it("disabled：公式按钮禁用", () => {
    render(<Harness initial="" aria-label="题干" disabled />);
    expect((screen.getByRole("button", { name: "公式" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("没给 visualEditor 就没有页签；给了才出「可视化输入」", () => {
    const { rerender } = render(<Harness initial="" aria-label="题干" />);
    expect(screen.queryByRole("tab")).toBeNull();
    rerender(<Harness initial="" aria-label="题干" visualEditor={FakeMathField} />);
    expect(screen.getByRole("tab", { name: "可视化输入" })).toBeTruthy();
  });

  it("可视化页签里编辑好 LaTeX 后插入：走同一条插入路径，产出 $…$，并切回源码页签", async () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial="面积 "
        aria-label="题干"
        multiline
        visualEditor={FakeMathField}
        onValue={onValue}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "可视化输入" }));
    const field = await screen.findByTestId("fake-field");
    fireEvent.change(field, { target: { value: "\\sqrt{2}" } });
    fireEvent.click(screen.getByRole("button", { name: "插入到光标处" }));
    expect(onValue).toHaveBeenLastCalledWith("面积 $\\sqrt{2}$");
    await waitFor(() => expect(screen.getByLabelText("题干")).toBeTruthy());
  });

  it("enUS：按钮 / 提示 / 错误全部英文，整棵树零中文", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Harness initial="price $100" aria-label="stem" />
      </ConfigProvider>,
    );
    expect(screen.getByRole("button", { name: "Formula" })).toBeTruthy();
    expect(
      container.querySelector('[data-slot="math-textarea-error"]')?.textContent,
    ).toContain("Line 1, character 7");
    expect(container.textContent).not.toMatch(CJK);
  });
});
