import { describe, it, expect } from "vitest";
import {
  clampTime,
  formatTime,
  normalizeBound,
  parseTime,
  segmentText,
  stepSegment,
  typeDigit,
} from "./time-field-core";

describe("parseTime", () => {
  it("解析 HH:mm 与 HH:mm:ss", () => {
    expect(parseTime("09:30")).toEqual({ hour: 9, minute: 30, second: null });
    expect(parseTime("23:59:58")).toEqual({ hour: 23, minute: 59, second: 58 });
  });

  it("空值与非法串一律给全空段", () => {
    expect(parseTime(null)).toEqual({ hour: null, minute: null, second: null });
    expect(parseTime("")).toEqual({ hour: null, minute: null, second: null });
    expect(parseTime("abc")).toEqual({ hour: null, minute: null, second: null });
    expect(parseTime("9-30")).toEqual({ hour: null, minute: null, second: null });
  });

  it("越界的段单独作废，不牵连其他段", () => {
    expect(parseTime("25:30")).toEqual({ hour: null, minute: 30, second: null });
    expect(parseTime("09:70")).toEqual({ hour: 9, minute: null, second: null });
  });
});

describe("formatTime", () => {
  it("补零输出", () => {
    expect(formatTime({ hour: 9, minute: 5, second: null }, false)).toBe("09:05");
    expect(formatTime({ hour: 9, minute: 5, second: 7 }, true)).toBe("09:05:07");
  });

  it("缺段返回 null —— 半截时间不该流到业务里", () => {
    expect(formatTime({ hour: 9, minute: null, second: null }, false)).toBeNull();
    expect(formatTime({ hour: null, minute: 30, second: null }, false)).toBeNull();
    expect(formatTime({ hour: 9, minute: 30, second: null }, true)).toBeNull();
  });

  it("withSeconds=false 时忽略已有的秒", () => {
    expect(formatTime({ hour: 9, minute: 30, second: 45 }, false)).toBe("09:30");
  });
});

describe("stepSegment", () => {
  it("段内循环", () => {
    expect(stepSegment(23, "hour", 1)).toBe(0);
    expect(stepSegment(0, "hour", -1)).toBe(23);
    expect(stepSegment(59, "minute", 1)).toBe(0);
    expect(stepSegment(0, "second", -1)).toBe(59);
  });

  it("空段起步：↑ 从最小、↓ 从最大", () => {
    expect(stepSegment(null, "hour", 1)).toBe(0);
    expect(stepSegment(null, "hour", -1)).toBe(23);
    expect(stepSegment(null, "minute", -1)).toBe(59);
  });
});

describe("typeDigit", () => {
  it("首位放得下就等第二位", () => {
    expect(typeDigit("", "1", "hour")).toEqual({ value: 1, buffer: "1", complete: false });
    expect(typeDigit("", "0", "minute")).toEqual({ value: 0, buffer: "0", complete: false });
  });

  it("首位补零后已超范围就直接定形", () => {
    // 小时按 3 → 30 点不存在，这一位就是最终值
    expect(typeDigit("", "3", "hour")).toEqual({ value: 3, buffer: "", complete: true });
    expect(typeDigit("", "6", "minute")).toEqual({ value: 6, buffer: "", complete: true });
  });

  it("两位合法就合成", () => {
    expect(typeDigit("1", "5", "hour")).toEqual({ value: 15, buffer: "", complete: true });
    expect(typeDigit("2", "3", "hour")).toEqual({ value: 23, buffer: "", complete: true });
    expect(typeDigit("5", "9", "minute")).toEqual({ value: 59, buffer: "", complete: true });
  });

  it("第二位放不下时当新首位重来，而不是钳到边界", () => {
    // 先按 2 再按 9：29 点不存在 —— 钳成 23 点是凭空造值，取 9 作新首位才是用户要的
    expect(typeDigit("2", "9", "hour")).toEqual({ value: 9, buffer: "", complete: true });
    // 分钟先按 5 再按 9 = 59 合法；先按 5 再按 9 之后再来一次 9 → 从头开始
    expect(typeDigit("5", "9", "minute")).toEqual({ value: 59, buffer: "", complete: true });
    // 小时先按 1 再按 9 = 19 合法，不该被当成重来
    expect(typeDigit("1", "9", "hour")).toEqual({ value: 19, buffer: "", complete: true });
  });

  it("非数字键不产生副作用", () => {
    expect(typeDigit("1", "a", "hour")).toEqual({ value: 0, buffer: "", complete: false });
  });
});

describe("normalizeBound / clampTime", () => {
  it("边界补齐到当前形状，秒缺省按 :00", () => {
    expect(normalizeBound("18:00", true)).toBe("18:00:00");
    expect(normalizeBound("18:00:30", false)).toBe("18:00");
    expect(normalizeBound(undefined, true)).toBeUndefined();
    expect(normalizeBound("乱写", true)).toBeUndefined();
  });

  it("越界钳到边界", () => {
    expect(clampTime("08:00", false, "09:30", "18:00")).toBe("09:30");
    expect(clampTime("19:00", false, "09:30", "18:00")).toBe("18:00");
    expect(clampTime("12:00", false, "09:30", "18:00")).toBe("12:00");
  });

  it("形状不一致时也判得对（前缀相同则长者为大，不补齐就会误钳）", () => {
    // "18:00:30" > "18:00" 字符串成立；补齐后与 "18:00:00" 比较才是对的
    expect(clampTime("18:00:30", true, undefined, "18:00")).toBe("18:00:00");
    expect(clampTime("17:59:59", true, undefined, "18:00")).toBe("17:59:59");
  });

  it("无边界时原样返回", () => {
    expect(clampTime("23:59", false)).toBe("23:59");
  });
});

describe("segmentText", () => {
  it("空段渲染成 --", () => {
    expect(segmentText({ hour: null, minute: 5, second: null }, "hour")).toBe("--");
    expect(segmentText({ hour: null, minute: 5, second: null }, "minute")).toBe("05");
  });
});
