"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { WorldMap } from "./world-map";
import type { WorldMapDot } from "./world-map.types";

const BEIJING = { lat: 39.9, lng: 116.4, label: "北京" };
const NEW_YORK = { lat: 40.7, lng: -74, label: "纽约" };

// 单条：北京 → 纽约
const single: WorldMapDot[] = [{ start: BEIJING, end: NEW_YORK }];

// 多点辐射：上海 → 4 城
const SHANGHAI = { lat: 31.2, lng: 121.5, label: "上海" };
const radial: WorldMapDot[] = [
  { start: SHANGHAI, end: { lat: 51.5, lng: -0.1, label: "伦敦" } },
  { start: SHANGHAI, end: { lat: 1.35, lng: 103.8, label: "新加坡" } },
  { start: SHANGHAI, end: { lat: -33.9, lng: 151.2, label: "悉尼" } },
  { start: SHANGHAI, end: { lat: 37.8, lng: -122.4, label: "旧金山" } },
];

// 混色：同一组件内逐条连线用不同 chart token（dot.color 覆盖全局 lineColor）
const multiColor: WorldMapDot[] = [
  { start: SHANGHAI, end: { lat: 51.5, lng: -0.1, label: "伦敦" }, color: "var(--color-chart-1)" },
  { start: SHANGHAI, end: { lat: 1.35, lng: 103.8, label: "新加坡" }, color: "var(--color-chart-2)" },
  { start: SHANGHAI, end: { lat: -33.9, lng: 151.2, label: "悉尼" }, color: "var(--color-chart-3)" },
  { start: SHANGHAI, end: { lat: 37.8, lng: -122.4, label: "旧金山" }, color: "var(--color-chart-4)" },
];

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-surface p-4">{children}</div>;
}

export const worldMapShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "单条连线", render: () => <Frame><WorldMap dots={single} /></Frame> },
    { name: "多点辐射", render: () => <Frame><WorldMap dots={radial} /></Frame> },
    // 配色由 lineColor / dotColor 控制(默认 chart-1 / border)，全走 token 吃明暗主题
    { name: "翠绿", render: () => <Frame><WorldMap dots={radial} lineColor="var(--color-chart-2)" /></Frame> },
    { name: "琥珀", render: () => <Frame><WorldMap dots={radial} lineColor="var(--color-chart-3)" /></Frame> },
    { name: "紫罗兰", render: () => <Frame><WorldMap dots={radial} lineColor="var(--color-chart-4)" /></Frame> },
    { name: "主色强调", render: () => <Frame><WorldMap dots={radial} lineColor="var(--color-primary)" dotColor="var(--color-muted)" /></Frame> },
    // 逐条 color 覆盖：同一组件内多色并存
    { name: "混色连线", render: () => <Frame><WorldMap dots={multiColor} /></Frame> },
    { name: "纯底图", render: () => <Frame><WorldMap /></Frame> },
  ],
  renderWithProps: () => (
    <Frame>
      <WorldMap dots={radial} />
    </Frame>
  ),
  toCode: () =>
    `<WorldMap\n  dots={[{ start: { lat: 39.9, lng: 116.4 }, end: { lat: 40.7, lng: -74 } }]}\n/>`,
};
