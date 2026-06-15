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

function GiftFeedDemo({ max = 3, duration = 4000 }: { max?: number; duration?: number }) {
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
      <GiftFeed events={events} max={max} duration={duration} className="w-full" />
    </div>
  );
}

export const giftFeedShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "受控传入礼物事件流（events 数组追加），组件自动合并同 id 连击并播放进场动画。",
      code: `const [events, setEvents] = useState<GiftEvent[]>([]);
// 收到礼物时追加事件；同一 id 再次传入 → combo 递增
// setEvents((p) => [...p, { id: "g1", user: { name: "土豪哥" }, gift: { name: "火箭", icon: "🚀" }, combo }]);

<GiftFeed events={events} />`,
      render: () => <GiftFeedDemo />,
    },
    {
      title: "横幅上限",
      description: "max 控制同时在屏的横幅数（超出挤掉最旧），这里只保留 1 条。",
      code: `<GiftFeed events={events} max={1} />`,
      render: () => <GiftFeedDemo max={1} />,
    },
    {
      title: "停留时长",
      description: "duration 控制单条无新连击后的停留毫秒，调短后横幅消散更快。",
      code: `<GiftFeed events={events} duration={2000} />`,
      render: () => <GiftFeedDemo duration={2000} />,
    },
  ],
  controls: [],
  states: [{ name: "礼物连击（同礼物 combo ×N 滚动 · 自动消散 · 上限 3 条）", render: () => <GiftFeedDemo /> }],
  renderWithProps: () => <GiftFeedDemo />,
  toCode: () => `<GiftFeed events={events} max={3} duration={4000} />`,
};
