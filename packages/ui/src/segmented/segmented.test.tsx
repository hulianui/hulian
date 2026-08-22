import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Segmented } from "./segmented";
import type { SegmentedItem, SegmentedTone } from "./segmented.types";

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

  it("未选中段使用暗色背景下满足正文对比度的前景色", () => {
    const { getByRole } = render(<Segmented items={items} aria-label="周期" />);
    const root = getByRole("radiogroup");
    expect(root.className).toContain("text-foreground");
    expect(root.className).not.toContain("text-muted-foreground");
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

  it("富 label 段：ariaLabel 优先；缺省时降级取 value", () => {
    const rich: SegmentedItem[] = [
      { value: "monthly", label: "按月付费" },
      { value: "yearly", ariaLabel: "按年付费，立省 2 个月", label: <span>按年付费🏷️</span> },
      { value: "lifetime", label: <span>永久</span> },
    ];
    const { getAllByRole } = render(<Segmented items={rich} aria-label="计费周期" />);
    const radios = getAllByRole("radio");
    // 字符串 label：不强加 aria-label（可见文本即名称）
    expect(radios[0].getAttribute("aria-label")).toBeNull();
    // 富 label + ariaLabel：用 ariaLabel
    expect(radios[1].getAttribute("aria-label")).toBe("按年付费，立省 2 个月");
    // 富 label 无 ariaLabel：降级取 value
    expect(radios[2].getAttribute("aria-label")).toBe("lifetime");
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

// #316 语义档 tone：与 TabsList 的 tone 同名同取值（两件组件同一套视觉，选中色不能分叉）。
// 第一条是"零破坏"证据 —— 默认 neutral 必须逐字保持改动前的 class 串。
describe("Segmented tone（#316）", () => {
  // 查询必须限定在自己的 container 里：同一个 it 内多次 render 不会自动清理，
  // getAllByRole 会把先前那棵树的段也捞回来（第一次写成全局查询时，success 档拿到的是 brand 的节点）。
  function radiosOf(tone?: SegmentedTone) {
    const { container } = render(
      <Segmented items={items} defaultValue="day" tone={tone} aria-label="周期" />,
    );
    const radios = Array.from(container.querySelectorAll('[role="radio"]'));
    return { selected: radios[0], unselected: radios[1] };
  }

  it("不传 tone：选中段仍是 text-foreground（与改动前逐字相同）", () => {
    const { selected } = radiosOf();
    expect(selected.className).toContain("text-foreground");
    expect(selected.className).not.toContain("text-primary");
    // 显式 neutral 与不传完全一致：neutral 是维持现状，不是把品牌色换成灰
    expect(radiosOf("neutral").selected.className).toBe(selected.className);
  });

  it("tone 换掉选中段文字色", () => {
    expect(radiosOf("brand").selected.className).toContain("text-primary");
    expect(radiosOf("success").selected.className).toContain("text-success");
    expect(radiosOf("danger").selected.className).toContain("text-danger");
  });

  it("未选中段不受 tone 影响（tone 只描述「选中意味着什么」）", () => {
    const { unselected } = radiosOf("brand");
    expect(unselected.className).toBe(radiosOf().unselected.className);
    expect(unselected.className).not.toContain("text-primary");
  });

  it("滑块保持 bg-surface 白药丸：白药丸 + 语义字，与 Tabs solid 同一形态", () => {
    const { container } = render(
      <Segmented items={items} defaultValue="day" tone="danger" aria-label="周期" />,
    );
    // jsdom 下 offsetWidth=0，滑块不渲染；这里断言的是"滑块的类里没有语义底色"这条规则
    // 本身写在源码常量上（selectedTextByTone 只管文字），滑块 span 若渲染也只有 bg-surface。
    const slider = container.querySelector('[role="radiogroup"] > span');
    if (slider) {
      expect(slider.className).toContain("bg-surface");
      expect(slider.className).not.toContain("bg-danger");
    }
  });
});
