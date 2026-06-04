import { describe, it, expect } from "vitest";
import { reducer, createInitialState } from "./use-live-conversations";
import { conversations } from "../../_data/conversations";

const initial = createInitialState(conversations);

describe("客服会话 reducer", () => {
  it("SELECT 把该会话未读清零并设 activeId", () => {
    const s = reducer(initial, { type: "SELECT", id: "CV02" });
    expect(s.activeId).toBe("CV02");
    expect(s.conversations.find((c) => c.id === "CV02")!.unread).toBe(0);
  });

  it("SEND 追加坐席消息(author=agent,status=sending)并清未读", () => {
    const s = reducer(initial, { type: "SEND", convId: "CV01", msgId: "a9", text: "您好", at: "15:00" });
    const c = s.conversations.find((c) => c.id === "CV01")!;
    const last = c.messages.at(-1)!;
    expect(last).toMatchObject({ id: "a9", author: "agent", status: "sending", text: "您好" });
    expect(c.unread).toBe(0);
    expect(c.lastAt).toBe("15:00");
  });

  it("RECEIPT 更新指定坐席消息 status 为 read", () => {
    const sent = reducer(initial, { type: "SEND", convId: "CV01", msgId: "a9", text: "x", at: "15:00" });
    const read = reducer(sent, { type: "RECEIPT", convId: "CV01", msgId: "a9", status: "read" });
    expect(read.conversations.find((c) => c.id === "CV01")!.messages.find((m) => m.id === "a9")!.status).toBe(
      "read",
    );
  });

  it("DELIVER_QUEUED 从 queued 取一条进 messages(author=customer)，非 active 时未读+1", () => {
    const before = initial.conversations.find((c) => c.id === "CV02")!;
    const beforeLen = before.messages.length;
    const beforeUnread = before.unread;
    const s = reducer(initial, { type: "DELIVER_QUEUED", convId: "CV02" });
    const c = s.conversations.find((c) => c.id === "CV02")!;
    expect(c.messages.length).toBe(beforeLen + 1);
    expect(c.messages.at(-1)!.author).toBe("customer");
    expect(c.queued.length).toBe(before.queued.length - 1);
    expect(c.unread).toBe(beforeUnread + 1);
  });

  it("DELIVER_QUEUED 对 active 会话不加未读", () => {
    const selected = reducer(initial, { type: "SELECT", id: "CV02" });
    const s = reducer(selected, { type: "DELIVER_QUEUED", convId: "CV02" });
    expect(s.conversations.find((c) => c.id === "CV02")!.unread).toBe(0);
  });

  it("DELIVER_QUEUED 队列空时不变", () => {
    const s = reducer(initial, { type: "DELIVER_QUEUED", convId: "CV04" }); // CV04 queued=[]
    expect(s.conversations.find((c) => c.id === "CV04")!.messages.length).toBe(
      initial.conversations.find((c) => c.id === "CV04")!.messages.length,
    );
  });

  it("INCOMING 投递队列消息并把会话移到列表首位", () => {
    const s = reducer(initial, { type: "INCOMING", convId: "CV05" });
    expect(s.conversations[0].id).toBe("CV05");
    expect(s.conversations[0].messages.at(-1)!.author).toBe("customer");
  });

  it("SET_TYPING 切换指定会话的输入态", () => {
    const on = reducer(initial, { type: "SET_TYPING", convId: "CV01", value: true });
    expect(on.typing["CV01"]).toBe(true);
    const off = reducer(on, { type: "SET_TYPING", convId: "CV01", value: false });
    expect(off.typing["CV01"]).toBe(false);
  });

  it("reducer 不可变更新原 state", () => {
    const snapshot = JSON.stringify(initial);
    reducer(initial, { type: "SEND", convId: "CV01", msgId: "a9", text: "x", at: "1" });
    expect(JSON.stringify(initial)).toBe(snapshot);
  });
});
