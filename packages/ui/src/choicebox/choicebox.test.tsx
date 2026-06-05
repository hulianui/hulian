import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ChoiceboxGroup, Choicebox } from "./choicebox";

describe("Choicebox", () => {
  it("单选默认渲染 radiogroup 与 radio 项", () => {
    const { getByRole, getAllByRole } = render(
      <ChoiceboxGroup aria-label="套餐">
        <Choicebox value="a" title="基础" />
        <Choicebox value="b" title="专业" />
      </ChoiceboxGroup>,
    );
    expect(getByRole("radiogroup")).toBeTruthy();
    expect(getAllByRole("radio").length).toBe(2);
  });

  it("非受控单选：点击选中并反映 checked", () => {
    const { getByLabelText } = render(
      <ChoiceboxGroup aria-label="g">
        <Choicebox value="a" title="基础" />
        <Choicebox value="b" title="专业" />
      </ChoiceboxGroup>,
    );
    const b = getByLabelText("专业") as HTMLInputElement;
    fireEvent.click(b);
    expect(b.checked).toBe(true);
  });

  it("受控单选：onValueChange 回传 string", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(
      <ChoiceboxGroup value="a" onValueChange={fn} aria-label="g">
        <Choicebox value="a" title="基础" />
        <Choicebox value="b" title="专业" />
      </ChoiceboxGroup>,
    );
    fireEvent.click(getByLabelText("专业"));
    expect(fn).toHaveBeenCalledWith("b");
  });

  it("多选渲染 checkbox 并累积/移除值", () => {
    const fn = vi.fn();
    const { getByLabelText, getAllByRole } = render(
      <ChoiceboxGroup multiple defaultValue={["a"]} onValueChange={fn} aria-label="g">
        <Choicebox value="a" title="甲" />
        <Choicebox value="b" title="乙" />
      </ChoiceboxGroup>,
    );
    expect(getAllByRole("checkbox").length).toBe(2);
    fireEvent.click(getByLabelText("乙"));
    expect(fn).toHaveBeenCalledWith(["a", "b"]);
    fireEvent.click(getByLabelText("甲"));
    expect(fn).toHaveBeenLastCalledWith(["b"]);
  });

  it("选中项卡片加 data-checked", () => {
    const { getByLabelText } = render(
      <ChoiceboxGroup defaultValue="a" aria-label="g">
        <Choicebox value="a" title="基础" />
      </ChoiceboxGroup>,
    );
    const label = getByLabelText("基础").closest("label")!;
    expect(label.hasAttribute("data-checked")).toBe(true);
  });

  it("整组 disabled 时项不可点", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(
      <ChoiceboxGroup disabled onValueChange={fn} aria-label="g">
        <Choicebox value="a" title="基础" />
      </ChoiceboxGroup>,
    );
    const input = getByLabelText("基础") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("描述与图标渲染", () => {
    const { getByText, container } = render(
      <ChoiceboxGroup aria-label="g">
        <Choicebox value="a" title="基础" description="适合个人" icon={<svg data-icon />} />
      </ChoiceboxGroup>,
    );
    expect(getByText("适合个人")).toBeTruthy();
    expect(container.querySelector("[data-icon]")).toBeTruthy();
  });

  it("脱离 Group 使用抛错", () => {
    expect(() => render(<Choicebox value="a" title="x" />)).toThrow();
  });
});
