"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Danmaku } from "./danmaku";
import type { DanmakuItem } from "./danmaku.types";

const POOL = [
  "主播好飒！",
  "这个组件库也太顺手了吧",
  "瑚琏 yyds",
  "弹幕轨道居然不重叠 👍",
  "前排围观",
  "求讲讲实现原理",
  "已三连 ❤️",
  "新人第一次看直播",
  "下单了下单了",
  "这价格真香",
  "灯牌应援 🔆",
  "主播声音真好听",
  "弹幕飘过~",
  "技术含量好高",
  "蹲一个源码",
];
const COLORS = ["white", "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"];

function DanmakuDemo({
  tracks = 4,
  speed = 100,
  density = "normal",
  paused = false,
}: {
  tracks?: number;
  speed?: number;
  density?: "low" | "normal" | "high";
  paused?: boolean;
}) {
  const [items, setItems] = useState<DanmakuItem[]>([]);
  const n = useRef(0);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const i = n.current++;
      const top = i % 11 === 0;
      setItems((p) => [
        ...p.slice(-60),
        {
          id: `d${i}`,
          text: POOL[i % POOL.length],
          mode: top ? "top" : "scroll",
          color: COLORS[i % COLORS.length],
          bold: i % 5 === 0,
        },
      ]);
    }, 650);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900">
      <div className="absolute inset-0 grid place-items-center text-sm text-white/40">直播画面</div>
      <Danmaku items={items} tracks={tracks} speed={speed} density={density} paused={paused} />
    </div>
  );
}

export const danmakuShowcase: ShowcaseSpec = {
  controls: [
    { prop: "tracks", type: "number", defaultValue: 4, label: "轨道数" },
    { prop: "speed", type: "number", defaultValue: 100, label: "速度 px/s" },
    { prop: "density", type: "select", options: ["low", "normal", "high"], defaultValue: "normal", label: "密度" },
    { prop: "paused", type: "boolean", defaultValue: false, label: "暂停" },
  ],
  states: [
    { name: "弹幕飞过（轨道防重叠 + 顶部停留弹幕）", render: () => <DanmakuDemo /> },
    { name: "高密度 · 快速", render: () => <DanmakuDemo density="high" speed={160} tracks={6} /> },
  ],
  renderWithProps: (p) => (
    <DanmakuDemo
      tracks={p.tracks as number}
      speed={p.speed as number}
      density={p.density as "low" | "normal" | "high"}
      paused={p.paused as boolean}
    />
  ),
  toCode: () => `<div className="relative aspect-video">
  <video ... />
  <Danmaku items={items} tracks={4} speed={100} density="normal" />
</div>`,
};
