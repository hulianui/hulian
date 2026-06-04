import { describe, it, expect } from "vitest";
import { selectScript, scriptToEvents, type ChatEvent } from "./chat-script";

describe("selectScript", () => {
  it("命中天气脚本（含工具调用）", () => {
    const s = selectScript("北京今天天气怎么样");
    expect(s.id).toBe("weather");
    expect(s.tool).toBeDefined();
  });
  it("命中代码脚本（含 markdown 代码块）", () => {
    const s = selectScript("帮我写一个快速排序");
    expect(s.id).toBe("code");
    expect(s.answer).toContain("```");
  });
  it("命中解释脚本（含引用）", () => {
    const s = selectScript("解释一下什么是闭包");
    expect(s.id).toBe("explain");
    expect(s.citations.length).toBeGreaterThan(0);
  });
  it("无关键词走兜底脚本", () => {
    const s = selectScript("随便聊聊");
    expect(s.id).toBe("fallback");
  });
});

describe("scriptToEvents", () => {
  it("事件序列以 thinking 开头、done 结尾，含 text_delta", () => {
    const events = scriptToEvents(selectScript("解释一下闭包"));
    expect(events[0].type).toBe("thinking_delta");
    expect(events.at(-1)!.type).toBe("done");
    expect(events.some((e: ChatEvent) => e.type === "text_delta")).toBe(true);
  });
  it("天气脚本含 tool + tool_result 事件", () => {
    const events = scriptToEvents(selectScript("上海天气"));
    expect(events.some((e) => e.type === "tool")).toBe(true);
    expect(events.some((e) => e.type === "tool_result")).toBe(true);
  });
  it("text_delta 拼接还原完整答案", () => {
    const script = selectScript("写快速排序");
    const events = scriptToEvents(script);
    const text = events
      .filter((e) => e.type === "text_delta")
      .map((e) => (e as Extract<ChatEvent, { type: "text_delta" }>).text)
      .join("");
    expect(text).toBe(script.answer);
  });
});
