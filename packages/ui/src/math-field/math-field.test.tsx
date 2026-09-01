import { act, cleanup, render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MATH_FIELD_LOCALE_ZH } from "./math-field.locale";

/**
 * jsdom 装得了自定义元素，装不了 MathLive（无布局、无 shadow DOM 排版）。这里用一个只实现
 * MathfieldLike 面的假元素替代，测的是组件这一侧的契约：三态、受控同步、事件回流、属性透传。
 * 真 MathLive 的注册 / 击键回流 / 键盘策略在 math-field.browser.test.tsx。
 */
class FakeMathfield extends HTMLElement {
  static soundsDirectory: string | null = null;
  static fontsDirectory: string | null = null;
  private latex = "";
  disabled = false;
  readOnly = false;
  placeholder = "";
  mathVirtualKeyboardPolicy: "auto" | "manual" | "sandboxed" = "auto";
  menuItems: readonly unknown[] = [{ label: "builtin" }];
  setValueCalls: { value: string; silent: boolean }[] = [];
  getValue() {
    return this.latex;
  }
  setValue(value: string, options?: { silenceNotifications?: boolean }) {
    this.latex = value;
    this.setValueCalls.push({ value, silent: options?.silenceNotifications === true });
  }
  /** 模拟用户击键：改内部值并派发 input。 */
  type(latex: string) {
    this.latex = latex;
    this.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

vi.mock("mathlive", () => ({ MathfieldElement: FakeMathfield }));

let MathField: typeof import("./math-field").MathField;
beforeAll(async () => {
  ({ MathField } = await import("./math-field"));
});
afterEach(cleanup);

const field = () => document.querySelector("math-field") as FakeMathfield | null;
const root = () => document.querySelector("[data-slot='math-field']");

describe("MathField 三态", () => {
  it("服务端渲染只有骨架，没有 math-field（首帧与客户端一致，无 hydration mismatch）", () => {
    const html = renderToStaticMarkup(<MathField value="x" onChange={() => {}} />);
    expect(html).toContain('data-status="loading"');
    expect(html).toContain(MATH_FIELD_LOCALE_ZH.loading);
    expect(html).not.toContain("<math-field");
  });

  it("加载成功后挂真元素、状态 ready、初值写入且静默、菜单关掉、骨架已撤", async () => {
    render(<MathField value={"\\sqrt{2}"} onChange={() => {}} aria-label="公式" />);
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    expect(root()?.getAttribute("data-status")).toBe("ready");
    expect(el.getValue()).toBe("\\sqrt{2}");
    expect(el.setValueCalls[0]).toEqual({ value: "\\sqrt{2}", silent: true });
    expect(el.menuItems).toEqual([]);
    expect(el.getAttribute("aria-label")).toBe("公式");
    expect(root()?.querySelector(`[aria-label="${MATH_FIELD_LOCALE_ZH.loading}"]`)).toBeNull();
  });
});

describe("MathField 受控", () => {
  it("用户击键 → onChange 收到 latex；父层 value 变化 → 静默 setValue；与元素当前值相同时不重复写", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<MathField value="a" onChange={onChange} />);
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    act(() => el.type("a+b"));
    expect(onChange).toHaveBeenCalledWith("a+b");

    const before = el.setValueCalls.length;
    rerender(<MathField value="a+b" onChange={onChange} />);
    expect(el.setValueCalls.length).toBe(before);

    rerender(<MathField value="c" onChange={onChange} />);
    expect(el.setValueCalls.at(-1)).toEqual({ value: "c", silent: true });
    expect(el.getValue()).toBe("c");
  });

  it("回车 → onSubmit(当前 latex) 且阻止默认；没给 onSubmit 不阻止", async () => {
    const onSubmit = vi.fn();
    const { rerender } = render(<MathField value={"x^2"} onChange={() => {}} onSubmit={onSubmit} />);
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    act(() => {
      el.dispatchEvent(enter);
    });
    expect(onSubmit).toHaveBeenCalledWith("x^2");
    expect(enter.defaultPrevented).toBe(true);

    rerender(<MathField value={"x^2"} onChange={() => {}} />);
    const enter2 = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    act(() => {
      el.dispatchEvent(enter2);
    });
    expect(enter2.defaultPrevented).toBe(false);
  });

  it("disabled / readOnly / placeholder / virtualKeyboard 透传，off 映射成 manual 并打标", async () => {
    const { rerender } = render(
      <MathField value="" onChange={() => {}} disabled readOnly placeholder="输入公式" virtualKeyboard="off" />,
    );
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    expect(el.disabled).toBe(true);
    expect(el.readOnly).toBe(true);
    expect(el.placeholder).toBe("输入公式");
    expect(el.mathVirtualKeyboardPolicy).toBe("manual");
    expect(root()?.getAttribute("data-keyboard")).toBe("off");

    rerender(<MathField value="" onChange={() => {}} virtualKeyboard="manual" />);
    expect(el.disabled).toBe(false);
    expect(el.readOnly).toBe(false);
    expect(el.placeholder).toBe("");
    expect(el.mathVirtualKeyboardPolicy).toBe("manual");
    expect(root()?.getAttribute("data-keyboard")).toBe("manual");
  });

  it("卸载时移除元素与监听", async () => {
    const onChange = vi.fn();
    const { unmount } = render(<MathField value="" onChange={onChange} />);
    await waitFor(() => expect(field()).not.toBeNull());
    const el = field()!;
    unmount();
    expect(document.querySelector("math-field")).toBeNull();
    el.type("z");
    expect(onChange).not.toHaveBeenCalled();
  });
});
