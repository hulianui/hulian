import { describe, it, expect } from "vitest";
import { normalizeRadarData, RADAR_RAW } from "./chart-radar-axis";

const data = [
  { dim: "销售额", A: 250000, B: 500000 },
  { dim: "退货率", A: 30, B: 60 },
];
const seriesKeys = ["A", "B"];

describe("normalizeRadarData · 雷达图逐轴归一（#277）", () => {
  it("每根轴按各自满量程折算到 0–100", () => {
    const { data: out } = normalizeRadarData({
      data,
      xKey: "dim",
      seriesKeys,
      axisMax: { 销售额: 500000, 退货率: 100 },
    });
    expect(out[0].A).toBe(50);
    expect(out[0].B).toBe(100);
    expect(out[1].A).toBe(30);
    expect(out[1].B).toBe(60);
  });

  it("原始值随行带走，供 tooltip 显示（这正是业务侧自己归一时丢掉的那半截）", () => {
    const { data: out } = normalizeRadarData({
      data,
      xKey: "dim",
      seriesKeys,
      axisMax: { 销售额: 500000, 退货率: 100 },
    });
    expect(out[0][RADAR_RAW]).toEqual({ A: 250000, B: 500000 });
  });

  it("角轴名与非序列字段原样保留", () => {
    const { data: out } = normalizeRadarData({
      data: [{ dim: "销售额", A: 1, note: "备注" }],
      xKey: "dim",
      seriesKeys: ["A"],
      axisMax: { 销售额: 2 },
    });
    expect(out[0].dim).toBe("销售额");
    expect(out[0].note).toBe("备注");
  });

  it("缺配置的轴退回「本行最大值」，并报告出来供告警", () => {
    const { data: out, missingAxes } = normalizeRadarData({
      data,
      xKey: "dim",
      seriesKeys,
      axisMax: { 销售额: 500000 },
    });
    expect(missingAxes).toEqual(["退货率"]);
    // 本行最大值是 60 → A 归一为 50，B 顶满 100
    expect(out[1].A).toBe(50);
    expect(out[1].B).toBe(100);
  });

  it("满量程为 0 / 负数 / 非有限数视同没给", () => {
    const { missingAxes } = normalizeRadarData({
      data,
      xKey: "dim",
      seriesKeys,
      axisMax: { 销售额: 0, 退货率: Number.NaN },
    });
    expect(missingAxes).toEqual(["销售额", "退货率"]);
  });

  it("整行都没有可归一的数时输出 0，不产生 NaN/Infinity", () => {
    const { data: out } = normalizeRadarData({
      data: [{ dim: "空轴", A: 0, B: 0 }],
      xKey: "dim",
      seriesKeys,
      axisMax: {},
    });
    expect(out[0].A).toBe(0);
    expect(out[0].B).toBe(0);
  });

  it("非数字单元格既不归一也不进原始值表（不报错）", () => {
    const { data: out } = normalizeRadarData({
      data: [{ dim: "混排", A: "暂无", B: 5 }],
      xKey: "dim",
      seriesKeys,
      axisMax: { 混排: 10 },
    });
    expect(out[0].A).toBe("暂无");
    expect(out[0][RADAR_RAW]).toEqual({ B: 5 });
  });

  it("同一根缺配置的轴只报告一次（告警不刷屏）", () => {
    const { missingAxes } = normalizeRadarData({
      data: [
        { dim: "退货率", A: 1 },
        { dim: "退货率", A: 2 },
      ],
      xKey: "dim",
      seriesKeys: ["A"],
      axisMax: {},
    });
    expect(missingAxes).toEqual(["退货率"]);
  });

  it("不改原数组（纯函数）", () => {
    const input = [{ dim: "销售额", A: 250000 }];
    normalizeRadarData({ data: input, xKey: "dim", seriesKeys: ["A"], axisMax: { 销售额: 500000 } });
    expect(input[0].A).toBe(250000);
  });
});
