import { describe, it, expect } from "vitest";
import { createInitialState, reducer, replyFor } from "./live-sim";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

const isEnglish = DOCS_LOCALE === "en";

describe("live-sim reducer", () => {
  it("初始态字段齐全", () => {
    const s = createInitialState();
    expect(s.viewers).toBeGreaterThan(0);
    expect(s.danmaku).toEqual([]);
    expect(s.chat.length).toBe(1); // 系统欢迎
  });

  it("TICK_DANMAKU 确定性：同 seed 同结果", () => {
    const base = createInitialState();
    const a = reducer(base, { type: "TICK_DANMAKU", seed: 42 });
    const b = reducer(base, { type: "TICK_DANMAKU", seed: 42 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("TICK_GIFT 延续连击 → combo 递增", () => {
    let s = createInitialState();
    s = reducer(s, { type: "TICK_GIFT", seed: 1 });
    const first = s.combo!.count;
    // 找一个会延续连击的 seed（reducer 内部 60% 概率延续）
    let continued = false;
    for (let seed = 2; seed < 60 && !continued; seed++) {
      const next = reducer(s, { type: "TICK_GIFT", seed });
      if (next.combo!.id === s.combo!.id) {
        expect(next.combo!.count).toBe(first + 1);
        continued = true;
      }
      s = next.combo!.id === s.combo!.id ? next : s;
    }
    expect(continued).toBe(true);
  });

  it("LIKE 累加点赞", () => {
    const s = reducer(createInitialState(), { type: "LIKE", n: 5 });
    expect(s.likes).toBe(createInitialState().likes + 5);
  });

  it("SEND_DANMAKU 同时进弹幕与公屏", () => {
    const s = reducer(createInitialState(), { type: "SEND_DANMAKU", id: "u1", text: "你好" });
    expect(s.danmaku.at(-1)?.text).toBe("你好");
    expect(s.chat.at(-1)?.text).toBe("你好");
  });

  it("SEND_GIFT 追加礼物事件与公屏", () => {
    const s = reducer(createInitialState(), {
      type: "SEND_GIFT",
      id: "g1",
      gift: { name: "火箭", icon: "🚀" },
      combo: 2,
    });
    expect(s.gifts.at(-1)).toMatchObject({ id: "g1", combo: 2 });
    expect(s.chat.at(-1)?.type).toBe("gift");
  });

  it("ASK_AI 生成 reply 建议并命中关键词", () => {
    const s = reducer(createInitialState(), { type: "ASK_AI", id: "q1", question: "有 XL 码吗" });
    const last = s.suggestions.at(-1)!;
    expect(last.kind).toBe("reply");
    expect(last.text).toContain(isEnglish ? "sizes" : "码");
  });

  it("ADOPT_SUGGESTION 把答复推进公屏并标记 adopted", () => {
    let s = reducer(createInitialState(), { type: "ASK_AI", id: "q1", question: "什么时候发货" });
    const before = s.chat.length;
    s = reducer(s, { type: "ADOPT_SUGGESTION", id: "q1" });
    expect(s.suggestions.find((x) => x.id === "q1")?.adopted).toBe(true);
    expect(s.chat.length).toBe(before + 1);
    expect(s.chat.at(-1)?.user?.name).toBe(isEnglish ? "Host" : "主播");
  });

  it("replyFor 关键词命中与默认兜底", () => {
    expect(replyFor(isEnglish ? "How long does the battery last?" : "续航多久")).toContain(isEnglish ? "Product 3" : "耳机");
    expect(replyFor(isEnglish ? "Does this come in XL?" : "有大码吗")).toContain(isEnglish ? "sizes" : "码");
    expect(replyFor(isEnglish ? "When will it ship?" : "什么时候发货")).toContain(isEnglish ? "48 hours" : "48 小时");
    expect(replyFor("zzz 随便问问")).toBeTruthy(); // 未命中走默认兜底
  });
});
