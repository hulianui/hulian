import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Meter } from "./meter";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Meter", () => {
  it("稳定父更新时跳过度量条子树", async () => {
    await expectMemoSkipsSubtree(() => <Meter value={64} label="磁盘用量" showValue />);
  });

  it("渲染 role=meter + aria-valuenow", () => {
    const { container } = render(<Meter value={40} />);
    const m = container.querySelector('[role="meter"]')!;
    expect(m).toBeTruthy();
    expect(m.getAttribute("aria-valuenow")).toBe("40");
  });

  it("min/max 透传 aria-valuemin/max", () => {
    const { container } = render(<Meter value={5} min={0} max={10} />);
    const m = container.querySelector('[role="meter"]')!;
    expect(m.getAttribute("aria-valuemin")).toBe("0");
    expect(m.getAttribute("aria-valuemax")).toBe("10");
  });

  it("label 渲染", () => {
    const { getByText } = render(<Meter value={40} label="磁盘用量" />);
    expect(getByText("磁盘用量")).toBeTruthy();
  });

  it("showValue 渲染格式化值", () => {
    const { container } = render(<Meter value={40} showValue />);
    expect(container.textContent).toContain("40");
  });

  it("几何禁区：Indicator 不写死字面宽度类（宽度交 Base UI 内联自算）", () => {
    const { container } = render(<Meter value={40} />);
    const indicator = container.querySelector(".h-full.rounded-full")!;
    expect(indicator).toBeTruthy();
    expect(indicator.className).toContain("bg-primary");
    expect(indicator.className).not.toMatch(/\bw-/);
  });
});

// max ≠ 100 时，可见文字与 aria-valuetext 必须与指示条同口径 —— Base UI 的默认实现是
// 「原始 value 直接拼 %」，条形 25% 而字印 50%（hulianui/hulian#108）。
describe("Meter · 数值文案与指示条同口径", () => {
  it("max ≠ 100 时按 (value-min)/(max-min) 归一化，而不是拿原始 value 当百分比", () => {
    const { container } = render(<Meter value={50} max={200} label="半满" showValue />);
    const meter = container.querySelector('[role="meter"]')!;
    expect(meter.getAttribute("aria-valuetext")).toBe("25%");
    expect(container.textContent).toContain("25%");
    expect(container.textContent).not.toContain("50%");
    // 原始值仍如实报给辅助技术
    expect(meter.getAttribute("aria-valuenow")).toBe("50");
    expect(meter.getAttribute("aria-valuemax")).toBe("200");
  });

  it("min 非 0 时一并计入", () => {
    const { container } = render(<Meter value={60} min={20} max={120} showValue />);
    expect(container.querySelector('[role="meter"]')!.getAttribute("aria-valuetext")).toBe("40%");
  });

  it("最多保留一位小数（1041/1324 → 78.6%）", () => {
    const { container } = render(<Meter value={1041} max={1324} showValue />);
    expect(container.textContent).toContain("78.6%");
  });

  it("formatValue 同时接管可见文字与 aria-valuetext，两者不会不一致", () => {
    const { container } = render(
      <Meter
        value={1041}
        max={1324}
        label="已挂教材章节"
        showValue
        formatValue={({ value, max }) => `${value} / ${max} 道题`}
      />,
    );
    const meter = container.querySelector('[role="meter"]')!;
    expect(meter.getAttribute("aria-valuetext")).toBe("1041 / 1324 道题");
    expect(container.textContent).toContain("1041 / 1324 道题");
  });

  it("max === min 不产生 NaN/Infinity", () => {
    const { container } = render(<Meter value={5} min={5} max={5} showValue />);
    expect(container.querySelector('[role="meter"]')!.getAttribute("aria-valuetext")).toBe("0%");
  });

  it("越界值夹到 0–100", () => {
    const { container } = render(<Meter value={999} max={100} showValue />);
    expect(container.querySelector('[role="meter"]')!.getAttribute("aria-valuetext")).toBe("100%");
  });
});
