"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PixelBlast } from "./pixel-blast";

/**
 * 演示舞台：深色容器，让抖动点阵充分展现。
 * 组件假定放在 relative 容器内；自带 absolute inset-0 z-0。
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
      style={{
        background: dark ? "oklch(0.12 0.02 285)" : "oklch(0.97 0.005 285)",
      }}
    >
      {children}
    </div>
  );
}

export const pixelBlastShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative overflow-hidden 容器，组件自带 absolute inset-0 z-0；默认方块点阵，主色读 --color-primary 明暗自适应。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <PixelBlast />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">PixelBlast</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <PixelBlast />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-2xl font-bold tracking-tight text-white/90">PixelBlast</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "形状变体",
      description:
        "variant 支持 square / circle / triangle / diamond 四种像素单元形状，pixelSize 控制单格大小。",
      code: `<>
  <PixelBlast variant="circle" pixelSize={6} />
  <PixelBlast variant="triangle" patternDensity={1.3} />
  <PixelBlast variant="diamond" pixelSize={5} />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <Stage>
            <PixelBlast variant="circle" pixelSize={6} />
            <div className="relative z-10 flex h-full items-center justify-center">
              <p className="text-sm font-semibold text-white/70">circle · 网点印刷感</p>
            </div>
          </Stage>
          <Stage>
            <PixelBlast variant="triangle" patternDensity={1.3} patternScale={2.5} />
            <div className="relative z-10 flex h-full items-center justify-center">
              <p className="text-sm font-semibold text-white/70">triangle · 织纹</p>
            </div>
          </Stage>
          <Stage>
            <PixelBlast variant="diamond" pixelSizeJitter={0.5} pixelSize={5} />
            <div className="relative z-10 flex h-full items-center justify-center">
              <p className="text-sm font-semibold text-white/70">diamond · 参差颗粒</p>
            </div>
          </Stage>
        </div>
      ),
    },
    {
      title: "自定义色 + 强渐隐",
      description:
        "color 接任意 CSS 颜色；edgeFade 调大让四角淡出更柔和，便于把点阵当作内容背景。",
      code: `<PixelBlast
  variant="square"
  color="oklch(0.65 0.26 285)"
  speed={0.25}
  patternScale={1.5}
  edgeFade={0.7}
/>`,
      render: () => (
        <Stage>
          <PixelBlast
            variant="square"
            color="oklch(0.65 0.26 285)"
            speed={0.25}
            patternScale={1.5}
            edgeFade={0.7}
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-violet-200/90">极光蓝紫 · 慢速壁纸</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "无渐隐铺满",
      description: "edgeFade={0} 取消四周渐隐，点阵硬边铺满整个容器。",
      code: `<PixelBlast variant="circle" color="oklch(0.74 0.18 55)" edgeFade={0} pixelSize={5} />`,
      render: () => (
        <Stage>
          <PixelBlast
            variant="circle"
            color="oklch(0.74 0.18 55)"
            edgeFade={0}
            pixelSize={5}
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">edgeFade = 0 · 铺满</p>
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["square", "circle", "triangle", "diamond"],
      defaultValue: "square",
      label: "形状",
    },
    { prop: "pixelSize", type: "number", defaultValue: 4, label: "像素尺寸" },
    { prop: "patternScale", type: "number", defaultValue: 2, label: "噪声缩放" },
    { prop: "patternDensity", type: "number", defaultValue: 1, label: "填充密度" },
    { prop: "pixelSizeJitter", type: "number", defaultValue: 0, label: "尺寸抖动" },
    { prop: "speed", type: "number", defaultValue: 0.5, label: "速度" },
    { prop: "edgeFade", type: "number", defaultValue: 0.5, label: "边缘渐隐" },
    { prop: "color", type: "text", defaultValue: "", label: "自定义色（留空=primary）" },
  ],

  states: [
    {
      name: "default（深色底·primary token·方块）",
      render: () => (
        <Stage>
          <PixelBlast />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold tracking-tight text-white/90">PixelBlast</p>
            <p className="text-sm text-white/50">抖动点阵 WebGL 背景</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "圆点（circle · pixelSize=6）",
      render: () => (
        <Stage>
          <PixelBlast variant="circle" pixelSize={6} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">circle · 网点印刷感</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "三角织纹（triangle · 高密度）",
      render: () => (
        <Stage>
          <PixelBlast variant="triangle" patternDensity={1.3} patternScale={2.5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">triangle · 织纹</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "菱形 + 尺寸抖动（diamond · jitter=0.5）",
      render: () => (
        <Stage>
          <PixelBlast variant="diamond" pixelSizeJitter={0.5} pixelSize={5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">diamond · 参差颗粒</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "自定义极光蓝紫 + 慢速壁纸",
      render: () => (
        <Stage>
          <PixelBlast
            variant="square"
            color="oklch(0.65 0.26 285)"
            speed={0.25}
            patternScale={1.5}
            edgeFade={0.7}
          />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-violet-200/90">极光蓝紫</p>
            <p className="text-xs text-white/40">慢速 · 强渐隐 · 壁纸级</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "无渐隐铺满（edgeFade=0 · 暖橙）",
      render: () => (
        <Stage>
          <PixelBlast variant="circle" color="oklch(0.74 0.18 55)" edgeFade={0} pixelSize={5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">edgeFade = 0 · 铺满</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "浅色底（亮色主题）",
      render: () => (
        <Stage dark={false}>
          <PixelBlast variant="square" color="oklch(0.55 0.2 270)" edgeFade={0.4} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-neutral-700">浅色底 · 自定义色</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <PixelBlast
        variant={p.variant as "square" | "circle" | "triangle" | "diamond"}
        pixelSize={p.pixelSize as number}
        patternScale={p.patternScale as number}
        patternDensity={p.patternDensity as number}
        pixelSizeJitter={p.pixelSizeJitter as number}
        speed={p.speed as number}
        edgeFade={p.edgeFade as number}
        color={(p.color as string) || undefined}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">PixelBlast · WebGL 背景</p>
      </div>
    </Stage>
  ),

  toCode: (p) => {
    const colorLine = p.color ? `\n    color="${p.color}"` : "";
    return [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 285)" }}>`,
      `  <PixelBlast`,
      `    variant="${p.variant}"`,
      `    pixelSize={${p.pixelSize}}`,
      `    patternScale={${p.patternScale}}`,
      `    patternDensity={${p.patternDensity}}`,
      `    pixelSizeJitter={${p.pixelSizeJitter}}`,
      `    speed={${p.speed}}`,
      `    edgeFade={${p.edgeFade}}${colorLine}`,
      `  />`,
      `  <div className="relative z-10">内容</div>`,
      `</div>`,
    ].join("\n");
  },
};
