import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MathField } from "./math-field";
import type { MathfieldLike } from "./mathlive-loader";

/**
 * jsdom 装不了 MathLive：自定义元素要 shadow DOM 排版、击键走它内部的隐藏 textarea、
 * 键盘切换钮是 shadow 里的 part。这些只在真实浏览器里可信。
 */
afterEach(cleanup);

type RealField = MathfieldLike & {
  executeCommand: (command: unknown) => boolean;
  shadowRoot: ShadowRoot | null;
};

const INITIAL = "\\frac{1}{2}";

async function mount(props: Partial<Parameters<typeof MathField>[0]> = {}) {
  const onChange = vi.fn();
  const utils = render(<MathField value={INITIAL} onChange={onChange} {...props} />);
  await waitFor(() => expect(document.querySelector("math-field")).not.toBeNull(), { timeout: 10_000 });
  await customElements.whenDefined("math-field");
  return { ...utils, onChange, el: document.querySelector("math-field") as RealField };
}

describe("MathField × 真 MathLive", () => {
  it("注册成功：math-field 已升级为 MathfieldElement，初值可读回，菜单已清空", async () => {
    const { el } = await mount();
    expect(customElements.get("math-field")).toBeDefined();
    expect(el.constructor.name).not.toBe("HTMLElement");
    expect(el.getValue("latex")).toBe(INITIAL);
    expect(el.menuItems).toEqual([]);
  });

  it("用户输入回流 onChange，值是不带 $ 的 LaTeX", async () => {
    const { el, onChange } = await mount({ value: "" });
    el.focus();
    // insert 是 MathLive 的用户命令，会像击键一样派发 input。
    el.executeCommand(["insert", "\\sqrt{x}"]);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("\\sqrt{x}");
  });

  it("父层改 value 静默写入，不回环 onChange", async () => {
    const { el, onChange, rerender } = await mount();
    rerender(<MathField value="x^2" onChange={onChange} />);
    await waitFor(() => expect(el.getValue("latex")).toBe("x^2"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("virtualKeyboard=off：策略 manual 且切换钮不显示", async () => {
    const { el } = await mount({ virtualKeyboard: "off" });
    expect(el.mathVirtualKeyboardPolicy).toBe("manual");
    const toggle = el.shadowRoot?.querySelector<HTMLElement>('[part~="virtual-keyboard-toggle"]');
    if (toggle) expect(getComputedStyle(toggle).display).toBe("none");
  });

  it("主题变量穿进元素：光标色已解析成 --color-primary 的实际值（自定义属性会继续继承进 shadow DOM）", async () => {
    const { el } = await mount();
    const primary = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
    expect(primary).not.toBe("");
    expect(getComputedStyle(el).getPropertyValue("--caret-color").trim()).toBe(primary);
  });

  it("外观类落在真元素上：与 Input 同一套边框（不是 0 宽 / 无边框的裸自定义元素）", async () => {
    const { el } = await mount();
    const style = getComputedStyle(el);
    expect(style.display).toBe("block");
    expect(style.borderTopWidth).toBe("1px");
  });

  it("disabled 透传到元素", async () => {
    const { el } = await mount({ disabled: true });
    expect(el.disabled).toBe(true);
    expect(el.hasAttribute("disabled")).toBe(true);
  });
});
