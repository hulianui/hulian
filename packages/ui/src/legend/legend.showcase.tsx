"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Sparkline } from "../sparkline";
import { Legend } from "./legend";
import type { LegendItem } from "./legend.types";

const base: LegendItem[] = [
  { id: "opened", label: "Opened" },
  { id: "closed", label: "Closed" },
  { id: "merged", label: "Merged" },
];

function Toggleable() {
  const [hidden, setHidden] = useState<Record<string, boolean>>({ merged: true });
  return (
    <Legend
      items={base.map((i) => ({ ...i, hidden: hidden[String(i.id)] }))}
      onItemClick={(item) =>
        setHidden((h) => ({ ...h, [String(item.id)]: !h[String(item.id)] }))
      }
    />
  );
}

export const legendShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "彩点 + 系列名，缺省色按序取 chart-1..6，与 Chart 同一套 token。",
      code: `<Legend items={[{ label: "Opened" }, { label: "Closed" }, { label: "Merged" }]} />`,
      render: () => <Legend items={base} />,
    },
    {
      title: "配自绘图形",
      description: "recharts 的 Legend 出不了图外——自绘 Sparkline / Heatmap / 贡献墙的图例用这个。",
      code: `<div className="flex items-center justify-between">
  <Legend
    marker="line"
    items={[
      { label: "本周", color: "primary", value: "1.2k" },
      { label: "上周", color: "muted", value: "980" },
    ]}
  />
  <Sparkline data={[3, 7, 4, 9, 6, 11, 8]} variant="bar" />
</div>`,
      render: () => (
        <div className="flex w-full max-w-md items-center justify-between gap-6 rounded-[var(--radius)] border border-border bg-surface px-4 py-3">
          <Legend
            marker="line"
            items={[
              { label: "本周", color: "primary", value: "1.2k" },
              { label: "上周", color: "muted", value: "980" },
            ]}
          />
          <Sparkline data={[3, 7, 4, 9, 6, 11, 8]} variant="bar" />
        </div>
      ),
    },
    {
      title: "竖排 · 带数值",
      description: "layout=\"column\" 时 value 自动右对齐，适合饼图旁的系列表。",
      code: `<Legend
  layout="column"
  marker="square"
  items={[
    { label: "自然流量", value: "48%" },
    { label: "付费投放", value: "31%" },
    { label: "私域复购", value: "21%" },
  ]}
/>`,
      render: () => (
        <div className="w-56 rounded-[var(--radius)] border border-border bg-surface p-4">
          <Legend
            layout="column"
            marker="square"
            items={[
              { label: "自然流量", value: "48%" },
              { label: "付费投放", value: "31%" },
              { label: "私域复购", value: "21%" },
            ]}
          />
        </div>
      ),
    },
    {
      title: "可点切换系列",
      description: "传 onItemClick 后条目成按钮（aria-pressed 表达开关）；显隐是受控的，状态由调用方持有。",
      code: `const [hidden, setHidden] = useState<Record<string, boolean>>({ merged: true })

<Legend
  items={series.map((i) => ({ ...i, hidden: hidden[i.id] }))}
  onItemClick={(item) => setHidden((h) => ({ ...h, [item.id]: !h[item.id] }))}
/>`,
      render: () => <Toggleable />,
    },
  ],
  controls: [
    { prop: "marker", type: "select", options: ["dot", "square", "line"], defaultValue: "dot" },
    { prop: "layout", type: "select", options: ["row", "column"], defaultValue: "row" },
    { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
  ],
  states: [
    { name: "默认（横排彩点）", render: () => <Legend items={base} /> },
    {
      name: "三种标记形状",
      render: () => (
        <div className="flex flex-col gap-2">
          <Legend items={base} marker="dot" />
          <Legend items={base} marker="square" />
          <Legend items={base} marker="line" />
        </div>
      ),
    },
    {
      name: "竖排 · 带数值",
      render: () => (
        <div className="w-56">
          <Legend
            layout="column"
            marker="square"
            items={[
              { label: "自然流量", value: "48%" },
              { label: "付费投放", value: "31%" },
              { label: "私域复购", value: "21%" },
            ]}
          />
        </div>
      ),
    },
    { name: "可点切换（第三条已关闭）", render: () => <Toggleable /> },
  ],
  renderWithProps: (p) => (
    <div className={p.layout === "column" ? "w-48" : undefined}>
      <Legend
        items={base.map((i, idx) => ({ ...i, value: idx === 0 ? "42" : undefined }))}
        marker={(p.marker as "dot" | "square" | "line") ?? "dot"}
        layout={(p.layout as "row" | "column") ?? "row"}
        size={(p.size as "sm" | "md") ?? "md"}
      />
    </div>
  ),
  toCode: (p) =>
    `<Legend\n  items={[{ label: "Opened" }, { label: "Closed" }]}${
      p.marker && p.marker !== "dot" ? `\n  marker="${p.marker}"` : ""
    }${p.layout === "column" ? '\n  layout="column"' : ""}${
      p.size === "sm" ? '\n  size="sm"' : ""
    }\n/>`,
};
