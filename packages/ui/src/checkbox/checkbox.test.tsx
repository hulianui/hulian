import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Checkbox } from "./checkbox";
import { Field } from "../field/field";

describe("Checkbox", () => {
  it("checked: 盒得 data-checked + 渲染勾(check)，不渲染横线", () => {
    const { container } = render(<Checkbox defaultChecked aria-label="c" />);
    expect(container.querySelector("[data-checked]")).toBeTruthy();
    expect(container.querySelector('[data-icon="check"]')).toBeTruthy();
    expect(container.querySelector('[data-icon="dash"]')).toBeNull();
  });

  it("indeterminate: data-indeterminate(不出 data-checked) + 隐藏 input.indeterminate=true + 渲染横线(dash)", () => {
    const { container } = render(<Checkbox indeterminate aria-label="c" />);
    expect(container.querySelector("[data-indeterminate]")).toBeTruthy();
    expect(container.querySelector("[data-checked]")).toBeNull();
    expect((container.querySelector("input") as HTMLInputElement).indeterminate).toBe(true);
    expect(container.querySelector('[data-icon="dash"]')).toBeTruthy();
    expect(container.querySelector('[data-icon="check"]')).toBeNull();
  });

  it("unchecked: data-unchecked + indicator 默认卸载(无 data-icon)", () => {
    const { container } = render(<Checkbox aria-label="c" />);
    expect(container.querySelector("[data-unchecked]")).toBeTruthy();
    expect(container.querySelector("[data-icon]")).toBeNull();
  });

  it("disabled 落 data-disabled(span 非 :disabled)，自定义 label 不泄漏成裸属性", () => {
    const { container, getByText } = render(<Checkbox disabled defaultChecked label="同意条款" />);
    const box = container.querySelector("[data-checked]")!;
    expect(box.getAttribute("data-disabled")).toBe("");
    expect(box.hasAttribute("label")).toBe(false);
    expect(getByText("同意条款")).toBeTruthy();
  });

  it("有 label 时外层 <label> 包裹，input 在 label 内（原生关联）", () => {
    const { container } = render(<Checkbox label="记住我" />);
    const labelEl = container.querySelector("label")!;
    expect(labelEl).toBeTruthy();
    expect(labelEl.textContent).toContain("记住我");
    expect(labelEl.querySelector("input")).toBeTruthy();
  });

  it("Field 串联: 嵌进 <Field error> → 盒得 data-invalid + error 文字真渲染", () => {
    const { container, getByText } = render(
      <Field error="必须勾选">
        <Checkbox label="同意" />
      </Field>,
    );
    expect(container.querySelector("[data-invalid]")).toBeTruthy();
    expect(getByText("必须勾选")).toBeTruthy();
  });

  // #183：与 Radio 同一处方。
  it("children 当文案渲染（与 label 等价），label 同时给时 label 优先", () => {
    const { getByRole, queryByText } = render(<Checkbox>同意条款</Checkbox>);
    expect(getByRole("checkbox", { name: "同意条款" })).toBeTruthy();

    const { queryByText: q2 } = render(<Checkbox label="标签">子节点</Checkbox>);
    expect(q2("标签")).toBeTruthy();
    expect(q2("子节点")).toBeNull();
    expect(queryByText("同意条款")).toBeTruthy();
  });
});

describe("size 与 labelClassName（#199）", () => {
  const box = (c: HTMLElement) => c.querySelector('[role="checkbox"]')!;

  it("默认 md：方盒 20px + 勾号 14px", () => {
    const { container } = render(<Checkbox defaultChecked aria-label="c" />);
    expect(box(container).className).toContain("size-5");
    expect(container.querySelector('[data-icon="check"]')!.getAttribute("class")).toContain("size-3.5");
  });

  it("sm：方盒与勾号一起缩（勾号不跟着缩就会顶满方盒，这才是压不下去的原因）", () => {
    const { container } = render(<Checkbox defaultChecked size="sm" aria-label="c" />);
    expect(box(container).className).toContain("size-4");
    expect(box(container).className).not.toContain("size-5");
    expect(container.querySelector('[data-icon="check"]')!.getAttribute("class")).toContain("size-3");
  });

  it("sm 的半选横线同样跟着缩", () => {
    const { container } = render(<Checkbox indeterminate size="sm" aria-label="c" />);
    expect(container.querySelector('[data-icon="dash"]')!.getAttribute("class")).toContain("size-3");
  });

  it("sm 的 label 走 text-xs，md 走 text-sm", () => {
    const { getByText: sm } = render(<Checkbox size="sm" label="长期有效" />);
    expect(sm("长期有效").className).toContain("text-xs");
    const { getByText: md } = render(<Checkbox label="同意条款" />);
    expect(md("同意条款").className).toContain("text-sm");
  });

  it("labelClassName 落到文字而非方盒（className 够不到文字）", () => {
    const { container, getByText } = render(
      <Checkbox label="必填" className="ring-2" labelClassName="text-muted-foreground" />,
    );
    expect(getByText("必填").className).toContain("text-muted-foreground");
    expect(box(container).className).toContain("ring-2");
    expect(box(container).className).not.toContain("text-muted-foreground");
  });
});
