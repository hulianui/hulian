import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { buildMatrix, bucketize } from "./heatmap.matrix";
import { Heatmap } from "./heatmap";

describe("buildMatrix", () => {
  it("命中已有点，缺省 0", () => {
    const { get, xs, ys } = buildMatrix([
      { x: "周一", y: "A", value: 5 },
      { x: "周二", y: "B", value: 3 },
    ]);
    expect(get("A", "周一")).toBe(5);
    expect(get("B", "周二")).toBe(3);
    expect(get("A", "周二")).toBe(0);
    expect(xs).toContain("周一");
    expect(ys).toContain("B");
  });
  it("显式标签优先", () => {
    const { xs, ys } = buildMatrix([{ x: 1, y: 1, value: 1 }], [1, 2, 3], ["x", "y"]);
    expect(xs).toEqual([1, 2, 3]);
    expect(ys).toEqual(["x", "y"]);
  });
});

describe("bucketize", () => {
  it("0 值或 0 max → 0 档", () => {
    expect(bucketize(0, 10, 5)).toBe(0);
    expect(bucketize(5, 0, 5)).toBe(0);
  });
  it("满值 → 顶档", () => expect(bucketize(10, 10, 5)).toBe(5));
  it("正值至少 1 档", () => expect(bucketize(1, 100, 5)).toBe(1));
  it("中间值落档", () => expect(bucketize(6, 10, 5)).toBe(3));
});

describe("Heatmap", () => {
  const data = [
    { x: "周一", y: "登录", value: 4 },
    { x: "周二", y: "登录", value: 0 },
    { x: "周一", y: "支付", value: 8 },
  ];
  it("格子数 = xs × ys", () => {
    const { container } = render(<Heatmap data={data} showLabels={false} />);
    // xs=[周一,周二] ys=[登录,支付] → 4 格
    expect(container.querySelectorAll(".rounded-\\[2px\\]").length).toBe(4);
  });
  it("点击触发 onCellClick", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<Heatmap data={data} onCellClick={fn} showLabels={false} />);
    fireEvent.click(getByLabelText("支付 · 周一：8"));
    expect(fn).toHaveBeenCalledWith({ x: "周一", y: "支付", value: 8 });
  });
  it("formatTooltip 自定义提示", () => {
    const { getByLabelText } = render(
      <Heatmap data={data} showLabels={false} formatTooltip={(c) => `自定义${c.value}`} onCellClick={() => {}} />,
    );
    expect(getByLabelText("自定义8")).toBeTruthy();
  });
});
