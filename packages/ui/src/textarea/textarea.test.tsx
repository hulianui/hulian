import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Field as BaseField } from "@base-ui/react/field";
import { textareaVariants, Textarea } from "./textarea";

describe("textareaVariants", () => {
  it("默认 md + 语义皮肤", () => {
    const c = textareaVariants({});
    expect(c).toContain("border-border");
    expect(c).toContain("data-[invalid]:border-danger");
  });
  it("size 变体改内距/字号", () => {
    expect(textareaVariants({ size: "lg" })).toContain("text-base");
  });

  // #149：与 Input 的 cell 档同构，外加高度交给浏览器（field-sizing）。
  it("variant=cell 卸掉外壳并让高度跟内容走", () => {
    const c = textareaVariants({ variant: "cell" });
    expect(c).toContain("border-0");
    expect(c).toContain("bg-transparent");
    expect(c).toContain("p-0");
    expect(c).toContain("field-sizing-content");
    expect(c).not.toContain("px-3");
  });

  it("variant=cell 的焦点指示是内嵌下划线而非 ring", () => {
    const c = textareaVariants({ variant: "cell" });
    expect(c).not.toContain("focus-visible:ring-2");
    expect(c).not.toContain("ring-offset");
    expect(c).toContain("focus-visible:shadow-[inset_0_-2px_0_0_var(--color-primary)]");
    expect(c).toContain("focus-visible:bg-primary-subtle");
  });

  it("不传 variant 与显式 default 同输出，且仍是 0.28.0 前的那身外壳", () => {
    expect(textareaVariants({})).toBe(textareaVariants({ variant: "default" }));
    const c = textareaVariants({ size: "sm" });
    expect(c).toContain("border-border");
    expect(c).toContain("bg-surface");
    expect(c).toContain("px-2.5");
  });
});

describe("Textarea", () => {
  it("invalid 翻译成 data-invalid + aria-invalid，不裸传 invalid/autoResize", () => {
    const { container } = render(<Textarea invalid autoResize defaultValue="x" />);
    const el = container.querySelector("textarea")!;
    expect(el.getAttribute("data-invalid")).toBe("");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.hasAttribute("invalid")).toBe(false);
    expect(el.hasAttribute("autoresize")).toBe(false); // 自定义 prop 不渲到 DOM
  });

  it("autoResize: 测高前先把 height 归零(红线①), 受控值变化重测(红线②)", () => {
    const seen: string[] = [];
    const spy = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLTextAreaElement) {
        seen.push(this.style.height); // 读 scrollHeight 时 height 应已是 auto
        return 90;
      });
    const { container, rerender } = render(
      <Textarea autoResize value="a" onChange={() => {}} />,
    );
    const el = container.querySelector("textarea")!;
    expect(seen.at(-1)).toBe("auto"); // 红线①: 测前归零(否则只增不减)
    expect(el.style.height).toBe("90px");
    const calls = seen.length;
    rerender(<Textarea autoResize value="aa" onChange={() => {}} />);
    expect(seen.length).toBeGreaterThan(calls); // 红线②: 受控值变化触发重测
    spy.mockRestore();
  });

  it("autoResize 时 rows 作下限 + 禁手动 resize(红线③)", () => {
    const { container } = render(<Textarea autoResize rows={4} />);
    const el = container.querySelector("textarea")!;
    expect(el.getAttribute("rows")).toBe("4"); // rows 属性=自适应高度的下限锚
    expect(el.className).toContain("overflow-hidden");
  });

  // #149：rows 的默认值随变体走。cell 沿用 3 会把表格行撑成三倍高，于是每个调用处都得
  // 补 rows={1} —— 那正是这个变体要消灭的「在调用处打补丁」。显式传 rows 仍然优先。
  it("variant=cell 的 rows 下限默认 1，显式传值优先", () => {
    const a = render(<Textarea variant="cell" />);
    expect(a.container.querySelector("textarea")!.getAttribute("rows")).toBe("1");
    const b = render(<Textarea variant="cell" rows={2} />);
    expect(b.container.querySelector("textarea")!.getAttribute("rows")).toBe("2");
    const c = render(<Textarea />);
    expect(c.container.querySelector("textarea")!.getAttribute("rows")).toBe("3");
  });

  it("variant=cell 收掉拖拽手柄，且不裸传到 DOM", () => {
    const { container } = render(<Textarea variant="cell" />);
    const el = container.querySelector("textarea")!;
    expect(el.hasAttribute("variant")).toBe(false);
    expect(el.className).toContain("resize-none");
    expect(el.className).toContain("overflow-hidden");
    expect(el.className).not.toContain("resize-y");
  });

  // 防回归：Textarea 必须仍是 Base UI Field.Control（render textarea），放进 Field.Root 能消费 context。
  // 若退化成原生 <textarea>，下面拿不到 data-invalid → 失败。守 spec §3.2「Field 内自动串联」。
  it("放进 Field.Root invalid 时自动得 data-invalid（证明仍是 Field.Control，非原生 textarea）", () => {
    const { container } = render(
      <BaseField.Root invalid>
        <Textarea />
      </BaseField.Root>,
    );
    expect(container.querySelector("textarea")!.getAttribute("data-invalid")).toBe("");
  });
});
