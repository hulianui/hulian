import { describe, it, expect } from "vitest";
import {
  boundDate,
  clampDateTime,
  effectiveTimeBounds,
  joinDateTime,
  splitDateTime,
} from "./date-time-picker-core";

describe("splitDateTime", () => {
  it("拆出日期与时间", () => {
    expect(splitDateTime("2026-06-08 09:30")).toEqual({ date: "2026-06-08", time: "09:30" });
    expect(splitDateTime("2026-06-08 09:30:15")).toEqual({ date: "2026-06-08", time: "09:30:15" });
  });

  it("只有日期时时间为 null", () => {
    expect(splitDateTime("2026-06-08")).toEqual({ date: "2026-06-08", time: null });
  });

  it("日期段不合法就整体作废 —— 时间脱离日期没有意义", () => {
    expect(splitDateTime("06-08 09:30")).toEqual({ date: null, time: null });
    expect(splitDateTime("乱写 09:30")).toEqual({ date: null, time: null });
  });

  it("时间段不合法只丢时间", () => {
    expect(splitDateTime("2026-06-08 9:3")).toEqual({ date: "2026-06-08", time: null });
  });

  it("空值给全 null", () => {
    expect(splitDateTime(null)).toEqual({ date: null, time: null });
    expect(splitDateTime("")).toEqual({ date: null, time: null });
  });
});

describe("joinDateTime", () => {
  it("按 withSeconds 对齐形状", () => {
    expect(joinDateTime("2026-06-08", "09:30", false)).toBe("2026-06-08 09:30");
    expect(joinDateTime("2026-06-08", "09:30", true)).toBe("2026-06-08 09:30:00");
    expect(joinDateTime("2026-06-08", "09:30:15", false)).toBe("2026-06-08 09:30");
    expect(joinDateTime("2026-06-08", "09:30:15", true)).toBe("2026-06-08 09:30:15");
  });

  it("缺时间补零点", () => {
    expect(joinDateTime("2026-06-08", null, false)).toBe("2026-06-08 00:00");
    expect(joinDateTime("2026-06-08", null, true)).toBe("2026-06-08 00:00:00");
  });

  it("没有日期就没有值", () => {
    expect(joinDateTime(null, "09:30", false)).toBeNull();
  });
});

describe("boundDate", () => {
  it("取边界的日期段给日历用", () => {
    expect(boundDate("2026-06-08 09:30")).toBe("2026-06-08");
    expect(boundDate(undefined)).toBeUndefined();
  });
});

describe("effectiveTimeBounds", () => {
  it("压在下界那天才限制最早时间", () => {
    expect(effectiveTimeBounds("2026-06-08", "2026-06-08 09:30", undefined)).toEqual({ minTime: "09:30" });
  });

  it("压在上界那天才限制最晚时间", () => {
    expect(effectiveTimeBounds("2026-06-20", undefined, "2026-06-20 18:00")).toEqual({ maxTime: "18:00" });
  });

  it("区间内部的日子 24 小时全开 —— 这正是最容易写错的地方", () => {
    expect(effectiveTimeBounds("2026-06-10", "2026-06-08 09:30", "2026-06-20 18:00")).toEqual({});
  });

  it("同一天既是下界又是上界时两头都限", () => {
    expect(effectiveTimeBounds("2026-06-08", "2026-06-08 09:30", "2026-06-08 18:00")).toEqual({
      minTime: "09:30",
      maxTime: "18:00",
    });
  });

  it("边界只给了日期没给时间就不限时间", () => {
    expect(effectiveTimeBounds("2026-06-08", "2026-06-08", undefined)).toEqual({});
  });

  it("没选日期时无从推导", () => {
    expect(effectiveTimeBounds(null, "2026-06-08 09:30", undefined)).toEqual({});
  });
});

describe("clampDateTime", () => {
  it("越界钳到边界", () => {
    expect(clampDateTime("2026-06-01 08:00", false, "2026-06-08 09:30", "2026-06-20 18:00")).toBe(
      "2026-06-08 09:30",
    );
    expect(clampDateTime("2026-06-25 08:00", false, "2026-06-08 09:30", "2026-06-20 18:00")).toBe(
      "2026-06-20 18:00",
    );
  });

  it("区间内原样返回", () => {
    expect(clampDateTime("2026-06-10 12:00", false, "2026-06-08 09:30", "2026-06-20 18:00")).toBe(
      "2026-06-10 12:00",
    );
  });

  it("形状不一致时也判得对（前缀相同则长者为大，不补齐就会误钳）", () => {
    // "2026-06-20 18:00:30" > "2026-06-20 18:00" 字符串成立；补齐成 18:00:00 比较才对
    expect(clampDateTime("2026-06-20 18:00:30", true, undefined, "2026-06-20 18:00")).toBe(
      "2026-06-20 18:00:00",
    );
    expect(clampDateTime("2026-06-20 17:59:59", true, undefined, "2026-06-20 18:00")).toBe(
      "2026-06-20 17:59:59",
    );
  });

  it("无边界时原样返回", () => {
    expect(clampDateTime("2026-06-10 12:00", false)).toBe("2026-06-10 12:00");
  });
});
