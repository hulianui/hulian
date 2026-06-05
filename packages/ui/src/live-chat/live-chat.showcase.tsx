"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { LiveChat } from "./live-chat";
import type { LiveChatItem } from "./live-chat.types";

const NAMES = ["阿白", "momo", "夜航船", "小鹿", "Kris", "豆豆龙", "山雀", "海风", "阿楠", "可乐"];
const MSGS = ["主播好~", "这个怎么买", "求链接", "已关注", "讲讲呗", "太好看了", "蹲", "前排", "下单了", "好划算"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function LiveChatDemo() {
  const [items, setItems] = useState<LiveChatItem[]>([
    { id: "s0", type: "system", text: "欢迎来到直播间，文明发言哦~" },
  ]);
  const n = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      const i = n.current++;
      const name = pick(NAMES, i * 3 + 1);
      let item: LiveChatItem;
      const r = i % 7;
      if (r === 0) item = { id: `e${i}`, type: "enter", user: { name } };
      else if (r === 3) item = { id: `g${i}`, type: "gift", user: { name }, gift: { name: "小心心", icon: "💖", combo: 1 + (i % 9) } };
      else if (r === 5) item = { id: `f${i}`, type: "follow", user: { name } };
      else item = { id: `m${i}`, type: "message", user: { name, level: 1 + (i % 30) }, text: pick(MSGS, i) };
      setItems((p) => [...p, item]);
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-80 w-72 rounded-[var(--radius)] border border-border bg-surface p-3">
      <LiveChat
        items={items}
        pinned={[{ id: "p1", type: "system", text: "今晚 8 点抽奖，关注不迷路" }]}
        className="h-full"
      />
    </div>
  );
}

export const liveChatShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "直播公屏（多类型消息 · 自动滚 · 上滚出现「N 条新消息」恢复钮）", render: () => <LiveChatDemo /> }],
  renderWithProps: () => <LiveChatDemo />,
  toCode: () => `<LiveChat
  items={items}
  pinned={[{ id: "p1", type: "system", text: "公告…" }]}
/>`,
};
