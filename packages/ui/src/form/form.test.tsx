import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Form } from "./form";

describe("Form", () => {
  it("渲染 form 元素 + 默认 space-y-4", () => {
    const { container } = render(
      <Form>
        <button type="submit">提交</button>
      </Form>,
    );
    const form = container.querySelector("form")!;
    expect(form).toBeTruthy();
    expect(form.className).toContain("space-y-4");
  });

  it("提交触发 onFormSubmit", () => {
    let called = false;
    const { container } = render(
      <Form onFormSubmit={() => (called = true)}>
        <button type="submit">提交</button>
      </Form>,
    );
    fireEvent.submit(container.querySelector("form")!);
    expect(called).toBe(true);
  });

  it("透传 className 覆盖默认布局", () => {
    const { container } = render(
      <Form className="my-form">
        <span>x</span>
      </Form>,
    );
    expect(container.querySelector("form")!.classList.contains("my-form")).toBe(true);
  });

  it("接受 errors prop 并正常渲染 children", () => {
    const { getByText } = render(
      <Form errors={{ email: "邮箱已被占用" }}>
        <span>表单内容</span>
      </Form>,
    );
    expect(getByText("表单内容")).toBeTruthy();
  });
});
