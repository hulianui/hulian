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

  it("orientation=horizontal 保住全部 a11y 串联(#161)", () => {
    const { getByText, container } = render(
      <Field orientation="horizontal" label="主题" description="选择你偏好的配色方案" error="不能为空">
        <Input />
      </Field>,
    );
    const input = container.querySelector("input")!;
    // 换布局不能换语义：label↔控件、error↔aria-describedby、invalid 传导必须与竖排一模一样。
    expect(getByText("主题").getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain(getByText("不能为空").id);
    expect(describedBy).toContain(getByText("选择你偏好的配色方案").id);
  });

  it("orientation=horizontal 走两列网格，错误行独占整行", () => {
    const { getByText, container } = render(
      <Field orientation="horizontal" label="主题" error="不能为空">
        <Input />
      </Field>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("grid-cols-[1fr_auto]");
    expect(root.className).not.toContain("flex-col");
    // col-span-full 而不是写死的 col-span-2：消费方换成三列列模板时错误行仍占满。
    expect(getByText("不能为空").className).toContain("col-span-full");
  });

  it("横排的标签列宽度靠 className 顶掉默认列模板，不另开 prop", () => {
    const { container } = render(
      <Field orientation="horizontal" label="主题" className="grid-cols-[8rem_1fr]">
        <Input />
      </Field>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("grid-cols-[8rem_1fr]");
    expect(root.className).not.toContain("grid-cols-[1fr_auto]");
  });

  it("缺省 orientation 仍是竖排(既有版式零变化)", () => {
    const { container } = render(
      <Field label="邮箱">
        <Input />
      </Field>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("flex-col");
    expect(root.className).not.toContain("grid");
  });

  it("横排时 label 缺席也保留左列，控件不会跑到左边", () => {
    const { container } = render(
      <Field orientation="horizontal">
        <Input />
      </Field>,
    );
    // 第一个子节点是标签区（此时为空），控件在第二列。
    const root = container.firstElementChild!;
    expect(root.children.length).toBe(2);
    expect(root.children[0]!.querySelector("input")).toBeNull();
    expect(root.children[1]!.querySelector("input")).toBeTruthy();
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
