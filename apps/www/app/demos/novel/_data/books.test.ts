import { describe, expect, it } from "vitest";
import { content } from "./books.content";

const CHAPTERS = [
  "ferryC1Body",
  "ferryC2Body",
  "ferryC3Body",
  "wellC1Body",
  "wellC2Body",
  "southC1Body",
  "southC2Body",
] as const;

describe("novel chapters", () => {
  it("keeps the jacket lines inside the chapters they were taken from", () => {
    expect(content["zh-CN"].ferryC1Body).toContain(content["zh-CN"].ferryExcerpt);
    expect(content["zh-CN"].wellC1Body).toContain("杏花今年还开吗");
    expect(content["zh-CN"].southC1Body.startsWith(content["zh-CN"].southExcerpt)).toBe(true);
    expect(content.en.ferryC1Body).toContain(content.en.ferryExcerpt);
    expect(content.en.wellC1Body).toContain(content.en.wellExcerpt);
    expect(content.en.southC1Body.startsWith(content.en.southExcerpt)).toBe(true);
  });

  it("reads as chapters rather than one-screen stubs", () => {
    for (const key of CHAPTERS) {
      const chars = content["zh-CN"][key].replace(/\s+/gu, "").length;
      const words = content.en[key].trim().split(/\s+/).length;
      expect(chars, key).toBeGreaterThan(800);
      expect(words, key).toBeGreaterThan(220);
    }
  });
});
