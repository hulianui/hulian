"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { LightPillar } from "./light-pillar";

/** 展示用深色底容器，让体积光柱清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.12 0.02 270)" }}
    >
      {children}
    </div>
  );
}

export const lightPillarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认顶/底色吃 chart token，组件自带 absolute inset-0 z-0。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <LightPillar />
  <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
    LightPillar
  </div>
</div>`,
      render: () => (
        <Stage>
          <LightPillar />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LightPillar
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义双色（原版紫→粉）",
      description: "topColor / bottomColor 沿 y 轴渐变混合，构成色彩纵深。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1.1} />
</div>`,
      render: () => (
        <Stage>
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1.1} />
        </Stage>
      ),
    },
    {
      title: "细激光（窄柱·无颗粒）",
      description: "pillarWidth 调细 + glowAmount 提亮，noiseIntensity=0 去颗粒。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2} />
</div>`,
      render: () => (
        <Stage>
          <LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2} />
        </Stage>
      ),
    },
    {
      title: "倾斜光柱（慢转）",
      description: "pillarRotation 让光柱斜射，rotationSpeed 调慢自转。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <LightPillar pillarRotation={30} rotationSpeed={0.15} pillarWidth={2.4} />
</div>`,
      render: () => (
        <Stage>
          <LightPillar pillarRotation={30} rotationSpeed={0.15} pillarWidth={2.4} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "intensity", type: "number", defaultValue: 1, label: "亮度系数" },
    { prop: "rotationSpeed", type: "number", defaultValue: 0.3, label: "自转速度" },
    { prop: "pillarWidth", type: "number", defaultValue: 3, label: "光柱粗细" },
    { prop: "noiseIntensity", type: "number", defaultValue: 0.5, label: "颗粒强度" },
  ],

  states: [
    {
      name: "default（token 双色·默认参数）",
      render: () => (
        <Stage>
          <LightPillar />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LightPillar
          </div>
        </Stage>
      ),
    },
    {
      name: "自定义双色（紫→粉，原版配色）",
      render: () => (
        <Stage>
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1.1} />
        </Stage>
      ),
    },
    {
      name: "细激光（窄柱·高亮·无颗粒）",
      render: () => (
        <Stage>
          <LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2} />
        </Stage>
      ),
    },
    {
      name: "倾斜光柱（30°·慢转）",
      render: () => (
        <Stage>
          <LightPillar pillarRotation={30} rotationSpeed={0.15} pillarWidth={2.4} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <LightPillar
        intensity={p.intensity as number}
        rotationSpeed={p.rotationSpeed as number}
        pillarWidth={p.pillarWidth as number}
        noiseIntensity={p.noiseIntensity as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 270)" }}>`,
      `  <LightPillar`,
      `    intensity={${p.intensity}}`,
      `    rotationSpeed={${p.rotationSpeed}}`,
      `    pillarWidth={${p.pillarWidth}}`,
      `    noiseIntensity={${p.noiseIntensity}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
