import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { RadioGroup, Radio } from "./radio";
import { Field } from "../field/field";

describe("RadioGroup / Radio", () => {
  it("单选互斥: defaultValue 选中项 data-checked，其余 data-unchecked", () => {
    const { container } = render(
      <RadioGroup defaultValue="b" aria-label="g">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    const radios = container.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(2);
    expect(radios[0].getAttribute("data-checked")).toBeNull();
    expect(radios[0].getAttribute("data-unchecked")).toBe("");
    expect(radios[1].getAttribute("data-checked")).toBe("");
  });

  it("受控 onValueChange: 点击未选项回调新值", () => {
    const seen: string[] = [];
    const { container } = render(
      <RadioGroup value="a" onValueChange={(v) => seen.push(v)} aria-label="g">
        <Radio value="a" label="甲" />
        <Radio value="b" label="乙" />
      </RadioGroup>,
    );
    const radios = container.querySelectorAll('[role="radio"]');
    fireEvent.click(radios[1]);
    expect(seen).toContain("b");
  });

  it("仅选中项渲染中心点(indicator 默认未选卸载)", () => {
    const { container } = render(
      <RadioGroup defaultValue="a" aria-label="g">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    expect(container.querySelectorAll('[data-icon="dot"]').length).toBe(1);
  });

  it("orientation=horizontal 用横向布局类", () => {
    const { container } = render(
      <RadioGroup orientation="horizontal" aria-label="g">
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect((container.firstElementChild as HTMLElement).className).toContain("flex-row");
  });

  it("RadioGroup disabled 下发子 Radio → data-disabled", () => {
    const { container } = render(
      <RadioGroup disabled defaultValue="a" aria-label="g">
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect(container.querySelector('[role="radio"][data-disabled]')).toBeTruthy();
  });

  it("Field 串联: RadioGroup 嵌 <Field error> → 得 data-invalid + error 文字真渲染", () => {
    const { container, getByText } = render(
      <Field label="性别" error="请选择一项">
        <RadioGroup defaultValue="m">
          <Radio value="m" label="男" />
          <Radio value="f" label="女" />
        </RadioGroup>
      </Field>,
    );
    expect(container.querySelector("[data-invalid]")).toBeTruthy();
    expect(getByText("请选择一项")).toBeTruthy();
  });

  // 无 label 用法（图标卡片、自定义排版）此前完全拿不到无障碍名
  it("无 label 时 aria-label 落到 role=radio 上，按名字取得到", () => {
    const { getByRole } = render(
      <RadioGroup aria-label="套餐">
        <Radio value="basic" aria-label="基础版" />
        <Radio value="pro" aria-label="专业版" />
      </RadioGroup>,
    );
    expect(getByRole("radio", { name: "专业版" })).toBeTruthy();
  });

  it("aria-labelledby / aria-describedby 透传", () => {
    const { container } = render(
      <RadioGroup aria-label="g">
        <span id="n1">方案一</span>
        <span id="d1">每月 9 元</span>
        <Radio value="a" aria-labelledby="n1" aria-describedby="d1" />
      </RadioGroup>,
    );
    const radio = container.querySelector('[role="radio"]')!;
    expect(radio.getAttribute("aria-labelledby")).toBe("n1");
    expect(radio.getAttribute("aria-describedby")).toBe("d1");
  });
});
