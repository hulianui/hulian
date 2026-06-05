"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { GiftFeed } from "./gift-feed";
import type { GiftEvent } from "./gift-feed.types";

const GIFTS = [
  { name: "小心心", icon: "💖", color: "var(--color-chart-1)" },
  { name: "火箭", icon: "🚀", color: "var(--color-chart-2)" },
  { name: "城堡", icon: "🏰", color: "var(--color-chart-4)" },
  { name: "跑车", icon: "🏎️", color: "var(--color-chart-3)" },
];
const USERS = ["土豪哥", "momo", "夜航船", "阿白"];

function GiftFeedDemo() {
  const [events, setEvents] = useState<GiftEvent[]>([]);
  const combo = useRef<Record<string, number>>({});
  const n = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      const i = n.current++;
      // 模拟连击：同一土豪对同一礼物快速连点
      const groupId = `g${Math.floor(i / 4)}`;
      combo.current[groupId] = (combo.current[groupId] ?? 0) + 1;
      const g = GIFTS[Math.floor(i / 4) % GIFTS.length];
      setEvents((p) => [
        ...p.slice(-30),
        { id: groupId, user: { name: USERS[Math.floor(i / 4) % USERS.length] }, gift: g, combo: combo.current[groupId] },
      ]);
    }, 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid h-72 w-80 place-items-end rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900 p-4">
      <GiftFeed events={events} className="w-full" />
    </div>
  );
}

export const giftFeedShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "礼物连击（同礼物 combo ×N 滚动 · 自动消散 · 上限 3 条）", render: () => <GiftFeedDemo /> }],
  renderWithProps: () => <GiftFeedDemo />,
  toCode: () => `<GiftFeed events={events} max={3} duration={4000} />`,
};
