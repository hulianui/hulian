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
