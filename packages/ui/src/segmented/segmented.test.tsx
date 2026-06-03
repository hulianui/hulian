import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Segmented } from "./segmented";
import type { SegmentedItem } from "./segmented.types";

const items: SegmentedItem[] = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

describe("Segmented", () => {
  it("渲染 role=radiogroup + 每段 role=radio", () => {
    const { getByRole, getAllByRole } = render(<Segmented items={items} aria-label="周期" />);
    expect(getByRole("radiogroup")).toBeTruthy();
    expect(getAllByRole("radio").length).toBe(3);
  });

  it("默认选中首个未禁用段 aria-checked=true", () => {
    const { getAllByRole } = render(<Segmented items={items} aria-label="周期" />);
    const radios = getAllByRole("radio");
    expect(radios[0].getAttribute("aria-checked")).toBe("true");
    expect(radios[1].getAttribute("aria-checked")).toBe("false");
  });

  it("defaultValue 指定初始选中段", () => {
    const { getByText } = render(<Segmented items={items} defaultValue="week" aria-label="周期" />);
    expect(getByText("周").getAttribute("aria-checked")).toBe("true");
  });

  it("点击切换选中 + onValueChange 收敛为 string", () => {
    let v: string | undefined;
    const { getByText } = render(
      <Segmented items={items} onValueChange={(x) => (v = x)} aria-label="周期" />,
    );
    fireEvent.click(getByText("月"));
    expect(v).toBe("month");
    expect(getByText("月").getAttribute("aria-checked")).toBe("true");
  });

  it("受控 value：点击不改内部态，仅回调照发", () => {
    let v: string | undefined;
    const { getByText } = render(
      <Segmented items={items} value="day" onValueChange={(x) => (v = x)} aria-label="周期" />,
    );
    fireEvent.click(getByText("周"));
    expect(v).toBe("week");
    // 受控未回写 → day 仍选中
    expect(getByText("日").getAttribute("aria-checked")).toBe("true");
    expect(getByText("周").getAttribute("aria-checked")).toBe("false");
  });

  it("roving tabindex：仅选中段 tabIndex=0，其余 -1", () => {
    const { getAllByRole } = render(<Segmented items={items} aria-label="周期" />);
    const radios = getAllByRole("radio");
    expect(radios[0].getAttribute("tabindex")).toBe("0");
    expect(radios[1].getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowRight 移动选中到下一段", () => {
    const { getAllByRole } = render(<Segmented items={items} aria-label="周期" />);
    const radios = getAllByRole("radio");
    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    expect(radios[1].getAttribute("aria-checked")).toBe("true");
  });

  it("ArrowLeft 在首段回绕到末段", () => {
    const { getAllByRole } = render(<Segmented items={items} aria-label="周期" />);
    const radios = getAllByRole("radio");
    fireEvent.keyDown(radios[0], { key: "ArrowLeft" });
    expect(radios[2].getAttribute("aria-checked")).toBe("true");
  });

  it("方向键跳过禁用段", () => {
    const withDisabled: SegmentedItem[] = [
      { value: "a", label: "甲" },
      { value: "b", label: "乙", disabled: true },
      { value: "c", label: "丙" },
    ];
    const { getAllByRole } = render(<Segmented items={withDisabled} aria-label="x" />);
    const radios = getAllByRole("radio");
    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    // 跳过禁用的乙 → 落到丙
    expect(radios[2].getAttribute("aria-checked")).toBe("true");
  });

  it("单段禁用 → 该 button disabled", () => {
    const withDisabled: SegmentedItem[] = [
      { value: "a", label: "甲" },
      { value: "b", label: "乙", disabled: true },
    ];
    const { getByText } = render(<Segmented items={withDisabled} aria-label="x" />);
    expect((getByText("乙") as HTMLButtonElement).disabled).toBe(true);
  });

  it("整体 disabled：radiogroup aria-disabled + 全段 button 禁用", () => {
    const { getByRole, getAllByRole } = render(
      <Segmented items={items} disabled aria-label="周期" />,
    );
    expect(getByRole("radiogroup").getAttribute("aria-disabled")).toBe("true");
    expect((getAllByRole("radio")[0] as HTMLButtonElement).disabled).toBe(true);
  });
});
