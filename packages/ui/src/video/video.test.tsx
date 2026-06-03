import { describe, it, expect } from "vitest";
import { formatTime, normalizeSrc, DEFAULT_PLAYBACK_RATES } from "./video.types";

describe("video pure logic", () => {
  it("formatTime 个位秒补零、分钟无前导零", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(600)).toBe("10:00");
  });
  it("formatTime 超过一小时显示 h:mm:ss", () => {
    expect(formatTime(3661)).toBe("1:01:01");
  });
  it("formatTime 对 NaN/负数/Infinity 兜底为 0:00", () => {
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(-5)).toBe("0:00");
    expect(formatTime(Infinity)).toBe("0:00");
  });
  it("normalizeSrc 字符串原样透传", () => {
    expect(normalizeSrc("a.mp4")).toBe("a.mp4");
  });
  it("normalizeSrc 数组透传给 Vidstack 的 src 形态", () => {
    const arr = [{ src: "a.mp4", type: "video/mp4" }];
    expect(normalizeSrc(arr)).toBe(arr);
  });
  it("默认倍速档位", () => {
    expect(DEFAULT_PLAYBACK_RATES).toEqual([0.5, 0.75, 1, 1.25, 1.5, 2]);
  });
});
