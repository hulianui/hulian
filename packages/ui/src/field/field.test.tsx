import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Field } from "./field";
import { Input } from "../input/input";

describe("Field", () => {
  it("真坑回归: error 非空时错误文字真的渲染(不能框红字没)", () => {
    const { getByText } = render(
      <Field label="邮箱" error="邮箱格式不正确">
        <Input />
      </Field>,
    );
    expect(getByText("邮箱格式不正确")).toBeTruthy();
  });

  it("error 隐含 invalid → 控件自动 aria-invalid", () => {
    const { container } = render(
      <Field error="必填">
        <Input />
      </Field>,
    );
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
  });

  it("error 的 id 自动串进控件 aria-describedby(a11y 白嫖)", () => {
    const { container, getByText } = render(
      <Field error="必填">
        <Input />
      </Field>,
    );
    const input = container.querySelector("input")!;
    const errorEl = getByText("必填");
    expect((input.getAttribute("aria-describedby") ?? "")).toContain(errorEl.id);
  });

  it("label 经 htmlFor 自动关联控件", () => {
    const { getByText, container } = render(
      <Field label="用户名">
        <Input />
      </Field>,
    );
    const label = getByText("用户名");
    const input = container.querySelector("input")!;
    expect(input.id).toBeTruthy();
    expect(label.getAttribute("for")).toBe(input.id);
  });

  it("三段 className 出口经 twMerge 顶掉默认字号，a11y 串联不受影响(#153)", () => {
    const { getByText, container } = render(
      <Field
        label="参保状态"
        description="按月同步"
        error="不能为空"
        labelClassName="text-xs text-muted-foreground"
        descriptionClassName="text-[11px]"
        errorClassName="text-[11px]"
      >
        <Input />
      </Field>,
    );
    const label = getByText("参保状态");
    // 同族类被顶掉而不是并存 —— 并存的话两条 font-size 规则谁赢取决于 CSS 顺序，等于没改。
    expect(label.className).toContain("text-xs");
    expect(label.className).not.toContain("text-sm");
    expect(label.className).toContain("text-muted-foreground");
    expect(label.className).not.toContain("text-foreground ");
    expect(getByText("按月同步").className).toContain("text-[11px]");
    expect(getByText("不能为空").className).toContain("text-[11px]");
    // 出口只动样式：label↔控件、error↔aria-describedby 这些关系必须原样还在。
    const input = container.querySelector("input")!;
    expect(label.getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("aria-describedby") ?? "").toContain(getByText("不能为空").id);
  });

  it("无 error 时不渲染错误节点", () => {
    const { queryByText } = render(
      <Field label="邮箱">
        <Input />
      </Field>,
    );
    expect(queryByText("邮箱格式不正确")).toBeNull();
  });
});
