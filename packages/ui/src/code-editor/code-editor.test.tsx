import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { CodeEditor } from "./code-editor";

// ── jsdom 里没有 document.execCommand ────────────────────────────────────────
// 组件的所有键盘增强都通过 execCommand("insertText" | "delete") 落笔，为的是不砸掉
// textarea 的原生 undo 栈（见 code-editor.tsx 的 runEdit 注释）。jsdom 完全没实现
// execCommand，所以这里装一个「行为等价」的桩：按当前选区替换文本 → 用原型上的
// value setter 绕过 React 的 value tracker → 派发真实 input 事件，React 的 onChange
// 才会收到新值（直接 el.value = x 会被 tracker 判成"没变"而静默丢事件）。
// 组件在真实浏览器里走的是同一条分支，桩只补上 jsdom 缺的那一步。
function installExecCommand() {
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )!.set!;
  const impl = vi.fn((command: string, _ui?: boolean, text?: string) => {
    const el = document.activeElement as HTMLTextAreaElement | null;
    if (!el || el.tagName !== "TEXTAREA") return false;
    const insert = command === "delete" ? "" : (text ?? "");
    const next = el.value.slice(0, el.selectionStart) + insert + el.value.slice(el.selectionEnd);
    const caret = el.selectionStart + insert.length;
    setValue.call(el, next);
    el.setSelectionRange(caret, caret);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  });
  (document as unknown as { execCommand: unknown }).execCommand = impl;
  return impl;
}

beforeEach(() => installExecCommand());
afterEach(() => {
  delete (document as unknown as { execCommand?: unknown }).execCommand;
});

/** 受控壳：组件要求 value/onChange 成对，脱开回写编辑会被 React 回滚。 */
function Controlled({
  initial,
  onValue,
  ...rest
}: { initial: string; onValue?: (v: string) => void } & Record<string, unknown>) {
  const [value, setValue] = useState(initial);
  return (
    <CodeEditor
      value={value}
      onChange={(v) => {
        setValue(v);
        onValue?.(v);
      }}
      {...rest}
    />
  );
}

const area = (c: HTMLElement) => c.querySelector("textarea")!;
const gutterLines = (c: HTMLElement) =>
  c.querySelectorAll('[data-slot="code-editor-gutter"] > div');
const codeLines = (c: HTMLElement) =>
  c.querySelectorAll('[data-slot="code-editor-highlight"] > div');

/** 把光标放到指定位置后按键（jsdom 不会自己维护选区）。 */
function press(el: HTMLTextAreaElement, key: string, caret: number, init: object = {}) {
  act(() => el.focus()); // 聚焦会切「当前行高亮」状态，包 act 免 React 警告
  el.setSelectionRange(caret, caret);
  fireEvent.keyDown(el, { key, ...init });
}

describe("CodeEditor 受控契约", () => {
  it("普通输入回吐新值", () => {
    const onChange = vi.fn();
    const { container } = render(<CodeEditor value="a" onChange={onChange} />);
    fireEvent.change(area(container), { target: { value: "ab" } });
    expect(onChange).toHaveBeenCalledWith("ab");
  });

  it("value 是唯一真源：外部不改 value 则 textarea 不变", () => {
    const { container } = render(<CodeEditor value="a" onChange={() => {}} />);
    fireEvent.change(area(container), { target: { value: "ab" } });
    expect(area(container).value).toBe("a");
  });

  it("readOnly：textarea 带 readOnly + aria-readonly，键盘增强全部不生效", () => {
    const onChange = vi.fn();
    const { container } = render(<CodeEditor value="a" onChange={onChange} readOnly />);
    const el = area(container);
    expect(el.readOnly).toBe(true);
    expect(el.getAttribute("aria-readonly")).toBe("true");
    press(el, "Tab", 1);
    expect(onChange).not.toHaveBeenCalled();
    expect(el.value).toBe("a");
  });
});

