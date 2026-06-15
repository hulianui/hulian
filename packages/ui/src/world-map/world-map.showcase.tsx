"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { WorldMap } from "./world-map";
import type { WorldMapDot, WorldMapNode } from "./world-map.types";

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

// 独立节点：全球 PoP 分布，value 驱动大小，逐节点配色
const NODES: WorldMapNode[] = [
  { id: "sh", lat: 31.2, lng: 121.5, label: "上海", value: 92, color: "var(--color-chart-1)" },
  { id: "sg", lat: 1.35, lng: 103.8, label: "新加坡", value: 64, color: "var(--color-chart-2)" },
  { id: "fra", lat: 50.1, lng: 8.7, label: "法兰克福", value: 48, color: "var(--color-chart-3)" },
  { id: "sfo", lat: 37.8, lng: -122.4, label: "旧金山", value: 73, color: "var(--color-chart-4)" },
  { id: "syd", lat: -33.9, lng: 151.2, label: "悉尼", value: 30, color: "var(--color-chart-2)" },
];

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-surface p-4">{children}</div>;
}

export const worldMapShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "单条连线",
      description: "传入起点 / 终点经纬度，弧线自动画入并循环。",
      code: `<WorldMap
  dots={[{ start: { lat: 39.9, lng: 116.4 }, end: { lat: 40.7, lng: -74 } }]}
/>`,
      render: () => (
        <Frame>
          <WorldMap dots={single} />
        </Frame>
      ),
    },
    {
      title: "多点辐射",
      description: "同一起点连向多个城市，构成辐射网络。",
      code: `<WorldMap
  dots={[
    { start: shanghai, end: london },
    { start: shanghai, end: singapore },
    { start: shanghai, end: sydney },
    { start: shanghai, end: sanFrancisco },
  ]}
/>`,
      render: () => (
        <Frame>
          <WorldMap dots={radial} />
        </Frame>
      ),
    },
    {
      title: "逐条配色",
      description: "每条连线用 dot.color 覆盖全局色，同图多色并存。",
      code: `<WorldMap
  dots={[
    { start: shanghai, end: london, color: "var(--color-chart-1)" },
    { start: shanghai, end: singapore, color: "var(--color-chart-2)" },
  ]}
/>`,
      render: () => (
        <Frame>
          <WorldMap dots={multiColor} />
        </Frame>
      ),
    },
    {
      title: "节点分布",
      description: "points 独立于飞线，value 驱动节点大小，showLabels 显示标签。",
      code: `<WorldMap
  points={[
    { id: "sh", lat: 31.2, lng: 121.5, label: "上海", value: 92 },
    { id: "sg", lat: 1.35, lng: 103.8, label: "新加坡", value: 64 },
  ]}
  showLabels
/>`,
      render: () => (
        <Frame>
          <WorldMap points={NODES} showLabels />
        </Frame>
      ),
    },
    {
      title: "飞线标记",
      description: "flyingMarker 让标记沿弧线循环移动并贴合方向（plane / comet / arrow）。",
      code: `<WorldMap dots={radial} flyingMarker="plane" />`,
      render: () => (
        <Frame>
          <WorldMap dots={radial} flyingMarker="plane" />
        </Frame>
      ),
    },
  ],
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
    // 独立节点：value 驱动大小 + 逐节点配色（不依赖飞线）
    { name: "节点分布", render: () => <Frame><WorldMap points={NODES} /></Frame> },
    // 节点 + 标签
    { name: "节点标签", render: () => <Frame><WorldMap points={NODES} showLabels /></Frame> },
    // 节点 + 飞线叠加（指挥中心常见）
    { name: "节点叠飞线", render: () => <Frame><WorldMap points={NODES} dots={radial} /></Frame> },
    // 可点击下钻（传 onPointClick → 节点可聚焦/Enter 触发，svg 放开 aria-hidden）
    { name: "可点击下钻", render: () => <Frame><WorldMap points={NODES} showLabels onPointClick={(n) => alert(`下钻：${n.label}`)} /></Frame> },
    // 飞线标记：沿弧循环移动（✈️ 飞机 / 光点彗尾 / 箭头，自动贴合飞行方向）
    { name: "飞机✈️", render: () => <Frame><WorldMap dots={radial} flyingMarker="plane" /></Frame> },
    { name: "光点彗尾", render: () => <Frame><WorldMap dots={multiColor} flyingMarker="comet" /></Frame> },
    { name: "箭头", render: () => <Frame><WorldMap dots={radial} flyingMarker="arrow" /></Frame> },
    { name: "节点+飞机", render: () => <Frame><WorldMap points={NODES} dots={radial} flyingMarker="plane" /></Frame> },
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
