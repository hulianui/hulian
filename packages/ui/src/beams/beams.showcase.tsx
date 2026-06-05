"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Beams } from "./beams";

/** 展示用深色底容器，让光束效果清晰可见 */
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

export const beamsShowcase: ShowcaseSpec = {
  controls: [
    { prop: "beamNumber", type: "number", defaultValue: 12, label: "光束数量" },
    { prop: "beamWidth", type: "number", defaultValue: 2, label: "光束宽度" },
    { prop: "speed", type: "number", defaultValue: 2, label: "流动速度" },
    { prop: "scale", type: "number", defaultValue: 0.2, label: "噪声缩放" },
    { prop: "rotation", type: "number", defaultValue: 30, label: "旋转角度°" },
    { prop: "noiseIntensity", type: "number", defaultValue: 1.75, label: "颗粒强度" },
  ],

  states: [
    {
      name: "default（深色底·默认参数）",
      render: () => (
        <Stage>
          <Beams />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Beams
          </div>
        </Stage>
      ),
    },
    {
      name: "密集竖直光幕（rotation=0）",
      render: () => (
        <Stage>
          <Beams beamNumber={20} beamWidth={1.4} rotation={0} speed={3} />
        </Stage>
      ),
    },
    {
      name: "暖橙宽束（自定义 lightColor）",
      render: () => (
        <Stage>
          <Beams
            lightColor="oklch(0.78 0.18 55)"
            beamNumber={8}
            beamWidth={3}
            rotation={20}
            scale={0.3}
          />
        </Stage>
      ),
    },
    {
      name: "纯净无颗粒慢速（壁纸级）",
      render: () => (
        <Stage>
          <Beams noiseIntensity={0} speed={1} beamNumber={14} rotation={35} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">企业级 · 高质量 · 原生适配</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Beams
        beamNumber={p.beamNumber as number}
        beamWidth={p.beamWidth as number}
        speed={p.speed as number}
        scale={p.scale as number}
        rotation={p.rotation as number}
        noiseIntensity={p.noiseIntensity as number}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Beams
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <Beams`,
      `    beamNumber={${p.beamNumber}}`,
      `    beamWidth={${p.beamWidth}}`,
      `    speed={${p.speed}}`,
      `    scale={${p.scale}}`,
      `    rotation={${p.rotation}}`,
      `    noiseIntensity={${p.noiseIntensity}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
