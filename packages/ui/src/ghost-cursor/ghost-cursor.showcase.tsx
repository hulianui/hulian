"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GhostCursor } from "./ghost-cursor";

/** 深色舞台：GhostCursor 是 absolute inset-0 覆盖层，须 relative 定位父 + 深底显烟雾。 */
function Stage({
  children,
  hint = "在此区域内移动指针",
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 285)" }}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-white/40">{hint}</span>
      </div>
    </div>
  );
}

export const ghostCursorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "GhostCursor 是 absolute inset-0 的装饰覆盖层，放进一个 relative + overflow-hidden 的深色容器即可。",
      code: `<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 285)" }}
>
  <GhostCursor />
</div>`,
      render: () => (
        <Stage>
          <GhostCursor />
        </Stage>
      ),
    },
    {
      title: "自定义颜色与长拖尾",
      description: "color 改主色调，trailLength 拉长尾迹，inertia 越大停手后越飘。",
      code: `<GhostCursor
  color="oklch(0.72 0.2 50)"
  trailLength={48}
  inertia={0.78}
/>`,
      render: () => (
        <Stage hint="拖尾更长更飘">
          <GhostCursor
            color="oklch(0.72 0.2 50)"
            trailLength={48}
            inertia={0.78}
          />
        </Stage>
      ),
    },
    {
      title: "聚拢小烟团",
      description: "scale 越大烟团越聚拢，brightness 提亮，关闭颗粒更干净。",
      code: `<GhostCursor
  scale={1.6}
  grainIntensity={0}
  brightness={1.5}
  trailLength={20}
/>`,
      render: () => (
        <Stage hint="烟团更聚拢">
          <GhostCursor
            scale={1.6}
            grainIntensity={0}
            brightness={1.5}
            trailLength={20}
          />
        </Stage>
      ),
    },
    {
      title: "弥散柔光",
      description: "scale 越小烟团越弥散，配青绿主色得柔和氛围光。",
      code: `<GhostCursor
  color="oklch(0.78 0.16 175)"
  scale={0.7}
  inertia={0.6}
  brightness={1.3}
/>`,
      render: () => (
        <Stage hint="弥散柔光">
          <GhostCursor
            color="oklch(0.78 0.16 175)"
            scale={0.7}
            inertia={0.6}
            brightness={1.3}
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "trailLength", type: "number", defaultValue: 32, label: "拖尾长度" },
    { prop: "inertia", type: "number", defaultValue: 0.5, label: "惯性系数 0-1" },
    { prop: "brightness", type: "number", defaultValue: 1.2, label: "亮度增益" },
    { prop: "grainIntensity", type: "number", defaultValue: 0.05, label: "颗粒强度" },
    { prop: "scale", type: "number", defaultValue: 1, label: "烟团尺度" },
  ],

  states: [
    {
      name: "default（默认蓝紫烟雾）",
      render: () => (
        <Stage>
          <GhostCursor />
        </Stage>
      ),
    },
    {
      name: "暖橙长拖尾（高惯性）",
      render: () => (
        <Stage hint="拖尾更长更飘">
          <GhostCursor color="oklch(0.72 0.2 50)" trailLength={48} inertia={0.78} />
        </Stage>
      ),
    },
    {
      name: "聚拢小烟团（低尺度·无颗粒）",
      render: () => (
        <Stage hint="烟团更聚拢">
          <GhostCursor scale={1.6} grainIntensity={0} brightness={1.5} trailLength={20} />
        </Stage>
      ),
    },
    {
      name: "青绿弥散（大烟团）",
      render: () => (
        <Stage hint="弥散柔光">
          <GhostCursor color="oklch(0.78 0.16 175)" scale={0.7} inertia={0.6} brightness={1.3} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <GhostCursor
        trailLength={p.trailLength as number}
        inertia={p.inertia as number}
        brightness={p.brightness as number}
        grainIntensity={p.grainIntensity as number}
        scale={p.scale as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 285)" }}>`,
      `  <GhostCursor`,
      `    trailLength={${p.trailLength}}`,
      `    inertia={${p.inertia}}`,
      `    brightness={${p.brightness}}`,
      `    grainIntensity={${p.grainIntensity}}`,
      `    scale={${p.scale}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
