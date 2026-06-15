"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PlasmaWave } from "./plasma-wave";

/** 展示用深色底容器，让等离子波纹清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 280)" }}
    >
      {children}
    </div>
  );
}

export const plasmaWaveShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative overflow-hidden 容器并给 className=\"absolute inset-0\" 铺满；双色默认取 chart token 明暗自适应。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <PlasmaWave className="absolute inset-0" />
  <div className="absolute inset-0 flex items-center justify-center text-white/80">
    PlasmaWave
  </div>
</div>`,
      render: () => (
        <Stage>
          <PlasmaWave className="absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            PlasmaWave
          </div>
        </Stage>
      ),
    },
    {
      title: "斜向旋转 + 强焦距",
      description:
        "rotationDeg 整体旋转波带制造斜向张力；focalLength 越大波纹越聚拢、纵深越强。",
      code: `<PlasmaWave className="absolute inset-0" rotationDeg={28} focalLength={1.3} />`,
      render: () => (
        <Stage>
          <PlasmaWave className="absolute inset-0" rotationDeg={28} focalLength={1.3} />
        </Stage>
      ),
    },
    {
      title: "对冲流向 · 暖色",
      description:
        "colors 自定义双色；dir2={-1} 让第二条丝带反向流动，与第一条对冲产生交织感。",
      code: `<PlasmaWave
  className="absolute inset-0"
  colors={["var(--color-chart-3)", "oklch(0.72 0.22 30)"]}
  dir2={-1}
  speed1={0.1}
  speed2={0.08}
  bend1={1.4}
/>`,
      render: () => (
        <Stage>
          <PlasmaWave
            className="absolute inset-0"
            colors={["var(--color-chart-3)", "oklch(0.72 0.22 30)"]}
            dir2={-1}
            speed1={0.1}
            speed2={0.08}
            bend1={1.4}
          />
        </Stage>
      ),
    },
    {
      title: "壁纸级慢速大弯曲",
      description:
        "低速 + 大 bend 让波纹缓慢起伏，作为标题区背景叠在文字下方。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <PlasmaWave
    className="absolute inset-0"
    speed1={0.03}
    speed2={0.03}
    bend1={1.6}
    bend2={1.2}
    focalLength={0.6}
  />
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">瑚琏组件库</p>
    <p className="text-xs text-white/60">等离子波 · WebGL · 主题感知</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <PlasmaWave
            className="absolute inset-0"
            speed1={0.03}
            speed2={0.03}
            bend1={1.6}
            bend2={1.2}
            focalLength={0.6}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">等离子波 · WebGL · 主题感知</p>
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "rotationDeg", type: "number", defaultValue: 0, label: "旋转角度 °" },
    { prop: "focalLength", type: "number", defaultValue: 0.8, label: "焦距" },
    { prop: "speed1", type: "number", defaultValue: 0.05, label: "丝带1 流速" },
    { prop: "speed2", type: "number", defaultValue: 0.05, label: "丝带2 流速" },
    { prop: "bend1", type: "number", defaultValue: 1, label: "丝带1 弯曲" },
    { prop: "bend2", type: "number", defaultValue: 0.5, label: "丝带2 弯曲" },
  ],

  states: [
    {
      name: "default（chart token 双色）",
      render: () => (
        <Stage>
          <PlasmaWave className="absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            PlasmaWave
          </div>
        </Stage>
      ),
    },
    {
      name: "斜向旋转 + 强焦距",
      render: () => (
        <Stage>
          <PlasmaWave className="absolute inset-0" rotationDeg={28} focalLength={1.3} />
        </Stage>
      ),
    },
    {
      name: "对冲流向（dir2 反向）+ 暖色",
      render: () => (
        <Stage>
          <PlasmaWave
            className="absolute inset-0"
            colors={["var(--color-chart-3)", "oklch(0.72 0.22 30)"]}
            dir2={-1}
            speed1={0.1}
            speed2={0.08}
            bend1={1.4}
          />
        </Stage>
      ),
    },
    {
      name: "壁纸级（慢速大弯曲）",
      render: () => (
        <Stage>
          <PlasmaWave
            className="absolute inset-0"
            speed1={0.03}
            speed2={0.03}
            bend1={1.6}
            bend2={1.2}
            focalLength={0.6}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">等离子波 · WebGL · 主题感知</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <PlasmaWave
        className="absolute inset-0"
        rotationDeg={p.rotationDeg as number}
        focalLength={p.focalLength as number}
        speed1={p.speed1 as number}
        speed2={p.speed2 as number}
        bend1={p.bend1 as number}
        bend2={p.bend2 as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 280)" }}>`,
      `  <PlasmaWave`,
      `    className="absolute inset-0"`,
      `    rotationDeg={${p.rotationDeg}}`,
      `    focalLength={${p.focalLength}}`,
      `    speed1={${p.speed1}}`,
      `    speed2={${p.speed2}}`,
      `    bend1={${p.bend1}}`,
      `    bend2={${p.bend2}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
