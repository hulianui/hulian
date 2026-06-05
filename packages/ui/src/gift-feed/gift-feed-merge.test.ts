import { describe, it, expect } from "vitest";
import { applyGiftEvent } from "./gift-feed-merge";
import type { GiftBanner } from "./gift-feed.types";

const ev = (id: string, combo?: number) => ({
  id,
  user: { name: "u" },
  gift: { name: "火箭" },
  combo,
});

describe("applyGiftEvent", () => {
  it("新 id 追加横幅", () => {
    const out = applyGiftEvent([], ev("a", 1), 3);
    expect(out).toHaveLength(1);
    expect(out[0].combo).toBe(1);
    expect(out[0].bounce).toBe(0);
  });

  it("同 id 再次到达 → combo 取较大，bounce+1", () => {
    let s: GiftBanner[] = applyGiftEvent([], ev("a", 1), 3);
    s = applyGiftEvent(s, ev("a", 5), 3);
    expect(s).toHaveLength(1);
    expect(s[0].combo).toBe(5);
    expect(s[0].bounce).toBe(1);
  });

  it("不传 combo 时按出现次数自增", () => {
    let s = applyGiftEvent([], ev("a"), 3);
    s = applyGiftEvent(s, ev("a"), 3);
    expect(s[0].combo).toBe(2);
  });

  it("combo 不会回退（取 max）", () => {
    let s = applyGiftEvent([], ev("a", 9), 3);
    s = applyGiftEvent(s, ev("a", 3), 3);
    expect(s[0].combo).toBe(9);
  });

  it("超过 max 挤掉最旧", () => {
    let s = applyGiftEvent([], ev("a"), 2);
    s = applyGiftEvent(s, ev("b"), 2);
    s = applyGiftEvent(s, ev("c"), 2);
    expect(s.map((b) => b.id)).toEqual(["b", "c"]);
  });

  it("不可变：不改入参", () => {
    const input: GiftBanner[] = [];
    applyGiftEvent(input, ev("a"), 3);
    expect(input).toHaveLength(0);
  });
});
