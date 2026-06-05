import { describe, it, expect } from "vitest";
import { qualityScore, countBySeverity } from "./quality-score";
import { routeFile } from "./routing";
import { evalGate } from "./gate";

describe("qualityScore", () => {
  it("无问题 = 100", () => expect(qualityScore({})).toBe(100));
  it("1 critical = 75", () => expect(qualityScore({ critical: 1 })).toBe(75));
  it("混合扣分", () => expect(qualityScore({ major: 2, minor: 1, info: 3 })).toBe(100 - 20 - 4 - 3));
  it("超额 clamp 0", () => expect(qualityScore({ critical: 10 })).toBe(0));
  it("countBySeverity 统计", () =>
    expect(countBySeverity(["critical", "minor", "minor"])).toEqual({ critical: 1, major: 0, minor: 2, info: 0 }));
});

describe("routeFile", () => {
  it("测试/配置 → haiku", () =>
    expect(routeFile({ lang: "yaml", lines: 30, securitySensitive: false, isTestOrConfig: true }).modelId).toBe("haiku"));
  it("安全敏感 → opus", () =>
    expect(routeFile({ lang: "ts", lines: 50, securitySensitive: true, isTestOrConfig: false }).modelId).toBe("opus"));
  it("大文件 → sonnet", () =>
    expect(routeFile({ lang: "ts", lines: 500, securitySensitive: false, isTestOrConfig: false }).modelId).toBe("sonnet"));
  it("成本超上限降级 haiku", () => {
    const d = routeFile({ lang: "ts", lines: 5000, securitySensitive: true, isTestOrConfig: false }, { costCap: 0.03 });
    expect(d.modelId).toBe("haiku");
    expect(d.reason).toContain("降级");
  });
});

describe("evalGate", () => {
  const t = { minScore: 70, maxCritical: 0, minCoverage: 60 };
  it("全达标 pass", () => expect(evalGate(t, { score: 85, criticalCount: 0, coverage: 80 }).pass).toBe(true));
  it("分低于阈值 block + reason", () => {
    const r = evalGate(t, { score: 62, criticalCount: 0, coverage: 80 });
    expect(r.pass).toBe(false);
    expect(r.reasons[0]).toContain("质量分");
  });
  it("多项失败聚合 reasons", () => {
    const r = evalGate(t, { score: 50, criticalCount: 2, coverage: 40 });
    expect(r.reasons.length).toBe(3);
  });
});
