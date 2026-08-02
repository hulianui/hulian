import { describe, expect, it } from "vitest";
import { csatTrend, hourlyVolume } from "./metrics";

describe("customer-service chart protocol", () => {
  it("uses locale-neutral numeric keys for the volume series", () => {
    const data = hourlyVolume();
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((point) => typeof point.volume === "number")).toBe(true);
    expect(data.every((point) => !("会话量" in point) && !("Session volume" in point))).toBe(true);
  });

  it("uses locale-neutral numeric keys for the CSAT series", () => {
    const data = csatTrend();
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((point) => typeof point.csat === "number")).toBe(true);
    expect(data.every((point) => !("满意度" in point) && !("Satisfaction" in point))).toBe(true);
  });
});
