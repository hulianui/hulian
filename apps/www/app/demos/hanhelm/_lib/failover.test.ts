import { describe, expect, it } from "vitest";
import { nextFallback } from "./failover";
import type { ExecutorHealth } from "../_data/types";

const chain = ["a", "b", "c", "d"];
const health: Record<string, ExecutorHealth> = {
  a: "healthy",
  b: "offline",
  c: "degraded",
  d: "healthy",
};

describe("nextFallback", () => {
  it("返回失败者之后第一个 healthy 的 id", () => {
    // a 失败 → b offline 跳过 → c degraded 跳过 → d healthy
    expect(nextFallback(chain, "a", health)).toBe("d");
  });
  it("从中间失败者继续往后找", () => {
    expect(nextFallback(chain, "b", health)).toBe("d");
  });
  it("链尽（失败者是最后一个）返回 null", () => {
    expect(nextFallback(chain, "d", health)).toBeNull();
  });
  it("失败者不在链中返回 null", () => {
    expect(nextFallback(chain, "zzz", health)).toBeNull();
  });
  it("后续全不健康返回 null", () => {
    const allBad: Record<string, ExecutorHealth> = { a: "healthy", b: "offline", c: "offline" };
    expect(nextFallback(["a", "b", "c"], "a", allBad)).toBeNull();
  });
  it("degraded 视为不可降级目标（仅 healthy 才接）", () => {
    const h: Record<string, ExecutorHealth> = { a: "healthy", b: "degraded" };
    expect(nextFallback(["a", "b"], "a", h)).toBeNull();
  });
});
