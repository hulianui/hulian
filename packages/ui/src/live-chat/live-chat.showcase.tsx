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

// examples 用静态消息流（受控追加；render 无状态，直接给定终态列表）。
const SAMPLE: LiveChatItem[] = [
  { id: "s0", type: "system", text: "欢迎来到直播间，文明发言哦~" },
  { id: "e1", type: "enter", user: { name: "夜航船" } },
  { id: "m1", type: "message", user: { name: "阿白", level: 12 }, text: "主播好~" },
  { id: "f1", type: "follow", user: { name: "momo" } },
  { id: "g1", type: "gift", user: { name: "小鹿" }, gift: { name: "小心心", icon: "💖", combo: 6 } },
  { id: "m2", type: "message", user: { name: "Kris", level: 3 }, text: "求链接" },
  { id: "m3", type: "message", user: { name: "豆豆龙", level: 28 }, text: "下单了" },
];

export const liveChatShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "items 受控追加，组件自动滚到底；支持 message / enter / gift / follow / system 多种消息类型。",
      code: `<LiveChat
  items={[
    { id: "s0", type: "system", text: "欢迎来到直播间~" },
    { id: "e1", type: "enter", user: { name: "夜航船" } },
    { id: "m1", type: "message", user: { name: "阿白", level: 12 }, text: "主播好~" },
    { id: "g1", type: "gift", user: { name: "小鹿" }, gift: { name: "小心心", icon: "💖", combo: 6 } },
  ]}
/>`,
      render: () => (
        <div className="h-80 w-72 rounded-[var(--radius)] border border-border bg-surface p-3">
          <LiveChat items={SAMPLE} className="h-full" />
        </div>
      ),
    },
    {
      title: "置顶公告",
      description: "pinned 渲染在顶部置顶区（公告/规则），不参与滚动流。",
      code: `<LiveChat
  items={items}
  pinned={[{ id: "p1", type: "system", text: "今晚 8 点抽奖，关注不迷路" }]}
/>`,
      render: () => (
        <div className="h-80 w-72 rounded-[var(--radius)] border border-border bg-surface p-3">
          <LiveChat
            items={SAMPLE}
            pinned={[{ id: "p1", type: "system", text: "今晚 8 点抽奖，关注不迷路" }]}
            className="h-full"
          />
        </div>
      ),
    },
    {
      title: "视频叠加态",
      description: "overlay 用于叠在深色视频上的 C 端公屏：藏滚动条、顶部渐隐、文字转白并带阴影。",
      code: `<div className="relative aspect-[9/16] bg-black">
  <video ... />
  <div className="absolute inset-x-2 bottom-2 h-48">
    <LiveChat items={items} overlay className="h-full" />
  </div>
</div>`,
      render: () => (
        <div className="h-80 w-44 overflow-hidden rounded-[var(--radius)] bg-gradient-to-b from-slate-600 to-slate-900 p-3">
          <LiveChat items={SAMPLE} overlay className="h-full" />
        </div>
      ),
    },
  ],
  controls: [],
  states: [{ name: "直播公屏（多类型消息 · 自动滚 · 上滚出现「N 条新消息」恢复钮）", render: () => <LiveChatDemo /> }],
  renderWithProps: () => <LiveChatDemo />,
  toCode: () => `<LiveChat
  items={items}
  pinned={[{ id: "p1", type: "system", text: "公告…" }]}
/>`,
};
