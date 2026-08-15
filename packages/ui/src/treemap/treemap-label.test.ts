import { describe, it, expect } from "vitest";
import { textWidth, treemapLabelFit, TREEMAP_LABEL_PAD } from "./treemap-label";

const fit = (width: number, height: number, name = "杭州湖滨店", showValue = true) =>
  treemapLabelFit({ width, height, name, nameFontSize: 12, valueFontSize: 11, showValue });

describe("textWidth · CJK 全角按字号、半角按 0.62 倍估宽", () => {
  it("全角字符按字号计", () => {
    expect(textWidth("门店", 12)).toBe(24);
  });
  it("半角字符按 0.62 倍计", () => {
    expect(textWidth("ab", 12)).toBeCloseTo(14.88, 5);
  });
  it("中英混排逐字累加", () => {
    expect(textWidth("A店", 12)).toBeCloseTo(12 * 0.62 + 12, 5);
  });
});

describe("treemapLabelFit · 格子放得下哪几行字（#276）", () => {
  it("够宽够高：名字与数值都画", () => {
    // 5 个全角字 = 60px，加两侧 6px 内边距 → 至少 72px 宽；两行高 = 12 + 13.2 → 至少 37.2 + 12
    expect(fit(120, 80)).toEqual({ name: true, value: true });
  });

  it("宽度不够：一行都不画（宁可空着也不画半个名字）", () => {
    expect(fit(40, 80)).toEqual({ name: false, value: false });
  });

  it("高度不够放两行：只画名字", () => {
    // 内高 = 30 - 12 = 18，够一行 12 不够两行 25.2
    expect(fit(120, 30)).toEqual({ name: true, value: false });
  });

  it("高度连一行都不够：都不画", () => {
    expect(fit(120, 16)).toEqual({ name: false, value: false });
  });

  it("showValue=false 时数值行恒不画，名字不受影响", () => {
    expect(fit(120, 80, "杭州湖滨店", false)).toEqual({ name: true, value: false });
  });

  it("名字越长要求越宽（判据是文本实际宽度不是字数）", () => {
    const short = fit(80, 80, "A店");
    const long = fit(80, 80, "上海南京西路店");
    expect(short.name).toBe(true);
    expect(long.name).toBe(false);
  });

  it("内边距真的被扣掉：恰好等于文本宽的格子放不下", () => {
    const w = textWidth("门店", 12); // 24
    expect(fit(w, 80, "门店").name).toBe(false);
    expect(fit(w + TREEMAP_LABEL_PAD * 2, 80, "门店").name).toBe(true);
  });
});
