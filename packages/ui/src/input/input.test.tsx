import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, fireEvent } from "@testing-library/react";
import { inputShellVariants, Input } from "./input";

describe("inputShellVariants", () => {
  it("默认 md（h-10）", () => {
    expect(inputShellVariants({})).toContain("h-10");
  });
  it("size 变体改高度", () => {
    expect(inputShellVariants({ size: "sm" })).toContain("h-8");
    expect(inputShellVariants({ size: "lg" })).toContain("h-12");
  });
  it("外壳带 invalid/focus-within 钩子", () => {
    const c = inputShellVariants({});
    expect(c).toContain("has-[[data-invalid]]:border-danger");
    expect(c).toContain("focus-within:ring-ring");
  });

  // #149：单元格档必须同时卸掉三样，少一样就还得在调用处补 className。
  it("variant=cell 卸掉外壳：无边框 / 透明底 / 零内距 / 不占固定行高", () => {
    const c = inputShellVariants({ variant: "cell" });
    expect(c).toContain("border-0");
    expect(c).toContain("bg-transparent");
    expect(c).toContain("p-0");
    // 高度与内距只挂在 default 的 compoundVariants 上；cell 若继承到 h-10 会把表格行撑起来
    expect(c).not.toContain("h-10");
    expect(c).not.toContain("px-3");
  });

  // 焦点环有 2px 环 + 2px offset，在单元格里会溢出顶到相邻格 —— cell 档必须换掉它。
  // 换成的 inset 下划线画在盒内，零布局位移（border-b 会占 2px 高把整行推动）。
  it("variant=cell 的焦点指示是内嵌下划线而非 ring", () => {
    const c = inputShellVariants({ variant: "cell" });
    expect(c).not.toContain("focus-within:ring-2");
    expect(c).not.toContain("ring-offset");
    expect(c).toContain("focus-within:shadow-[inset_0_-2px_0_0_var(--color-primary)]");
    expect(c).toContain("focus-within:bg-primary-subtle");
  });

  it("variant=cell 仍保留 invalid 通道（换成红色下划线）", () => {
    expect(inputShellVariants({ variant: "cell" })).toContain(
      "has-[[data-invalid]]:shadow-[inset_0_-2px_0_0_var(--color-danger)]",
    );
  });

  // 加变体不能动既有输出：消费方直接用 inputShellVariants 拼皮肤的，一个类都不该变。
  it("不传 variant 与显式 default 同输出，且仍是 0.28.0 前的那身外壳", () => {
    expect(inputShellVariants({})).toBe(inputShellVariants({ variant: "default" }));
    const c = inputShellVariants({ size: "sm" });
    expect(c).toContain("border-border");
    expect(c).toContain("bg-surface");
    expect(c).toContain("h-8");
    expect(c).toContain("px-2.5");
  });
});

describe("Input", () => {
  it("invalid 先 destructure 再翻译成 data-invalid + aria-invalid，不裸传 invalid 属性", () => {
    const { container } = render(<Input invalid placeholder="x" />);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("data-invalid")).toBe("");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("invalid")).toBe(false); // 关键：自定义 invalid 不渲到 DOM
  });
  it("无 invalid / invalid={false} 都不加 data-invalid", () => {
    const a = render(<Input placeholder="x" />);
    expect(a.container.querySelector("input")!.hasAttribute("data-invalid")).toBe(false);
    const b = render(<Input invalid={false} placeholder="x" />);
    expect(b.container.querySelector("input")!.hasAttribute("data-invalid")).toBe(false);
    expect(b.container.querySelector("input")!.hasAttribute("invalid")).toBe(false);
  });
  it("disabled 透传到内层 input（驱动外壳 has-[:disabled]）", () => {
    const { container } = render(<Input disabled placeholder="x" />);
    expect(container.querySelector("input")!.disabled).toBe(true);
  });
  // variant 是 CVA 自定义 prop，与 invalid / size 同类：漏 destructure 会经 ...props
  // 落到原生 <input> 上变成非法属性（React 会告警，属性也会真的出现在 DOM 里）。
  it("variant 不裸传到 DOM，且真的换上了 cell 皮肤", () => {
    const { container } = render(<Input variant="cell" placeholder="x" />);
    const input = container.querySelector("input")!;
    expect(input.hasAttribute("variant")).toBe(false);
    expect(container.querySelector("span")!.className).toContain("bg-transparent");
  });
  it("渲染前后缀", () => {
    const { getByText } = render(<Input prefix="¥" suffix=".00" />);
    expect(getByText("¥")).toBeTruthy();
    expect(getByText(".00")).toBeTruthy();
  });
  // ref 指向真正的 <input> 而非外壳 span：focus()/取 .value/react-hook-form register 都靠它
  it("转发 ref 到内层原生 input", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Input ref={ref} defaultValue="abc" />);
    expect(ref.current).toBe(container.querySelector("input"));
    expect(ref.current!.tagName).toBe("INPUT");
    expect(ref.current!.value).toBe("abc");
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  // #220：`useForm` 的 register().value 会把「显式清空」的 null 原样给出来，而文档推荐的
  // 绑法（`value={f.value as string}`）就是把它直接交给本组件。原生 <input value={null}>
  // 会被 React 判成非受控并打告警，故在组件里把 null 收成空串。
  it("value={null} 按空串渲染，且不触发 React 的受控告警", () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<Input value={null} onChange={() => {}} aria-label="i" />);
    const input = container.querySelector("input")!;
    expect(input.value).toBe("");
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("不传 value 时仍是非受控（归一只针对 null，不能把 undefined 变成受控空）", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<Input defaultValue="abc" aria-label="i" />);
    const input = container.querySelector("input")!;
    // 非受控：没有 onChange 也能改动，且 React 不打「受控但没给 onChange」的错
    fireEvent.change(input, { target: { value: "xyz" } });
    expect(input.value).toBe("xyz");
    expect(err).not.toHaveBeenCalled();
    err.mockRestore();
  });

  // #187：存量密集数据表（12px 字 / 27px 行）此前最小只有 sm 的 32px，差 4px 没处接。
  it("size=xs 是 28px 高 / 12px 字的密集档，且仍然有边框（区别于无边框的 cell）", () => {
    const { container } = render(<Input size="xs" aria-label="i" />);
    const shell = container.firstElementChild as HTMLElement;
    expect(shell.className).toContain("h-7");
    expect(shell.className).toContain("text-xs");
    expect(shell.className).toContain("border");
  });
});
