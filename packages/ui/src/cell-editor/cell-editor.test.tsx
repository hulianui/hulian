import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { CellEditor } from "./cell-editor";
import type { CellEditorBaseProps, CellEditorProps } from "./cell-editor.types";

/**
 * 探针属性：把单行 / 多行两档并成一套。CellEditorProps 是按 `multiline` 分叉的判别联合，
 * 用例里的 `multiline` 是变量而不是字面量，逐个用例断言太吵 —— 断言收在下面两处渲染点。
 */
type CellProbeProps = Partial<CellEditorBaseProps> & { multiline?: boolean } & Omit<
    InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> &
      TextareaHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
    "onChange" | "defaultValue" | "value" | "size"
  >;

/** 逐格编辑的真实用法：父级持有已提交值，onCommit 回来才写回。 */
function Controlled({ initial, onCommit, ...rest }: CellProbeProps & { initial: string }) {
  const [value, setValue] = useState(initial);
  const props = {
    "aria-label": "cell",
    value,
    onCommit: async (next: string) => {
      await onCommit?.(next);
      setValue(next);
    },
    ...rest,
  } as CellEditorProps;
  return <CellEditor {...props} />;
}

function renderCell(props: CellProbeProps = {}) {
  const onCommit = vi.fn();
  const { value = "原值", ...rest } = props;
  const merged = { "aria-label": "cell", value, onCommit, ...rest } as CellEditorProps;
  const view = render(<CellEditor {...merged} />);
  const el = view.getByLabelText("cell") as HTMLInputElement | HTMLTextAreaElement;
  return { ...view, el, onCommit };
}