describe("CodeEditor 键盘增强", () => {
  it("Tab 插入一级缩进而不是把焦点带走", () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="ab" onValue={onValue} />);
    const el = area(container);
    press(el, "Tab", 0);
    expect(onValue).toHaveBeenCalledWith("  ab");
  });

  it("tabSize 决定缩进宽度", () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="ab" tabSize={4} onValue={onValue} />);
    press(area(container), "Tab", 0);
    expect(onValue).toHaveBeenCalledWith("    ab");
  });

  it("Shift+Tab 反缩进", () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="    ab" onValue={onValue} />);
    press(area(container), "Tab", 6, { shiftKey: true });
    expect(onValue).toHaveBeenCalledWith("  ab");
  });

  it("Enter 沿用上一行缩进；{ 后再多缩一级", () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="  if (a) {" onValue={onValue} />);
    press(area(container), "Enter", 10);
    expect(onValue).toHaveBeenCalledWith("  if (a) {\n    ");
  });

  it("输入 { 自动补 }", () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="" onValue={onValue} />);
    press(area(container), "{", 0);
    expect(onValue).toHaveBeenCalledWith("{}");
  });

  it("退格删掉成对空括号时两个一起删", () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="f()" onValue={onValue} />);
    press(area(container), "Backspace", 2);
    expect(onValue).toHaveBeenCalledWith("f");
  });

  it("Cmd+/ 切换行注释，再按一次还原", () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="const a = 1" onValue={onValue} />);
    const el = area(container);
    press(el, "/", 0, { metaKey: true });
    expect(onValue).toHaveBeenLastCalledWith("// const a = 1");
    press(el, "/", 0, { metaKey: true });
    expect(onValue).toHaveBeenLastCalledWith("const a = 1");
  });

  it("language=json 时 Cmd+/ 不写出非法注释", () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="{}" language="json" onValue={onValue} />);
    press(area(container), "/", 0, { metaKey: true });
    expect(onValue).not.toHaveBeenCalled();
  });

  it("编辑一律经 execCommand 落笔（保住原生 undo 栈），不是整篇 setState 覆盖", () => {
    const exec = installExecCommand();
    const { container } = render(<Controlled initial="ab" />);
    press(area(container), "Tab", 0);
    expect(exec).toHaveBeenCalledWith("insertText", false, "  ");
  });

  it("execCommand 缺席时降级为整篇回吐（编辑仍可用，只是丢原生 undo）", () => {
    delete (document as unknown as { execCommand?: unknown }).execCommand;
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="ab" onValue={onValue} />);
    press(area(container), "Tab", 0);
    expect(onValue).toHaveBeenCalledWith("  ab");
  });
});

describe("CodeEditor 行号槽", () => {
  it("行号数量随行数变化，且与代码行一一对应", () => {
    const { container, rerender } = render(<CodeEditor value={"a\nb\nc"} onChange={() => {}} />);
    expect(gutterLines(container).length).toBe(3);
    expect(codeLines(container).length).toBe(3);
    rerender(<CodeEditor value={"a\nb\nc\nd\ne"} onChange={() => {}} />);
    expect(gutterLines(container).length).toBe(5);
    expect(codeLines(container).length).toBe(5);
    expect(gutterLines(container)[4].textContent).toBe("5");
  });

  it("末尾换行也算一行（与编辑器光标能停的位置一致）", () => {
    const { container } = render(<CodeEditor value={"a\n"} onChange={() => {}} />);
    expect(gutterLines(container).length).toBe(2);
  });

  it("lineNumbers={false} 不渲染行号槽", () => {
    const { container } = render(
      <CodeEditor value="a" onChange={() => {}} lineNumbers={false} />,
    );
    expect(container.querySelector('[data-slot="code-editor-gutter"]')).toBeNull();
    expect(codeLines(container).length).toBe(1);
  });
});

describe("CodeEditor 着色", () => {
  const colored = (c: HTMLElement) =>
    Array.from(c.querySelectorAll('[data-slot="code-editor-highlight"] span'))
      .filter((s) => s.className !== "")
      .map((s) => `${s.className}|${s.textContent}`);

  it("切语言后 token 类名跟着变（同一段文本，css vs tsx 结果不同）", () => {
    const code = ".a { color: red }";
    const { container, rerender } = render(
      <CodeEditor value={code} onChange={() => {}} language="tsx" />,
    );
    const asTsx = colored(container);
    rerender(<CodeEditor value={code} onChange={() => {}} language="css" />);
    const asCss = colored(container);
    expect(asCss).not.toEqual(asTsx);
    // css 分支把 color 认成属性名 → 吃 --code-attr
    expect(asCss.some((s) => s.startsWith("text-[var(--code-attr)]") && s.endsWith("|color"))).toBe(
      true,
    );
  });

  it("tsx 关键字吃 --code-keyword", () => {
    const { container } = render(
      <CodeEditor value="const a = 1" onChange={() => {}} language="tsx" />,
    );
    expect(colored(container).some((s) => s.includes("--code-keyword") && s.endsWith("|const"))).toBe(
      true,
    );
  });
});

describe("CodeEditor 无障碍与主题", () => {
  it("默认 aria-label 带语言，可被 ariaLabel 覆盖", () => {
    const { container, rerender } = render(
      <CodeEditor value="" onChange={() => {}} language="json" />,
    );
    expect(area(container).getAttribute("aria-label")).toContain("json");
    rerender(<CodeEditor value="" onChange={() => {}} ariaLabel="DSL 编辑区" />);
    expect(area(container).getAttribute("aria-label")).toBe("DSL 编辑区");
  });

  it("高亮层与行号槽对读屏隐藏（避免代码被念两遍）", () => {
    const { container } = render(<CodeEditor value={"a\nb"} onChange={() => {}} />);
    expect(
      container.querySelector('[data-slot="code-editor-highlight"]')!.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(
      container.querySelector('[data-slot="code-editor-gutter"]')!.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("不传 theme 时不写 data-theme（跟随全局主题）", () => {
    const { container } = render(<CodeEditor value="" onChange={() => {}} />);
    expect(container.querySelector('[data-slot="code-editor"]')!.hasAttribute("data-theme")).toBe(
      false,
    );
  });

  it("theme='dark' 在子树上钉住暗色 token", () => {
    const { container } = render(<CodeEditor value="" onChange={() => {}} theme="dark" />);
    expect(container.querySelector('[data-slot="code-editor"]')!.getAttribute("data-theme")).toBe(
      "dark",
    );
  });
});
