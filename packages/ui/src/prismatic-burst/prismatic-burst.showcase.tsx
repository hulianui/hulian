"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PrismaticBurst } from "./prismatic-burst";

/** 展示用深色底容器，让棱镜光爆清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.13 0.02 275)" }}
    >
      {children}
    </div>
  );
}

export const prismaticBurstShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "默认连续光晕 + 主题 chart token 光谱；放在 relative 容器里自带 absolute inset-0 z-0。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 275)" }}>
  <PrismaticBurst className="opacity-90" />
</div>`,
      render: () => (
        <Stage>
          <PrismaticBurst className="opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            PrismaticBurst
          </div>
        </Stage>
      ),
    },
    {
      title: "射线瓣数",
      description: "rayCount>0 按角度梳理出 N 条对称射线，6 = 六芒星式爆发。",
      code: `<PrismaticBurst rayCount={6} intensity={2.4} className="opacity-95" />`,
      render: () => (
        <Stage>
          <PrismaticBurst rayCount={6} intensity={2.4} className="opacity-95" />
        </Stage>
      ),
    },
    {
      title: "三维翻滚 + 扭曲",
      description:
        "animationType=rotate3d 立体翻滚，distort 把射线像引力透镜般扭弯，noiseAmount 弱化条带。",
      code: `<PrismaticBurst
  animationType="rotate3d"
  distort={18}
  speed={1.4}
  noiseAmount={0.4}
  className="opacity-90"
/>`,
      render: () => (
        <Stage>
          <PrismaticBurst
            animationType="rotate3d"
            distort={18}
            speed={1.4}
            noiseAmount={0.4}
            className="opacity-90"
          />
        </Stage>
      ),
    },
    {
      title: "自定义色带",
      description:
        "colors 传 CSS 颜色数组（支持 var token）烘焙成渐变纹理；hover 模式跟随指针倾斜。",
      code: `<PrismaticBurst
  animationType="hover"
  colors={[
    "oklch(0.72 0.22 30)",
    "var(--color-chart-3)",
    "oklch(0.78 0.16 90)",
  ]}
  intensity={2.2}
  className="opacity-90"
/>`,
      render: () => (
        <Stage>
          <PrismaticBurst
            animationType="hover"
            colors={[
              "oklch(0.72 0.22 30)",
              "var(--color-chart-3)",
              "oklch(0.78 0.16 90)",
            ]}
            intensity={2.2}
            className="opacity-90"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "intensity", type: "number", defaultValue: 2, label: "亮度增益" },
    { prop: "speed", type: "number", defaultValue: 1, label: "动画速度" },
    {
      prop: "animationType",
      type: "select",
      options: ["rotate", "rotate3d", "hover"],
      defaultValue: "rotate",
      label: "运动方式",
    },
    { prop: "rayCount", type: "number", defaultValue: 0, label: "射线瓣数（0=连续）" },
    { prop: "distort", type: "number", defaultValue: 0, label: "扭曲量 0–50" },
  ],

  states: [
    {
      name: "default（连续光晕·token 光谱）",
      render: () => (
        <Stage>
          <PrismaticBurst className="opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            PrismaticBurst
          </div>
        </Stage>
      ),
    },
    {
      name: "六瓣射线（rayCount=6）",
      render: () => (
        <Stage>
          <PrismaticBurst rayCount={6} intensity={2.4} className="opacity-95" />
        </Stage>
      ),
    },
    {
      name: "三维翻滚 + 扭曲（rotate3d · distort）",
      render: () => (
        <Stage>
          <PrismaticBurst
            animationType="rotate3d"
            distort={18}
            speed={1.4}
            noiseAmount={0.4}
            className="opacity-90"
          />
        </Stage>
      ),
    },
    {
      name: "自定义暖调色带（hover 跟随）",
      render: () => (
        <Stage>
          <PrismaticBurst
            animationType="hover"
            colors={[
              "oklch(0.72 0.22 30)",
              "var(--color-chart-3)",
              "oklch(0.78 0.16 90)",
            ]}
            intensity={2.2}
            className="opacity-90"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <PrismaticBurst
        intensity={p.intensity as number}
        speed={p.speed as number}
        animationType={p.animationType as "rotate" | "rotate3d" | "hover"}
        rayCount={p.rayCount as number}
        distort={p.distort as number}
        className="opacity-90"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.13 0.02 275)" }}>`,
      `  <PrismaticBurst`,
      `    intensity={${p.intensity}}`,
      `    speed={${p.speed}}`,
      `    animationType="${p.animationType}"`,
      `    rayCount={${p.rayCount}}`,
      `    distort={${p.distort}}`,
      `    className="opacity-90"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
