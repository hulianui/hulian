"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Antigravity } from "./antigravity";

/** 深色底舞台，让粒子吸附效果清晰可见；提示移动鼠标。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
      <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-white/40">
        移动鼠标吸附粒子
      </span>
    </div>
  );
}

export const antigravityShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认短棒粒子铺满容器，移动鼠标即把附近粒子吸入环绕光标的轨道。",
      code: `<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 255)" }}
>
  <Antigravity className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <Antigravity className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "形状与颜色",
      description: "shape 可选 bar / dot / square；color 接受任意 CSS 颜色或主题 token。",
      code: `<Antigravity
  className="absolute inset-0"
  shape="dot"
  color="oklch(0.72 0.22 30)"
  count={320}
/>`,
      render: () => (
        <Stage>
          <Antigravity
            className="absolute inset-0"
            shape="dot"
            color="oklch(0.72 0.22 30)"
            count={320}
          />
        </Stage>
      ),
    },
    {
      title: "自动巡游",
      description: "autoAnimate 让光标静止 2s 后粒子自行巡游，适合无人值守的大屏展示。",
      code: `<Antigravity
  className="absolute inset-0"
  autoAnimate
  rotationSpeed={0.4}
  shape="square"
  color="var(--color-chart-2)"
/>`,
      render: () => (
        <Stage>
          <Antigravity
            className="absolute inset-0"
            autoAnimate
            rotationSpeed={0.4}
            shape="square"
            color="var(--color-chart-2)"
          />
        </Stage>
      ),
    },
    {
      title: "大磁场 · 大环",
      description: "调大 magnetRadius / ringRadius / waveAmplitude 得到更舒展、更有机的轨道。",
      code: `<Antigravity
  className="absolute inset-0"
  magnetRadius={200}
  ringRadius={90}
  waveAmplitude={18}
  color="var(--color-chart-4)"
/>`,
      render: () => (
        <Stage>
          <Antigravity
            className="absolute inset-0"
            magnetRadius={200}
            ringRadius={90}
            waveAmplitude={18}
            color="var(--color-chart-4)"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "count", type: "number", defaultValue: 240, label: "粒子数" },
    { prop: "magnetRadius", type: "number", defaultValue: 130, label: "磁吸半径 px" },
    { prop: "ringRadius", type: "number", defaultValue: 56, label: "环半径 px" },
    { prop: "particleSize", type: "number", defaultValue: 4, label: "粒子尺寸 px" },
    {
      prop: "shape",
      type: "select",
      options: ["bar", "dot", "square"],
      defaultValue: "bar",
      label: "形状",
    },
    { prop: "autoAnimate", type: "boolean", defaultValue: false, label: "自动巡游" },
  ],

  states: [
    {
      name: "default（短棒·默认参数）",
      render: () => (
        <Stage>
          <Antigravity className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "圆点 · 暖橙",
      render: () => (
        <Stage>
          <Antigravity
            className="absolute inset-0"
            shape="dot"
            color="oklch(0.72 0.22 30)"
            count={320}
          />
        </Stage>
      ),
    },
    {
      name: "自动巡游（无人操作也动）",
      render: () => (
        <Stage>
          <Antigravity
            className="absolute inset-0"
            autoAnimate
            rotationSpeed={0.4}
            shape="square"
            color="var(--color-chart-2)"
          />
        </Stage>
      ),
    },
    {
      name: "大磁场 · 大环",
      render: () => (
        <Stage>
          <Antigravity
            className="absolute inset-0"
            magnetRadius={200}
            ringRadius={90}
            waveAmplitude={18}
            color="var(--color-chart-4)"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Antigravity
        className="absolute inset-0"
        count={p.count as number}
        magnetRadius={p.magnetRadius as number}
        ringRadius={p.ringRadius as number}
        particleSize={p.particleSize as number}
        shape={p.shape as "bar" | "dot" | "square"}
        autoAnimate={p.autoAnimate as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <Antigravity`,
      `    className="absolute inset-0"`,
      `    count={${p.count}}`,
      `    magnetRadius={${p.magnetRadius}}`,
      `    ringRadius={${p.ringRadius}}`,
      `    particleSize={${p.particleSize}}`,
      `    shape="${p.shape}"`,
      `    autoAnimate={${p.autoAnimate}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
