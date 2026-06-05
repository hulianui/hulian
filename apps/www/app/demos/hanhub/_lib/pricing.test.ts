import { describe, it, expect } from "vitest";
import { costOf, topupFee, formatUsd } from "./pricing";

describe("costOf", () => {
  it("1M 输入 token × $5 = $5", () => {
    expect(costOf(1_000_000, 0, 5, 25, 1)).toBe(5);
  });
  it("输入+输出分开计价", () => {
    expect(costOf(1_000_000, 1_000_000, 5, 25, 1)).toBe(30);
  });
  it("倍率叠加", () => {
    expect(costOf(1_000_000, 0, 5, 25, 1.2)).toBeCloseTo(6, 5);
  });
});

describe("topupFee", () => {
  it("小额走 $0.80 下限", () => {
    expect(topupFee(10)).toBe(0.8);
  });
  it("大额走 5.5%", () => {
    expect(topupFee(100)).toBeCloseTo(5.5, 5);
  });
});

describe("formatUsd", () => {
  it("小额保 4 位", () => {
    expect(formatUsd(0.00169)).toBe("$0.0017");
  });
  it("大额千分位 2 位", () => {
    expect(formatUsd(1234.5)).toBe("$1,234.50");
  });
});
