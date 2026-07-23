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

  it("min 下限：按 (value-min)/(max-min) 值域比例分档（小数掌握率场景）", () => {
    // domain [0.5, 0.9]：0.55 → 低档，0.88 → 顶档（不再挤在同一档）
    expect(bucketize(0.55, 0.9, 5, 0.5)).toBe(1);
    expect(bucketize(0.7, 0.9, 5, 0.5)).toBe(3);
    expect(bucketize(0.88, 0.9, 5, 0.5)).toBe(5);
  });
  it("min 下限：value ≤ min → 0 档；max ≤ min → 0 档", () => {
    expect(bucketize(0.5, 0.9, 5, 0.5)).toBe(0);
    expect(bucketize(0.3, 0.9, 5, 0.5)).toBe(0);
    expect(bucketize(0.6, 0.5, 5, 0.5)).toBe(0);
  });
  it("不传 min 与旧行为完全一致", () => {
    expect(bucketize(6, 10, 5)).toBe(bucketize(6, 10, 5, 0));
  });
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

describe("Heatmap 小数值域 / 图例（issue #10）", () => {
  const rates = [
    { x: "函数", y: "一班", value: 0.55 },
    { x: "函数", y: "二班", value: 0.88 },
  ];

  it("valueFormat：默认 tooltip 走格式化（比率→百分比）", () => {
    const { getByLabelText } = render(
      <Heatmap
        data={rates}
        showLabels={false}
        domain={[0, 1]}
        valueFormat={(v) => `${Math.round(v * 100)}%`}
      />,
    );
    expect(getByLabelText("一班 · 函数：55%")).toBeTruthy();
    expect(getByLabelText("二班 · 函数：88%")).toBeTruthy();
  });

  it("unit：原始值后拼后缀（valueFormat 未传时生效）", () => {
    const { getByLabelText } = render(
      <Heatmap data={[{ x: "周一", y: "A", value: 8 }]} showLabels={false} unit=" 次" />,
    );
    expect(getByLabelText("A · 周一：8 次")).toBeTruthy();
  });

  it("domain 收紧值域：0.55 与 0.88 落不同色阶档（背景透明度不同）", () => {
    const { getByLabelText } = render(
      <Heatmap data={rates} showLabels={false} domain={[0.5, 0.9]} />,
    );
    const low = getByLabelText("一班 · 函数：0.55") as HTMLElement;
    const high = getByLabelText("二班 · 函数：0.88") as HTMLElement;
    expect(low.style.background).not.toBe(high.style.background);
  });

  it("小数数据不传 max：按数据最大值分档（不再抬到 1），顶值即顶档", () => {
    const { getByLabelText } = render(
      <Heatmap
        data={rates}
        showLabels={false}
        formatTooltip={(c) => `${c.y}:${c.value}`}
        colorScale={5}
      />,
    );
    // 0.88 为数据最大 → 顶档 = colorScale 档背景（alpha 100%）
    const top = getByLabelText("二班:0.88") as HTMLElement;
    expect(top.style.background).toContain("100%");
  });

  it("showLegend：渲染 colorScale+1 个色阶块 + 值域两端标签", () => {
    const { container, getByText } = render(
      <Heatmap
        data={rates}
        showLabels={false}
        domain={[0, 1]}
        showLegend
        valueFormat={(v) => `${Math.round(v * 100)}%`}
      />,
    );
    expect(getByText("0%")).toBeTruthy();
    expect(getByText("100%")).toBeTruthy();
    // 2 个数据格 + 6 个图例块（colorScale 5 + 1 个 0 档）
    expect(container.querySelectorAll(".rounded-\\[2px\\]").length).toBe(8);
  });

  it("默认不渲染图例（向后兼容）", () => {
    const { container } = render(<Heatmap data={rates} showLabels={false} />);
    expect(container.querySelectorAll(".rounded-\\[2px\\]").length).toBe(2);
  });
});
