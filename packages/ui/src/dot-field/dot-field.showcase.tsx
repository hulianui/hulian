"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { DotField } from "./dot-field";

/** 展示用深色底容器，让点阵 + 辉光在对比下清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border p-8"
      style={{ background: "oklch(0.14 0.02 280)" }}
    >
      {children}
      <div className="pointer-events-none relative z-10 max-w-sm text-sm font-medium text-white/70">
        由正文决定容器高度，前景内容叠在可交互的点阵背景上方。
      </div>
    </div>
  );
}

export const dotFieldShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点阵背景，移动鼠标推挤点阵并在下方泛起辉光；颜色默认吃 chart / primary token。",
      code: `<div className="relative overflow-hidden rounded-xl bg-neutral-950 p-8">
  <DotField />
  <div className="relative z-10">由正文决定容器高度的前景内容</div>
</div>`,
      render: () => (
        <Stage>
          <DotField />
        </Stage>
      ),
    },
    {
      title: "稀疏点阵 + 强鼓胀",
      description: "调大 dotSpacing 让点阵更稀疏，加大 bulgeStrength / cursorRadius 得到更夸张的隆起。",
      code: `<DotField dotSpacing={22} dotRadius={2} bulgeStrength={80} cursorRadius={260} />`,
      render: () => (
        <Stage>
          <DotField dotSpacing={22} dotRadius={2} bulgeStrength={80} cursorRadius={260} />
        </Stage>
      ),
    },
    {
      title: "波浪起伏 + 星点闪烁",
      description: "waveAmplitude 让点阵整体做正弦呼吸，sparkle 让少量点偶尔放大成星点。",
      code: `<DotField waveAmplitude={5} sparkle dotSpacing={16} />`,
      render: () => (
        <Stage>
          <DotField waveAmplitude={5} sparkle dotSpacing={16} />
        </Stage>
      ),
    },
    {
      title: "自定义颜色",
      description: "color 控制点色、glowColor 控制辉光色；任意 CSS 颜色字符串皆可。",
      code: `<DotField color="oklch(0.75 0.2 50)" glowColor="oklch(0.7 0.18 200)" />`,
      render: () => (
        <Stage>
          <DotField color="oklch(0.75 0.2 50)" glowColor="oklch(0.7 0.18 200)" />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "dotSpacing", type: "number", defaultValue: 14, label: "点间距 px" },
    { prop: "dotRadius", type: "number", defaultValue: 1.5, label: "点半径 px" },
    { prop: "bulgeStrength", type: "number", defaultValue: 56, label: "鼓胀强度 px" },
    { prop: "cursorRadius", type: "number", defaultValue: 220, label: "光标半径 px" },
    { prop: "waveAmplitude", type: "number", defaultValue: 0, label: "波浪振幅 px" },
    { prop: "sparkle", type: "boolean", defaultValue: false, label: "星点闪烁" },
  ],

  states: [
    {
      name: "default（移动鼠标推挤点阵 + 辉光）",
      render: () => (
        <Stage>
          <DotField />
        </Stage>
      ),
    },
    {
      name: "稀疏点阵 + 强鼓胀",
      render: () => (
        <Stage>
          <DotField dotSpacing={22} dotRadius={2} bulgeStrength={80} cursorRadius={260} />
        </Stage>
      ),
    },
    {
      name: "波浪起伏 + 星点闪烁",
      render: () => (
        <Stage>
          <DotField waveAmplitude={5} sparkle dotSpacing={16} />
        </Stage>
      ),
    },
    {
      name: "自定义色（暖橙点 · 青辉光）",
      render: () => (
        <Stage>
          <DotField color="oklch(0.75 0.2 50)" glowColor="oklch(0.7 0.18 200)" />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <DotField
        dotSpacing={p.dotSpacing as number}
        dotRadius={p.dotRadius as number}
        bulgeStrength={p.bulgeStrength as number}
        cursorRadius={p.cursorRadius as number}
        waveAmplitude={p.waveAmplitude as number}
        sparkle={p.sparkle as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative overflow-hidden rounded-xl p-8"`,
      `     style={{ background: "oklch(0.14 0.02 280)" }}>`,
      `  <DotField`,
      `    dotSpacing={${p.dotSpacing}}`,
      `    dotRadius={${p.dotRadius}}`,
      `    bulgeStrength={${p.bulgeStrength}}`,
      `    cursorRadius={${p.cursorRadius}}`,
      `    waveAmplitude={${p.waveAmplitude}}`,
      `    sparkle={${p.sparkle}}`,
      `  />`,
      `  <div className="relative z-10">由正文决定容器高度的前景内容</div>`,
      `</div>`,
    ].join("\n"),
};
