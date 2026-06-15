"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Plasma } from "./plasma";

/** 展示用深色底容器，让等离子效果清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 285)" }}
    >
      {children}
    </div>
  );
}

export const plasmaShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative overflow-hidden 容器即可；默认主色读 --color-chart-1 明暗自适应，向上涌动。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Plasma />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    Plasma
  </div>
</div>`,
      render: () => (
        <Stage>
          <Plasma />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Plasma
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义色 · 往复流动",
      description:
        "color 接任意 CSS 颜色；direction=\"pingpong\" 让等离子正反平滑往复（smoothstep 缓动无突变）。",
      code: `<Plasma color="oklch(0.72 0.22 30)" direction="pingpong" speed={1.4} />`,
      render: () => (
        <Stage>
          <Plasma color="oklch(0.72 0.22 30)" direction="pingpong" speed={1.4} />
        </Stage>
      ),
    },
    {
      title: "压暗背景 · 关交互",
      description:
        "opacity 压暗作为柔和背景；mouseInteractive={false} 关掉指针扰动并不挂监听，纯自动流动。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Plasma opacity={0.5} mouseInteractive={false} scale={1.3} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">瑚琏组件库</p>
    <p className="text-xs text-white/60">等离子 · WebGL · 明暗自适应</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <Plasma opacity={0.5} mouseInteractive={false} scale={1.3} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">等离子 · WebGL · 明暗自适应</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "反向流动",
      description: 'direction="reverse" 让等离子向下沉，配合紫调色彩。',
      code: `<Plasma color="oklch(0.65 0.24 290)" direction="reverse" />`,
      render: () => (
        <Stage>
          <Plasma color="oklch(0.65 0.24 290)" direction="reverse" />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "speed", type: "number", defaultValue: 1, label: "速度" },
    {
      prop: "direction",
      type: "select",
      options: ["forward", "reverse", "pingpong"],
      defaultValue: "forward",
      label: "方向",
    },
    { prop: "scale", type: "number", defaultValue: 1, label: "缩放" },
    { prop: "opacity", type: "number", defaultValue: 1, label: "不透明度" },
    {
      prop: "mouseInteractive",
      type: "boolean",
      defaultValue: true,
      label: "鼠标交互",
    },
  ],

  states: [
    {
      name: "default（默认·主题色等离子）",
      render: () => (
        <Stage>
          <Plasma />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Plasma
          </div>
        </Stage>
      ),
    },
    {
      name: "暖橙调 · pingpong 往复",
      render: () => (
        <Stage>
          <Plasma color="oklch(0.72 0.22 30)" direction="pingpong" speed={1.4} />
        </Stage>
      ),
    },
    {
      name: "压暗背景 · 关交互",
      render: () => (
        <Stage>
          <Plasma opacity={0.5} mouseInteractive={false} scale={1.3} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">等离子 · WebGL · 明暗自适应</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "反向 · 紫调",
      render: () => (
        <Stage>
          <Plasma color="oklch(0.65 0.24 290)" direction="reverse" />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Plasma
        speed={p.speed as number}
        direction={p.direction as "forward" | "reverse" | "pingpong"}
        scale={p.scale as number}
        opacity={p.opacity as number}
        mouseInteractive={p.mouseInteractive as boolean}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Plasma
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 285)" }}>`,
      `  <Plasma`,
      `    speed={${p.speed}}`,
      `    direction="${p.direction}"`,
      `    scale={${p.scale}}`,
      `    opacity={${p.opacity}}`,
      `    mouseInteractive={${p.mouseInteractive}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
