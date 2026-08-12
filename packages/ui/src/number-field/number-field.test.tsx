import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { NumberField } from "./number-field";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("NumberField", () => {
  it("稳定父更新时跳过 NumberField 子树", async () => {
    await expectMemoSkipsSubtree(() => <NumberField aria-label="数量" defaultValue={3} />);
  });

  it("渲染 input + 增/减按钮", () => {
    const { getByLabelText } = render(<NumberField aria-label="数量" defaultValue={3} />);
    expect(getByLabelText("数量")).toBeTruthy();
    expect(getByLabelText("增加")).toBeTruthy();
    expect(getByLabelText("减少")).toBeTruthy();
  });

  it("defaultValue 显示在 input", () => {
    const { getByLabelText } = render(<NumberField aria-label="数量" defaultValue={3} />);
    expect((getByLabelText("数量") as HTMLInputElement).value).toBe("3");
  });

  it("disabled 透传：input 禁用", () => {
    const { getByLabelText } = render(<NumberField aria-label="数量" disabled defaultValue={1} />);
    expect((getByLabelText("数量") as HTMLInputElement).disabled).toBe(true);
  });

  it("到达 min 时减按钮禁用", () => {
    const { getByLabelText } = render(
      <NumberField aria-label="数量" defaultValue={0} min={0} max={5} />,
    );
    expect((getByLabelText("减少") as HTMLButtonElement).disabled).toBe(true);
  });

  it("到达 max 时增按钮禁用", () => {
    const { getByLabelText } = render(
      <NumberField aria-label="数量" defaultValue={5} min={0} max={5} />,
    );
    expect((getByLabelText("增加") as HTMLButtonElement).disabled).toBe(true);
  });
});

// null = 空，两个方向都要成立（#220）。
// 「留空 = 沿用默认 / 继承上级，0 = 显式为零」是配置类表单里常见的三态字段
// （超时时间、限流阈值、库存告警线），`number | null` 这个签名本身就是在承诺支持它。
// 把 null 渲染成 0 会让「沿用默认」和「显式为零」在界面上分不出来——两个相反的业务结论。
describe("NumberField 的空值（#220）", () => {
  it("受控 value={null} 渲染成空，而不是 0", () => {
    const { getByLabelText } = render(
      <NumberField aria-label="数量" value={null} onValueChange={() => {}} />,
    );
    expect((getByLabelText("数量") as HTMLInputElement).value).toBe("");
  });

  it("受控值从数字切到 null 时清空", () => {
    const { getByLabelText, rerender } = render(
      <NumberField aria-label="数量" value={5} onValueChange={() => {}} />,
    );
    expect((getByLabelText("数量") as HTMLInputElement).value).toBe("5");
    rerender(<NumberField aria-label="数量" value={null} onValueChange={() => {}} />);
    expect((getByLabelText("数量") as HTMLInputElement).value).toBe("");
  });

  it("min={0} 不会把 null 夹成 0", () => {
    const { getByLabelText } = render(
      <NumberField aria-label="数量" value={null} onValueChange={() => {}} min={0} max={99999} />,
    );
    expect((getByLabelText("数量") as HTMLInputElement).value).toBe("");
  });

  // 类型此前只允许 number，于是非受控写法表达不出「初始为空」——底层一直是支持的。
  it("非受控 defaultValue={null} 初始为空", () => {
    const { getByLabelText } = render(<NumberField aria-label="数量" defaultValue={null} />);
    expect((getByLabelText("数量") as HTMLInputElement).value).toBe("");
  });
});
