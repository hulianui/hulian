import { describe, expect, it } from "vitest";
import { evaluateSla, percentile } from "./sla";

describe("evaluateSla", () => {
  it("低于 80% SLA → met", () => {
    const r = evaluateSla(3000, 5000); // 60%
    expect(r.status).toBe("met");
    expect(r.ratio).toBeCloseTo(0.6);
    expect(r.marginMs).toBe(2000);
  });
  it("80%-100% 之间 → at-risk", () => {
    const r = evaluateSla(4500, 5000); // 90%
    expect(r.status).toBe("at-risk");
  });
  it("恰好 80% → at-risk（下界含）", () => {
    expect(evaluateSla(4000, 5000).status).toBe("at-risk");
  });
  it("超过 100% → violated，余量为负", () => {
    const r = evaluateSla(6000, 5000); // 120%
    expect(r.status).toBe("violated");
    expect(r.marginMs).toBe(-1000);
  });
  it("slaMs<=0 不除零，按 violated 兜底", () => {
    const r = evaluateSla(100, 0);
    expect(Number.isFinite(r.ratio)).toBe(true);
    expect(r.status).toBe("violated");
  });
});

describe("percentile", () => {
  it("P50 取中位", () => {
    expect(percentile([10, 20, 30, 40, 50], 50)).toBe(30);
  });
  it("P95 接近最大", () => {
    const samples = Array.from({ length: 100 }, (_, i) => i + 1); // 1..100
    expect(percentile(samples, 95)).toBeGreaterThanOrEqual(95);
  });
  it("P0 取最小，P100 取最大", () => {
    expect(percentile([5, 1, 9, 3], 0)).toBe(1);
    expect(percentile([5, 1, 9, 3], 100)).toBe(9);
  });
  it("空样本返回 0", () => {
    expect(percentile([], 50)).toBe(0);
  });
  it("单样本任意分位都返回该值", () => {
    expect(percentile([42], 50)).toBe(42);
    expect(percentile([42], 95)).toBe(42);
  });
});
