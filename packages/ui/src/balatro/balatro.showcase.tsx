"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Balatro } from "./balatro";

/** 演示舞台：深色容器，让螺旋油彩充分展现（组件自带 absolute inset-0 z-0）。 */
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
      style={{ background: dark ? "oklch(0.12 0.02 270)" : "oklch(0.96 0.005 270)" }}
    >
      {children}
    </div>
  );
}

export const balatroShowcase: ShowcaseSpec = {
  controls: [
    { prop: "spinSpeed", type: "number", defaultValue: 7, label: "流动速度" },
    { prop: "contrast", type: "number", defaultValue: 3.5, label: "对比度" },
    { prop: "lighting", type: "number", defaultValue: 0.4, label: "高光强度" },
    { prop: "pixelFilter", type: "number", defaultValue: 745, label: "像素精细度" },
    { prop: "spinAmount", type: "number", defaultValue: 0.25, label: "旋转衰减" },
    { prop: "isRotate", type: "boolean", defaultValue: false, label: "持续自转" },
    { prop: "mouseInteraction", type: "boolean", defaultValue: true, label: "鼠标交互" },
  ],

  states: [
    {
      name: "default（深色底·chart token 三色）",
      render: () => (
        <Stage>
          <Balatro />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">Balatro</p>
            <p className="text-sm text-white/50">螺旋油彩 WebGL 背景</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "持续自转（isRotate）",
      render: () => (
        <Stage>
          <Balatro isRotate spinSpeed={4} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">isRotate</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "复古马赛克（pixelFilter=120）",
      render: () => (
        <Stage>
          <Balatro pixelFilter={120} contrast={4} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">pixelFilter = 120</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "自定义暖橙旋涡",
      render: () => (
        <Stage>
          <Balatro
            color1="oklch(0.72 0.2 40)"
            color2="oklch(0.6 0.18 25)"
            color3="oklch(0.18 0.04 30)"
            spinSpeed={5}
            lighting={0.6}
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">暖橙油彩</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Balatro
        spinSpeed={p.spinSpeed as number}
        contrast={p.contrast as number}
        lighting={p.lighting as number}
        pixelFilter={p.pixelFilter as number}
        spinAmount={p.spinAmount as number}
        isRotate={p.isRotate as boolean}
        mouseInteraction={p.mouseInteraction as boolean}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">Balatro · 螺旋油彩背景</p>
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 270)" }}>`,
      `  <Balatro`,
      `    spinSpeed={${p.spinSpeed}}`,
      `    contrast={${p.contrast}}`,
      `    lighting={${p.lighting}}`,
      `    pixelFilter={${p.pixelFilter}}`,
      `    spinAmount={${p.spinAmount}}`,
      `    isRotate={${p.isRotate}}`,
      `    mouseInteraction={${p.mouseInteraction}}`,
      `  />`,
      `  <div className="relative z-10">内容</div>`,
      `</div>`,
    ].join("\n"),
};
