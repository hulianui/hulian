"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PixelTrail } from "./pixel-trail";

/** 展示用深色底容器，让像素拖尾清晰可见（移动鼠标点亮网格）。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/40">
        在此区域内移动鼠标
      </div>
    </div>
  );
}

export const pixelTrailShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "铺满容器，鼠标划过点亮像素网格，拖尾随时间淡灭。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <PixelTrail className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <PixelTrail className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "细密网格 + 短余晖",
      description: "调高 gridSize 让像素更精细，压低 maxAge 让拖尾更短促。",
      code: `<PixelTrail
  gridSize={72}
  maxAge={200}
  color="var(--color-chart-2)"
  className="absolute inset-0"
/>`,
      render: () => (
        <Stage>
          <PixelTrail
            gridSize={72}
            maxAge={200}
            color="var(--color-chart-2)"
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      title: "粗颗粒 + 长余晖",
      description: "降低 gridSize、加大 trailSize 与 maxAge，复古颗粒 + 长拖尾。",
      code: `<PixelTrail
  gridSize={24}
  trailSize={0.16}
  maxAge={600}
  color="var(--color-chart-4)"
  className="absolute inset-0"
/>`,
      render: () => (
        <Stage>
          <PixelTrail
            gridSize={24}
            trailSize={0.16}
            maxAge={600}
            color="var(--color-chart-4)"
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      title: "黏液融合",
      description: "gooey=true 启用 SVG 滤镜，相邻像素融合成有机液态团块。",
      code: `<PixelTrail
  gridSize={48}
  trailSize={0.14}
  gooey
  gooeyStrength={9}
  color="var(--color-chart-1)"
  className="absolute inset-0"
/>`,
      render: () => (
        <Stage>
          <PixelTrail
            gridSize={48}
            trailSize={0.14}
            gooey
            gooeyStrength={9}
            color="var(--color-chart-1)"
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "gridSize", type: "number", defaultValue: 40, label: "网格密度" },
    { prop: "trailSize", type: "number", defaultValue: 0.1, label: "拖尾半径 0–1" },
    { prop: "maxAge", type: "number", defaultValue: 320, label: "余晖时长 ms" },
    { prop: "gooey", type: "boolean", defaultValue: false, label: "黏液融合" },
  ],

  states: [
    {
      name: "default（默认像素拖尾）",
      render: () => (
        <Stage>
          <PixelTrail className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "细密网格 + 短余晖",
      render: () => (
        <Stage>
          <PixelTrail
            gridSize={72}
            maxAge={200}
            color="var(--color-chart-2)"
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      name: "粗颗粒 + 长余晖（复古）",
      render: () => (
        <Stage>
          <PixelTrail
            gridSize={24}
            trailSize={0.16}
            maxAge={600}
            color="var(--color-chart-4)"
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      name: "gooey 黏液融合（液态团块）",
      render: () => (
        <Stage>
          <PixelTrail
            gridSize={48}
            trailSize={0.14}
            gooey
            gooeyStrength={9}
            color="var(--color-chart-1)"
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <PixelTrail
        gridSize={p.gridSize as number}
        trailSize={p.trailSize as number}
        maxAge={p.maxAge as number}
        gooey={p.gooey as boolean}
        className="absolute inset-0"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <PixelTrail`,
      `    gridSize={${p.gridSize}}`,
      `    trailSize={${p.trailSize}}`,
      `    maxAge={${p.maxAge}}`,
      `    gooey={${p.gooey}}`,
      `    className="absolute inset-0"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
