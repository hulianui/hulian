"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SideRays } from "./side-rays";
import type { SideRaysOrigin } from "./side-rays.types";

/** 展示用深色底容器，让侧光束效果清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const sideRaysShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "默认从右上角发散、双束吃 chart-1/chart-2 token；放在 relative 容器里自带 absolute inset-0 z-0。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <SideRays opacity={0.85} />
</div>`,
      render: () => (
        <Stage>
          <SideRays opacity={0.85} />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            SideRays
          </div>
        </Stage>
      ),
    },
    {
      title: "起点角落 · 自定义色",
      description:
        "origin 四角任选，rayColor1/rayColor2 指定双束颜色叠加成混色。",
      code: `<SideRays
  origin="bottom-left"
  rayColor1="oklch(0.78 0.18 70)"
  rayColor2="oklch(0.7 0.22 30)"
  intensity={2.4}
  opacity={0.8}
/>`,
      render: () => (
        <Stage>
          <SideRays
            origin="bottom-left"
            rayColor1="oklch(0.78 0.18 70)"
            rayColor2="oklch(0.7 0.22 30)"
            intensity={2.4}
            opacity={0.8}
          />
        </Stage>
      ),
    },
    {
      title: "聚拢一道 · 高强度",
      description:
        "spread 调小让两束聚拢成一道光柱，intensity 提亮、falloff 控制随距离衰减。",
      code: `<SideRays spread={1} intensity={3} falloff={1.9} opacity={0.9} />`,
      render: () => (
        <Stage>
          <SideRays spread={1} intensity={3} falloff={1.9} opacity={0.9} />
        </Stage>
      ),
    },
    {
      title: "去色 · 微倾",
      description: "saturation=0 灰阶光束（极简风），tilt 围绕光源点旋转整个扇面。",
      code: `<SideRays saturation={0} tilt={18} opacity={0.7} />`,
      render: () => (
        <Stage>
          <SideRays saturation={0} tilt={18} opacity={0.7} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "speed", type: "number", defaultValue: 2.5, label: "速度" },
    { prop: "intensity", type: "number", defaultValue: 2, label: "强度" },
    { prop: "spread", type: "number", defaultValue: 2, label: "张角" },
    {
      prop: "origin",
      type: "select",
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
      defaultValue: "top-right",
      label: "起点角落",
    },
    { prop: "opacity", type: "number", defaultValue: 0.85, label: "不透明度" },
  ],

  states: [
    {
      name: "default（右上角·默认参数）",
      render: () => (
        <Stage>
          <SideRays opacity={0.85} />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            SideRays
          </div>
        </Stage>
      ),
    },
    {
      name: "左下角起点 · 暖色双束",
      render: () => (
        <Stage>
          <SideRays
            origin="bottom-left"
            rayColor1="oklch(0.78 0.18 70)"
            rayColor2="oklch(0.7 0.22 30)"
            intensity={2.4}
            opacity={0.8}
          />
        </Stage>
      ),
    },
    {
      name: "聚拢一道 · 高强度",
      render: () => (
        <Stage>
          <SideRays spread={1} intensity={3} falloff={1.9} opacity={0.9} />
        </Stage>
      ),
    },
    {
      name: "去色（saturation 0）· 微倾",
      render: () => (
        <Stage>
          <SideRays saturation={0} tilt={18} opacity={0.7} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <SideRays
        speed={p.speed as number}
        intensity={p.intensity as number}
        spread={p.spread as number}
        origin={p.origin as SideRaysOrigin}
        opacity={p.opacity as number}
      />
      <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
        SideRays
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <SideRays`,
      `    speed={${p.speed}}`,
      `    intensity={${p.intensity}}`,
      `    spread={${p.spread}}`,
      `    origin="${p.origin}"`,
      `    opacity={${p.opacity}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
