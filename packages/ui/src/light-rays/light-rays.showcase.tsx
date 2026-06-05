"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { LightRays } from "./light-rays";
import type { LightRaysOrigin } from "./light-rays.types";

/** 展示用深色底容器，让体积光束清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.13 0.02 265)" }}
    >
      {children}
    </div>
  );
}

const ORIGINS: LightRaysOrigin[] = [
  "top-center",
  "top-left",
  "top-right",
  "left",
  "right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export const lightRaysShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "raysOrigin",
      type: "select",
      options: ORIGINS,
      defaultValue: "top-center",
      label: "光束原点",
    },
    { prop: "raysSpeed", type: "number", defaultValue: 1, label: "速度倍率" },
    { prop: "lightSpread", type: "number", defaultValue: 1, label: "扩散角度" },
    { prop: "rayLength", type: "number", defaultValue: 2, label: "光束长度" },
    { prop: "pulsating", type: "boolean", defaultValue: false, label: "脉动" },
    {
      prop: "followMouse",
      type: "boolean",
      defaultValue: true,
      label: "跟随鼠标",
    },
  ],

  states: [
    {
      name: "default（顶部中央放射）",
      render: () => (
        <Stage>
          <LightRays raysOrigin="top-center" className="opacity-90" />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LightRays
          </div>
        </Stage>
      ),
    },
    {
      name: "左侧射入 · 暖色",
      render: () => (
        <Stage>
          <LightRays
            raysOrigin="left"
            raysColor="oklch(0.78 0.16 70)"
            lightSpread={0.8}
            className="opacity-90"
          />
        </Stage>
      ),
    },
    {
      name: "脉动 + 噪点质感",
      render: () => (
        <Stage>
          <LightRays
            raysOrigin="top-center"
            pulsating
            noiseAmount={0.25}
            raysSpeed={1.4}
            className="opacity-90"
          />
        </Stage>
      ),
    },
    {
      name: "底部上射 · 聚拢窄束",
      render: () => (
        <Stage>
          <LightRays
            raysOrigin="bottom-center"
            lightSpread={0.4}
            rayLength={2.6}
            distortion={0.3}
            followMouse={false}
            className="opacity-90"
          >
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <p className="text-lg font-semibold text-white">瑚琏组件库</p>
              <p className="text-xs text-white/60">体积光束 · WebGL · token 着色</p>
            </div>
          </LightRays>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <LightRays
        raysOrigin={p.raysOrigin as LightRaysOrigin}
        raysSpeed={p.raysSpeed as number}
        lightSpread={p.lightSpread as number}
        rayLength={p.rayLength as number}
        pulsating={p.pulsating as boolean}
        followMouse={p.followMouse as boolean}
        className="opacity-90"
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        LightRays
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.13 0.02 265)" }}>`,
      `  <LightRays`,
      `    raysOrigin="${p.raysOrigin}"`,
      `    raysSpeed={${p.raysSpeed}}`,
      `    lightSpread={${p.lightSpread}}`,
      `    rayLength={${p.rayLength}}`,
      `    pulsating={${p.pulsating}}`,
      `    followMouse={${p.followMouse}}`,
      `    className="opacity-90"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
