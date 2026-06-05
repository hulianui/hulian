import { describe, it, expect } from "vitest";
import {
  allocateTrack,
  densityGap,
  estimateWidth,
  leastBusyTrack,
  scrollDuration,
  trackFreeTime,
} from "./danmaku-geometry";

describe("scrollDuration", () => {
  it("位移=容器宽+弹幕宽，除以速度", () => {
    expect(scrollDuration(800, 200, 100)).toBe(10);
  });
  it("速度<=0 返回 0（防除零）", () => {
    expect(scrollDuration(800, 200, 0)).toBe(0);
  });
});

describe("estimateWidth", () => {
  it("CJK 字符≈fontSize，含内边距", () => {
    // 4 个全角字 * 18 + 24 padding = 96
    expect(estimateWidth("弹幕测试", 18)).toBe(18 * 4 + 24);
  });
  it("ASCII 约 0.6×fontSize", () => {
    expect(estimateWidth("abc", 20)).toBe(Math.ceil(20 * 0.6 * 3) + 24);
  });
});

describe("allocateTrack", () => {
  it("返回首个已空闲轨道", () => {
    expect(allocateTrack([5000, 100, 5000], 200)).toBe(1);
  });
  it("都忙返回 -1", () => {
    expect(allocateTrack([5000, 6000], 1000)).toBe(-1);
  });
  it("多个空闲时取最靠前", () => {
    expect(allocateTrack([0, 0, 0], 100)).toBe(0);
  });
});

describe("leastBusyTrack", () => {
  it("返回 freeAt 最小的轨道", () => {
    expect(leastBusyTrack([900, 300, 700])).toBe(1);
  });
  it("空数组返回 0", () => {
    expect(leastBusyTrack([])).toBe(0);
  });
});

describe("trackFreeTime", () => {
  it("发车后按入场时间+间隙推后", () => {
    // (200+100)/100*1000 = 3000，加起点 1000 = 4000
    expect(trackFreeTime(1000, 200, 100, 100)).toBe(4000);
  });
  it("速度<=0 返回起点", () => {
    expect(trackFreeTime(1000, 200, 0, 100)).toBe(1000);
  });
});

describe("densityGap", () => {
  it("low 最稀疏，high 最密", () => {
    expect(densityGap("low")).toBeGreaterThan(densityGap("normal"));
    expect(densityGap("normal")).toBeGreaterThan(densityGap("high"));
  });
});
