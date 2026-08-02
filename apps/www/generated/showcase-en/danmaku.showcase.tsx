"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Danmaku } from "../../../../packages/ui/src/danmaku/danmaku";
import type { DanmakuItem } from "../../../../packages/ui/src/danmaku/danmaku.types";
const POOL = [
    "The anchor is so cool!",
    "This component library is so convenient.",
    "Hulian yyds",
    "The barrage tracks don't overlap \uD83D\uDC4D",
    "Watching from the front row",
    "Please tell me the implementation principle",
    "Three times in a row \u2764\uFE0F",
    "Newbie watching live broadcast for the first time",
    "Placed an order Placed an order",
    "The price is really good",
    "Light sign support \uD83D\uDD06",
    "The anchor's voice is really nice",
    "Barrage drifting by~",
    "Very high technical content",
    "Squat a source code",
];
const COLORS = ["white", "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"];
function DanmakuDemo({ tracks = 4, speed = 100, density = "normal", paused = false, }: {
    tracks?: number;
    speed?: number;
    density?: "low" | "normal" | "high";
    paused?: boolean;
}) {
    const [items, setItems] = useState<DanmakuItem[]>([]);
    const n = useRef(0);
    useEffect(() => {
        if (paused)
            return;
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
    return (<div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900">
      <div className="absolute inset-0 grid place-items-center text-sm text-white/40">Live screen</div>
      <Danmaku items={items} tracks={tracks} speed={speed} density={density} paused={paused}/>
    </div>);
}
const SCROLL_ITEMS: DanmakuItem[] = [
    { id: "x1", text: "Barrage drifting by~" },
    { id: "x2", text: "The anchor is so cool!", color: "var(--color-chart-1)", bold: true },
    { id: "x3", text: "This component library is so convenient.", color: "var(--color-chart-2)" },
    { id: "x4", text: "Three times in a row \u2764\uFE0F", color: "var(--color-chart-3)" },
];
const MIXED_ITEMS: DanmakuItem[] = [
    { id: "y0", text: "The draw will be held at 8pm tonight, pay attention and don't get lost", mode: "top", bold: true },
    { id: "y1", text: "Watching from the front row" },
    { id: "y2", text: "Hulian yyds", color: "var(--color-chart-1)", bold: true },
    { id: "y3", text: "Placed an order Placed an order", color: "var(--color-chart-4)" },
];
function Stage({ children }: {
    children: ReactNode;
}) {
    return (<div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900">
      <div className="absolute inset-0 grid place-items-center text-sm text-white/40">Live screen</div>
      {children}
    </div>);
}
export const danmakuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The barrage layer superimposed on the video (absolute inset-0). items is controlled and can only be added but not modified. New items are automatically entered and tracked to prevent overlapping and drifting.",
            code: `<div className="relative aspect-video">
  <video ... />
  <Danmaku
    items={[
      { id: "x1", text: "Barrage passing~" },
      { id: "x2", text: "The anchor is so cool!", color: "var(--color-chart-1)", bold: true },
    ]}
    tracks={4}
    speed={100}
  />
</div>`,
            render: () => (<Stage>
          <Danmaku items={SCROLL_ITEMS} tracks={4} speed={100}/>
        </Stage>),
        },
        {
            title: "Top stay barrage",
            description: "The barrage of mode='top' stays at the top for a period of time (non-scrolling), suitable for announcements/top posts.",
            code: `<Danmaku
  items={[
    { id: "y0", text: "The draw will be held at 8 o'clock tonight, pay attention to not get lost", mode: "top", bold: true },
    { id: "y1", text: "Front row watching" },
  ]}
  tracks={4}
/>`,
            render: () => (<Stage>
          <Danmaku items={MIXED_ITEMS} tracks={4} speed={100}/>
        </Stage>),
        },
        {
            title: "High Density \u00B7 Fast",
            description: "density='high' is forced to squeeze even if there is no free track (no barrages are lost); speed speeds up, tracks adds tracks.",
            code: `<Danmaku items={items} density="high" speed={160} tracks={6} />`,
            render: () => (<Stage>
          <Danmaku items={SCROLL_ITEMS} density="high" speed={160} tracks={6}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "tracks", type: "number", defaultValue: 4, label: "Number of tracks" },
        { prop: "speed", type: "number", defaultValue: 100, label: "Speed px/s" },
        { prop: "density", type: "select", options: ["low", "normal", "high"], defaultValue: "normal", label: "Density" },
        { prop: "paused", type: "boolean", defaultValue: false, label: "Pause" },
    ],
    states: [
        { name: "Barrage flying over (anti-overlap track + top stay barrage)", render: () => <DanmakuDemo /> },
        { name: "High Density \u00B7 Fast", render: () => <DanmakuDemo density="high" speed={160} tracks={6}/> },
    ],
    renderWithProps: (p) => (<DanmakuDemo tracks={p.tracks as number} speed={p.speed as number} density={p.density as "low" | "normal" | "high"} paused={p.paused as boolean}/>),
    toCode: () => `<div className="relative aspect-video">
  <video ... />
  <Danmaku items={items} tracks={4} speed={100} density="normal" />
</div>`,
};
