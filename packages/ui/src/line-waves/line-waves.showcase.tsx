"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { LineWaves } from "./line-waves";

/**
 * 演示舞台：深色容器，让波纹线阵充分展现（线条偏亮，深底对比最佳）。
 * 组件自带 absolute inset-0 z-0。
 */
function Stage({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10"
      style={{ background: dark ? "oklch(0.12 0.02 265)" : "oklch(0.96 0.005 265)" }}
    >
      {children}
    </div>
  );
}

export const lineWavesShowcase: ShowcaseSpec = {
  controls: [
    { prop: "speed", type: "number", defaultValue: 0.3, label: "速度" },
    { prop: "warpIntensity", type: "number", defaultValue: 1, label: "扭曲强度" },
    { prop: "rotation", type: "number", defaultValue: -45, label: "旋转角（度）" },
    { prop: "brightness", type: "number", defaultValue: 0.2, label: "亮度" },
    {
      prop: "enableMouseInteraction",
      type: "boolean",
      defaultValue: true,
      label: "鼠标交互",
    },
  ],

  states: [
    {
      name: "default（深色底·chart token 配色）",
      render: () => (
        <Stage>
          <LineWaves />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">LineWaves</p>
            <p className="text-sm text-white/50">流动波纹线阵 · 移动鼠标试试</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "高亮 + 高扭曲（brightness=0.4·warp=1.6）",
      render: () => (
        <Stage>
          <LineWaves brightness={0.4} warpIntensity={1.6} speed={0.5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">汹涌波纹</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "经典白线（三色同 #ffffff·还原原版）",
      render: () => (
        <Stage>
          <LineWaves
            color1="#ffffff"
            color2="#ffffff"
            color3="#ffffff"
            brightness={0.25}
            colorCycleSpeed={0}
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/60">经典单色波纹</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "水平走向 + 关交互（rotation=0·静态自动流动）",
      render: () => (
        <Stage>
          <LineWaves
            rotation={0}
            enableMouseInteraction={false}
            innerLineCount={24}
            outerLineCount={40}
            brightness={0.3}
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">水平线阵</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <LineWaves
        speed={p.speed as number}
        warpIntensity={p.warpIntensity as number}
        rotation={p.rotation as number}
        brightness={p.brightness as number}
        enableMouseInteraction={p.enableMouseInteraction as boolean}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">LineWaves · WebGL 背景</p>
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 265)" }}>`,
      `  <LineWaves`,
      `    speed={${p.speed}}`,
      `    warpIntensity={${p.warpIntensity}}`,
      `    rotation={${p.rotation}}`,
      `    brightness={${p.brightness}}`,
      `    enableMouseInteraction={${p.enableMouseInteraction}}`,
      `  />`,
      `  <div className="relative z-10">内容</div>`,
      `</div>`,
    ].join("\n"),
};
