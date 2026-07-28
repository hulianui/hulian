import { describe, expect, it } from "vitest";
import {
  buildOptions,
  clampTime,
  formatTime,
  intersectsRange,
  isHourDisabled,
  isMinuteDisabled,
  isSecondDisabled,
  parseTime,
  snapToStep,
  toCompare,
} from "./time-picker-core";

describe("parseTime", () => {
  it("认 HH:mm 与 HH:mm:ss", () => {
    expect(parseTime("09:30")).toEqual({ h: 9, m: 30, s: 0 });
    expect(parseTime("09:30:15")).toEqual({ h: 9, m: 30, s: 15 });
  });
  it("认不补零的写法", () => {
    expect(parseTime("9:5")).toEqual({ h: 9, m: 5, s: 0 });
  });
  it("空值与非法串返回 null", () => {
    expect(parseTime(null)).toBeNull();
    expect(parseTime("")).toBeNull();
    expect(parseTime("abc")).toBeNull();
    expect(parseTime("09-30")).toBeNull();
  });
  it("越界数字返回 null（不静默取模）", () => {
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("09:60")).toBeNull();
    expect(parseTime("09:30:60")).toBeNull();
  });
});

describe("formatTime / toCompare", () => {
  it("补零到定宽", () => {
    expect(formatTime({ h: 9, m: 5, s: 3 }, false)).toBe("09:05");
    expect(formatTime({ h: 9, m: 5, s: 3 }, true)).toBe("09:05:03");
  });
  it("toCompare 恒补到 HH:mm:ss，字典序即时间序", () => {
    expect(toCompare("9:5")).toBe("09:05:00");
    expect(toCompare("09:05:00")! < toCompare("09:30:00")!).toBe(true);
  });
});

describe("buildOptions", () => {
  it("按步进生成候选", () => {
    expect(buildOptions(59, 15)).toEqual([0, 15, 30, 45]);
    expect(buildOptions(23, 1)).toHaveLength(24);
  });
  it("非法步进退化为 1", () => {
    expect(buildOptions(5, 0)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(buildOptions(5, -3)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(buildOptions(5, 1.5)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});

describe("intersectsRange", () => {
  it("无 min/max 时恒相交", () => {
    expect(intersectsRange("00:00:00", "23:59:59")).toBe(true);
  });
  it("整段在范围外才算不相交", () => {
    expect(intersectsRange("08:00:00", "08:59:59", "09:30")).toBe(false);
    expect(intersectsRange("09:00:00", "09:59:59", "09:30")).toBe(true);
  });
});

describe("逐列禁用判定", () => {
  it("min=09:30：8 点整点禁、9 点可选（内部再按分钟细分）", () => {
    expect(isHourDisabled(8, "09:30")).toBe(true);
    expect(isHourDisabled(9, "09:30")).toBe(false);
    expect(isHourDisabled(10, "09:30")).toBe(false);
  });
  it("min=09:30：9 点内 30 分之前的分钟被禁", () => {
    expect(isMinuteDisabled(9, 29, "09:30")).toBe(true);
    expect(isMinuteDisabled(9, 30, "09:30")).toBe(false);
    // 10 点起整点内分钟不受 min 影响
    expect(isMinuteDisabled(10, 0, "09:30")).toBe(false);
  });
  it("max=18:00：18:00 这一分钟本身可选，之后的分钟被禁", () => {
    // 18:00 段是 [18:00:00, 18:00:59]，与上界 18:00:00 有交集（就是那一秒）→ 可选
    expect(isMinuteDisabled(18, 0, undefined, "18:00")).toBe(false);
    expect(isMinuteDisabled(18, 1, undefined, "18:00")).toBe(true);
    expect(isHourDisabled(18, undefined, "18:00")).toBe(false);
    expect(isHourDisabled(19, undefined, "18:00")).toBe(true);
  });
  it("秒列按精确时刻判", () => {
    expect(isSecondDisabled(9, 30, 0, "09:30:05")).toBe(true);
    expect(isSecondDisabled(9, 30, 5, "09:30:05")).toBe(false);
    expect(isSecondDisabled(9, 30, 6, "09:30:05")).toBe(false);
  });
});

describe("snapToStep", () => {
  it("向下取整对齐到步进", () => {
    expect(snapToStep({ h: 9, m: 37, s: 43 }, 15, 10)).toEqual({ h: 9, m: 30, s: 40 });
  });
  it("步进 1 时原样返回", () => {
    expect(snapToStep({ h: 9, m: 37, s: 43 })).toEqual({ h: 9, m: 37, s: 43 });
  });
  it("非法步进按 1 处理", () => {
    expect(snapToStep({ h: 9, m: 37, s: 43 }, 0, -1)).toEqual({ h: 9, m: 37, s: 43 });
  });
});

describe("clampTime", () => {
  it("低于 min 抬到 min", () => {
    expect(clampTime({ h: 8, m: 0, s: 0 }, false, "09:30")).toEqual({ h: 9, m: 30, s: 0 });
  });
  it("高于 max 压到 max", () => {
    expect(clampTime({ h: 20, m: 0, s: 0 }, false, undefined, "18:00")).toEqual({ h: 18, m: 0, s: 0 });
  });
  it("范围内原样返回", () => {
    expect(clampTime({ h: 10, m: 0, s: 0 }, false, "09:30", "18:00")).toEqual({ h: 10, m: 0, s: 0 });
  });
  it("无范围时原样返回", () => {
    expect(clampTime({ h: 3, m: 3, s: 3 }, true)).toEqual({ h: 3, m: 3, s: 3 });
  });
});
