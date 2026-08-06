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