describe("CellEditor 提交时机", () => {
  it("blur 提交改动后的值", () => {
    const { el, onCommit } = renderCell();
    fireEvent.change(el, { target: { value: "改过了" } });
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("改过了");
  });

  it("Enter 提交（单行档）", () => {
    const { el, onCommit } = renderCell();
    fireEvent.change(el, { target: { value: "回车提交" } });
    fireEvent.keyDown(el, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("回车提交");
  });

  it("Enter 提交（多行档）", () => {
    const { el, onCommit } = renderCell({ multiline: true });
    fireEvent.change(el, { target: { value: "多行也提交" } });
    fireEvent.keyDown(el, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("多行也提交");
  });

  it("Shift+Enter 是换行，不提交", () => {
    const { el, onCommit } = renderCell({ multiline: true });
    fireEvent.change(el, { target: { value: "第一行" } });
    const prevented = !fireEvent.keyDown(el, { key: "Enter", shiftKey: true });
    expect(prevented).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("Enter 之后再 blur 不重复提交", () => {
    const { el, onCommit } = renderCell();
    fireEvent.change(el, { target: { value: "只发一次" } });
    fireEvent.keyDown(el, { key: "Enter" });
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});

describe("CellEditor 判等", () => {
  it("值没变不提交（点进去看一眼再点走）", () => {
    const { el, onCommit } = renderCell();
    fireEvent.focus(el);
    fireEvent.blur(el);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("改完又手动改回原值也不提交", () => {
    const { el, onCommit } = renderCell({ value: "原值" });
    fireEvent.change(el, { target: { value: "中途改的" } });
    fireEvent.change(el, { target: { value: "原值" } });
    fireEvent.blur(el);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("提交后再 blur 不发第二次", () => {
    const { el, onCommit } = renderCell();
    fireEvent.change(el, { target: { value: "一次" } });
    fireEvent.blur(el);
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});

describe("CellEditor Esc 回滚", () => {
  it("Esc 回滚到进入编辑前的值且不提交", () => {
    const { el, onCommit } = renderCell({ value: "原值" });
    fireEvent.change(el, { target: { value: "改坏了" } });
    fireEvent.keyDown(el, { key: "Escape" });
    expect(el.value).toBe("原值");
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("Esc 之后紧跟的 blur 也不能提交旧值", () => {
    const { el, onCommit } = renderCell({ value: "原值" });
    fireEvent.change(el, { target: { value: "改坏了" } });
    fireEvent.keyDown(el, { key: "Escape" });
    fireEvent.blur(el);
    expect(onCommit).not.toHaveBeenCalled();
    expect(el.value).toBe("原值");
  });

  it("Esc 回滚的基准是上一次提交值，不是首次挂载值", () => {
    const { el, onCommit } = renderCell({ value: "原值" });
    fireEvent.change(el, { target: { value: "第一次提交" } });
    fireEvent.blur(el);
    fireEvent.change(el, { target: { value: "第二次乱改" } });
    fireEvent.keyDown(el, { key: "Escape" });
    expect(el.value).toBe("第一次提交");
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("第一次提交");
  });
});

// #244：失焦即提交的表格里，非法值不该「先写进去再回滚」——那时光标已经在下一格，
// 用户看到的是自己改的东西自己变回去了。
describe("CellEditor 提交前校验", () => {
  const rejectShort = (next: string) => (next.length < 3 ? "至少 3 个字" : undefined);

  it("validate 返回错误串时拦住 onCommit，并把该串渲染出来", () => {
    const { el, onCommit, getByText } = renderCell({ validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.blur(el);
    expect(onCommit).not.toHaveBeenCalled();
    expect(getByText("至少 3 个字")).toBeTruthy();
  });

  it("被拦住时草稿不回滚，且红线走 cell 档已有的 data-invalid", () => {
    const { el } = renderCell({ validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.blur(el);
    expect(el.value).toBe("短");
    expect(el.getAttribute("data-invalid")).not.toBeNull();
    expect(el.getAttribute("aria-invalid")).toBe("true");
  });

  it("错误串通过 aria-describedby 挂到控件上", () => {
    const { el, getByText } = renderCell({ validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.blur(el);
    expect(el.getAttribute("aria-describedby")).toBe(getByText("至少 3 个字").id);
  });

  it("Enter 路径同样被拦", () => {
    const { el, onCommit, getByText } = renderCell({ validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.keyDown(el, { key: "Enter" });
    expect(onCommit).not.toHaveBeenCalled();
    expect(getByText("至少 3 个字")).toBeTruthy();
  });

  it("拦住后判等基准不推进：同一个非法值再 blur 仍然拦，改对了才提交", () => {
    const { el, onCommit, getByText, queryByText } = renderCell({ validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.blur(el);
    fireEvent.blur(el);
    expect(onCommit).not.toHaveBeenCalled();
    expect(getByText("至少 3 个字")).toBeTruthy();

    fireEvent.change(el, { target: { value: "改够长了" } });
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledWith("改够长了");
    expect(queryByText("至少 3 个字")).toBeNull();
  });

  it("开始输入即撤掉红线（那条错误说的是刚才那一版）", () => {
    const { el, queryByText } = renderCell({ validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.blur(el);
    expect(queryByText("至少 3 个字")).toBeTruthy();
    fireEvent.change(el, { target: { value: "短短" } });
    expect(queryByText("至少 3 个字")).toBeNull();
  });

  it("Esc 回滚同时清掉错误", () => {
    const { el, queryByText } = renderCell({ value: "原来的值", validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.blur(el);
    expect(queryByText("至少 3 个字")).toBeTruthy();
    fireEvent.keyDown(el, { key: "Escape" });
    expect(el.value).toBe("原来的值");
    expect(queryByText("至少 3 个字")).toBeNull();
  });

  it("改回上次提交值时撤掉错误（判等短路那条路也要收拾干净）", () => {
    const { el, queryByText } = renderCell({ value: "原来的值", validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.blur(el);
    expect(queryByText("至少 3 个字")).toBeTruthy();
    fireEvent.change(el, { target: { value: "原来的值" } });
    fireEvent.blur(el);
    expect(queryByText("至少 3 个字")).toBeNull();
  });

  it("值没变时根本不校验（点进去看一眼再点走）", () => {
    const validate = vi.fn(() => "不该被调用");
    const { el } = renderCell({ validate });
    fireEvent.focus(el);
    fireEvent.blur(el);
    expect(validate).not.toHaveBeenCalled();
  });

  it("多行档同样拦", () => {
    const { el, onCommit, getByText } = renderCell({ multiline: true, validate: rejectShort });
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.blur(el);
    expect(onCommit).not.toHaveBeenCalled();
    expect(getByText("至少 3 个字")).toBeTruthy();
    expect(el.getAttribute("data-invalid")).not.toBeNull();
  });

  it("返回空串按放行处理：看不见的错误却拦着提交，比不校验更糟", () => {
    const { el, onCommit, container } = renderCell({ validate: () => "" });
    fireEvent.change(el, { target: { value: "随便" } });
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledWith("随便");
    expect(container.querySelector(".text-danger")).toBeNull();
  });

  it("不传 validate 时渲染与从前逐字相同（无错误节点、无 data-invalid）", () => {
    const { el, container } = renderCell();
    fireEvent.change(el, { target: { value: "随便" } });
    fireEvent.blur(el);
    expect(container.childElementCount).toBe(1);
    expect(el.getAttribute("data-invalid")).toBeNull();
    expect(el.getAttribute("aria-describedby")).toBeNull();
  });
});

describe("CellEditor 异步提交", () => {
  it("onCommit 返回 Promise 时 pending 期间自禁用，resolve 后恢复", async () => {
    let resolveCommit: (() => void) | undefined;
    const { el } = renderCell({
      onCommit: () =>
        new Promise<void>((resolve) => {
          resolveCommit = resolve;
        }),
    });
    fireEvent.change(el, { target: { value: "存盘中" } });
    fireEvent.blur(el);
    expect(el.disabled).toBe(true);
    await act(async () => {
      resolveCommit?.();
    });
    expect(el.disabled).toBe(false);
  });

  it("onCommit 抛错也要退出 pending 态", async () => {
    const { el } = renderCell({ onCommit: () => Promise.reject(new Error("网络挂了")) });
    fireEvent.change(el, { target: { value: "会失败" } });
    fireEvent.blur(el);
    expect(el.disabled).toBe(true);
    await waitFor(() => expect(el.disabled).toBe(false));
  });

  it("同步 onCommit 不留下 pending 态", () => {
    const { el } = renderCell();
    fireEvent.change(el, { target: { value: "同步" } });
    fireEvent.blur(el);
    expect(el.disabled).toBe(false);
  });
});

describe("CellEditor 视觉", () => {
  it("多行档自增高走 CSS field-sizing-content，不测高", () => {
    const { el } = renderCell({ multiline: true });
    expect(el.tagName).toBe("TEXTAREA");
    expect(el.className).toContain("field-sizing-content");
    expect(el.getAttribute("style")).toBeNull();
  });

  it("单行档是 input", () => {
    const { el } = renderCell();
    expect(el.tagName).toBe("INPUT");
  });

  it("静止态无边框透明底（复用 cell 皮肤）", () => {
    const { container } = renderCell();
    const shell = container.firstElementChild!;
    expect(shell.className).toContain("border-0");
    expect(shell.className).toContain("bg-transparent");
  });

  it("missing 为真时 muted + italic", () => {
    const { container, el } = renderCell({ missing: true, value: "" });
    expect(container.firstElementChild!.className).toContain("italic");
    expect(container.firstElementChild!.className).toContain("[&_input]:text-muted-foreground");
    expect(el.tagName).toBe("INPUT");
  });

  it("missing 多行档直接给 muted + italic", () => {
    const { el } = renderCell({ missing: true, multiline: true, value: "" });
    expect(el.className).toContain("italic");
    expect(el.className).toContain("text-muted-foreground");
  });

  it("missing 为假时不降级", () => {
    const { container } = renderCell();
    expect(container.firstElementChild!.className).not.toContain("italic");
  });
});

describe("CellEditor 透传", () => {
  it("placeholder / aria-label / className 落到位", () => {
    const { container, el } = renderCell({ placeholder: "未填写", className: "cell-x" });
    expect(el.getAttribute("placeholder")).toBe("未填写");
    expect(el.getAttribute("aria-label")).toBe("cell");
    expect(container.firstElementChild!.className).toContain("cell-x");
  });

  it("disabled 时不可编辑", () => {
    const { el } = renderCell({ disabled: true });
    expect(el.disabled).toBe(true);
  });

  it("消费方的 onBlur / onKeyDown 仍然会被调用", () => {
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    const { el } = renderCell({ onBlur, onKeyDown });
    fireEvent.keyDown(el, { key: "Escape" });
    fireEvent.blur(el);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

// #248：同一行里其余列是普通输入框时，只有这几格没边框会让用户靠记忆判断哪些能改。
describe("CellEditor 档位透传", () => {
  it("variant=default 换回有边框的普通输入框", () => {
    const { container } = renderCell({ variant: "default" });
    const shell = container.firstElementChild!;
    expect(shell.className).toContain("border-border");
    expect(shell.className).not.toContain("border-0");
  });

  it("size 落到内层 Input 的档位上", () => {
    const { container } = renderCell({ variant: "default", size: "sm" });
    expect(container.firstElementChild!.className).toContain("h-8");
  });

  it("多行档同样吃 variant / size", () => {
    const { el } = renderCell({ multiline: true, variant: "default", size: "xs" });
    expect(el.className).toContain("border-border");
    expect(el.className).toContain("text-xs");
  });

  it("不传时仍是 cell 档（与从前逐字相同）", () => {
    const { container } = renderCell();
    const shell = container.firstElementChild!;
    expect(shell.className).toContain("border-0");
    expect(shell.className).toContain("bg-transparent");
  });
});

// #249：随打字变化的派生 UI（已填计数、实时预览、每键落 localStorage）需要一个落点，
// 换成 onCommit 就从「边打字边存」变成「失焦才存」，那是功能改动不是等价迁移。
describe("CellEditor onDraftChange", () => {
  it("每次键入都广播当前草稿", () => {
    const onDraftChange = vi.fn();
    const { el } = renderCell({ onDraftChange });
    fireEvent.change(el, { target: { value: "一" } });
    fireEvent.change(el, { target: { value: "一二" } });
    expect(onDraftChange.mock.calls).toEqual([["一"], ["一二"]]);
  });

  it("只是回声：不影响判等 / 校验 / onCommit 的既有时机", () => {
    const onDraftChange = vi.fn();
    const validate = (next: string) => (next.length < 3 ? "至少 3 个字" : undefined);
    const { el, onCommit } = renderCell({ onDraftChange, validate });
    fireEvent.change(el, { target: { value: "短" } });
    expect(onDraftChange).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.blur(el);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("Esc 回滚与外部写回不算键入，不广播", () => {
    const onDraftChange = vi.fn();
    const { el, rerender } = renderCell({ onDraftChange, value: "原值" });
    fireEvent.change(el, { target: { value: "改坏了" } });
    fireEvent.keyDown(el, { key: "Escape" });
    rerender(<CellEditor aria-label="cell" value="别处改的" onDraftChange={onDraftChange} />);
    expect(onDraftChange).toHaveBeenCalledTimes(1);
  });
});

// #250：reject 恰恰证明这个值没交出去，基准却已经推进 —— 用户不改动直接再失焦会被判等短路，
// 保存失败之后连重试都点不动。而 value 来自服务端缓存时失败并不会让它变，消费方手上没有杠杆。
describe("CellEditor 提交失败", () => {
  function renderRejecting(props: CellProbeProps = {}) {
    let rejectCommit: ((reason: Error) => void) | undefined;
    const onCommit = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectCommit = reject;
        }),
    );
    const view = renderCell({ ...props, onCommit });
    return { ...view, onCommit, reject: () => rejectCommit?.(new Error("网络挂了")) };
  }

  it("失败后不改动直接再失焦即重试（基准退回上一版）", async () => {
    const { el, onCommit, reject } = renderRejecting();
    fireEvent.change(el, { target: { value: "会失败" } });
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledTimes(1);
    await act(async () => {
      reject();
    });
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledTimes(2);
    expect(onCommit).toHaveBeenLastCalledWith("会失败");
  });

  it("默认不回滚草稿：用户刚打的那串还在，接着改就是", async () => {
    const { el, reject } = renderRejecting();
    fireEvent.change(el, { target: { value: "会失败" } });
    fireEvent.blur(el);
    await act(async () => {
      reject();
    });
    expect(el.value).toBe("会失败");
  });

  it("revertOnError 时草稿一并退回上一次提交值", async () => {
    const { el, reject } = renderRejecting({ value: "原值", revertOnError: true });
    fireEvent.change(el, { target: { value: "会失败" } });
    fireEvent.blur(el);
    await act(async () => {
      reject();
    });
    expect(el.value).toBe("原值");
  });

  it("pending 期间外部写进来的新值不会被这次失败盖回去", async () => {
    let rejectCommit: ((reason: Error) => void) | undefined;
    const onCommit = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectCommit = reject;
        }),
    );
    const view = render(
      <CellEditor aria-label="cell" value="原值" revertOnError onCommit={onCommit} />,
    );
    const el = view.getByLabelText("cell") as HTMLInputElement;
    fireEvent.change(el, { target: { value: "会失败" } });
    fireEvent.blur(el);
    view.rerender(
      <CellEditor aria-label="cell" value="别处刚改的" revertOnError onCommit={onCommit} />,
    );
    await act(async () => {
      rejectCommit?.(new Error("网络挂了"));
    });
    expect(el.value).toBe("别处刚改的");
    // 判等基准也停在外部值上：不改动再失焦不会把它当新值重发一次。
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it("成功路径不受影响：resolve 之后再失焦不重发", async () => {
    const onCommit = vi.fn(() => Promise.resolve());
    const { el } = renderCell({ onCommit });
    fireEvent.change(el, { target: { value: "存好了" } });
    fireEvent.blur(el);
    await waitFor(() => expect(el.disabled).toBe(false));
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});

// #251：内层渲染的就是 <input> / <textarea>，而属性集此前继承的是 HTMLAttributes，
// name / rows / type / maxLength / autoComplete 一个都传不进去。
describe("CellEditor 原生属性", () => {
  it("单行档收 <input> 的属性", () => {
    const { el } = renderCell({ name: "months", maxLength: 4, type: "text", autoComplete: "off" });
    expect(el.getAttribute("name")).toBe("months");
    expect(el.getAttribute("maxlength")).toBe("4");
    expect(el.getAttribute("type")).toBe("text");
    expect(el.getAttribute("autocomplete")).toBe("off");
  });

  it("多行档收 <textarea> 的 rows（每格不同的行数下限）", () => {
    const { el } = renderCell({ multiline: true, rows: 2, name: "scope" });
    expect((el as HTMLTextAreaElement).rows).toBe(2);
    expect(el.getAttribute("name")).toBe("scope");
  });
});

// #252：焦点留在格内是合理默认，但消费方在 onKeyDown 里自己补 blur() 会踩 stale draft ——
// blur() 同步触发提交时闭包里还是旧草稿，Esc 于是变成保存。
describe("CellEditor 提交后让出焦点", () => {
  it("默认不让出：Enter 之后焦点还在格内", () => {
    const { el } = renderCell();
    el.focus();
    fireEvent.change(el, { target: { value: "改完了" } });
    fireEvent.keyDown(el, { key: "Enter" });
    expect(document.activeElement).toBe(el);
  });

  it("blurOnCommit 时 Enter 提交后让出焦点，且只提交一次", () => {
    const { el, onCommit } = renderCell({ blurOnCommit: true });
    el.focus();
    fireEvent.change(el, { target: { value: "改完了" } });
    fireEvent.keyDown(el, { key: "Enter" });
    expect(document.activeElement).not.toBe(el);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("改完了");
  });

  it("校验被拦下时不让出焦点：错误就在这一格，得让用户接着改", () => {
    const { el, onCommit } = renderCell({
      blurOnCommit: true,
      validate: (next) => (next.length < 3 ? "至少 3 个字" : undefined),
    });
    el.focus();
    fireEvent.change(el, { target: { value: "短" } });
    fireEvent.keyDown(el, { key: "Enter" });
    expect(document.activeElement).toBe(el);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("blurOnEscape 时按 Esc 让出焦点，随之而来的 blur 不会把丢弃的草稿存下去", () => {
    const { el, onCommit } = renderCell({ value: "原值", blurOnEscape: true });
    el.focus();
    fireEvent.change(el, { target: { value: "改坏了" } });
    fireEvent.keyDown(el, { key: "Escape" });
    expect(document.activeElement).not.toBe(el);
    expect(onCommit).not.toHaveBeenCalled();
    expect(el.value).toBe("原值");
  });

  it("blurOnEscape 关着时 Esc 只回滚，不动焦点", () => {
    const { el } = renderCell({ value: "原值" });
    el.focus();
    fireEvent.change(el, { target: { value: "改坏了" } });
    fireEvent.keyDown(el, { key: "Escape" });
    expect(document.activeElement).toBe(el);
    expect(el.value).toBe("原值");
  });

  it("让出焦点排在消费方的 onKeyDown 之后", () => {
    const order: string[] = [];
    const { el } = renderCell({
      blurOnCommit: true,
      onKeyDown: () => order.push("keydown"),
      onBlur: () => order.push("blur"),
    });
    el.focus();
    fireEvent.change(el, { target: { value: "改完了" } });
    fireEvent.keyDown(el, { key: "Enter" });
    expect(order).toEqual(["keydown", "blur"]);
  });
});

describe("CellEditor 外部值", () => {
  it("父级写回新值后同步进草稿", () => {
    const { el, rerender } = renderCell({ value: "旧的" });
    expect(el.value).toBe("旧的");
    rerender(<CellEditor aria-label="cell" value="外部改的" />);
    expect(el.value).toBe("外部改的");
  });

  it("提交回写后判等基准跟着走，再 blur 不重发", async () => {
    const onCommit = vi.fn();
    const { getByLabelText } = render(<Controlled initial="原值" onCommit={onCommit} />);
    const el = getByLabelText("cell") as HTMLInputElement;
    fireEvent.change(el, { target: { value: "新值" } });
    fireEvent.blur(el);
    await waitFor(() => expect(el.value).toBe("新值"));
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
