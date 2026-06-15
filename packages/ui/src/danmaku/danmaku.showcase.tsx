"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

// examples 用静态弹幕（受控只增不改：新增项入场后由 CSS 关键帧驱动飘过）。
const SCROLL_ITEMS: DanmakuItem[] = [
  { id: "x1", text: "弹幕飘过~" },
  { id: "x2", text: "主播好飒！", color: "var(--color-chart-1)", bold: true },
  { id: "x3", text: "这个组件库也太顺手了吧", color: "var(--color-chart-2)" },
  { id: "x4", text: "已三连 ❤️", color: "var(--color-chart-3)" },
];
const MIXED_ITEMS: DanmakuItem[] = [
  { id: "y0", text: "今晚 8 点抽奖，关注不迷路", mode: "top", bold: true },
  { id: "y1", text: "前排围观" },
  { id: "y2", text: "瑚琏 yyds", color: "var(--color-chart-1)", bold: true },
  { id: "y3", text: "下单了下单了", color: "var(--color-chart-4)" },
];

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900">
      <div className="absolute inset-0 grid place-items-center text-sm text-white/40">直播画面</div>
      {children}
    </div>
  );
}

export const danmakuShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "叠在视频上的弹幕层（absolute inset-0）。items 受控、只增不改，新增项自动入场并按轨道防重叠飘过。",
      code: `<div className="relative aspect-video">
  <video ... />
  <Danmaku
    items={[
      { id: "x1", text: "弹幕飘过~" },
      { id: "x2", text: "主播好飒！", color: "var(--color-chart-1)", bold: true },
    ]}
    tracks={4}
    speed={100}
  />
</div>`,
      render: () => (
        <Stage>
          <Danmaku items={SCROLL_ITEMS} tracks={4} speed={100} />
        </Stage>
      ),
    },
    {
      title: "顶部停留弹幕",
      description: "mode='top' 的弹幕居中停留在顶部一段时间（非滚动），适合公告/置顶。",
      code: `<Danmaku
  items={[
    { id: "y0", text: "今晚 8 点抽奖，关注不迷路", mode: "top", bold: true },
    { id: "y1", text: "前排围观" },
  ]}
  tracks={4}
/>`,
      render: () => (
        <Stage>
          <Danmaku items={MIXED_ITEMS} tracks={4} speed={100} />
        </Stage>
      ),
    },
    {
      title: "高密度 · 快速",
      description: "density='high' 时无空闲轨道也强挤（不丢弹幕）；speed 提速、tracks 加轨道。",
      code: `<Danmaku items={items} density="high" speed={160} tracks={6} />`,
      render: () => (
        <Stage>
          <Danmaku items={SCROLL_ITEMS} density="high" speed={160} tracks={6} />
        </Stage>
      ),
    },
  ],
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
