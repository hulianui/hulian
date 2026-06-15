"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Radar } from "./radar";

/** 展示用深色底容器，让雷达效果清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const radarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "默认主色吃 chart token、底色透明；放在 relative 容器里自带 absolute inset-0 z-0。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Radar />
</div>`,
      render: () => (
        <Stage>
          <Radar />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Radar
          </div>
        </Stage>
      ),
    },
    {
      title: "密集环 · 双瓣快扫",
      description:
        "ringCount/spokeCount 控制环与辐条密度，sweepLobes=2 同时两束对称扫描臂。",
      code: `<Radar ringCount={16} spokeCount={16} sweepSpeed={1.8} sweepLobes={2} />`,
      render: () => (
        <Stage>
          <Radar ringCount={16} spokeCount={16} sweepSpeed={1.8} sweepLobes={2} />
        </Stage>
      ),
    },
    {
      title: "自定义主色",
      description: "color 传任意 CSS 颜色覆盖默认 token，brightness 提亮整盘。",
      code: `<Radar color="oklch(0.78 0.16 165)" brightness={1.4} scale={0.45} />`,
      render: () => (
        <Stage>
          <Radar color="oklch(0.78 0.16 165)" brightness={1.4} scale={0.45} />
        </Stage>
      ),
    },
    {
      title: "宽扫描臂 · 无辐条",
      description:
        "spokeCount=0 去掉辐条、sweepWidth 调宽扫描光束，关掉鼠标视差做纯静态背景。",
      code: `<Radar
  spokeCount={0}
  sweepWidth={1}
  sweepSpeed={0.8}
  enableMouseInteraction={false}
/>`,
      render: () => (
        <Stage>
          <Radar
            spokeCount={0}
            sweepWidth={1}
            sweepSpeed={0.8}
            enableMouseInteraction={false}
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "scale", type: "number", defaultValue: 0.5, label: "缩放" },
    { prop: "ringCount", type: "number", defaultValue: 10, label: "环数" },
    { prop: "spokeCount", type: "number", defaultValue: 10, label: "辐条数" },
    { prop: "sweepSpeed", type: "number", defaultValue: 1, label: "扫描速度" },
    { prop: "sweepLobes", type: "number", defaultValue: 1, label: "扫描瓣数" },
    { prop: "brightness", type: "number", defaultValue: 1, label: "亮度" },
    {
      prop: "enableMouseInteraction",
      type: "boolean",
      defaultValue: true,
      label: "鼠标视差",
    },
  ],

  states: [
    {
      name: "default（默认参数·主色吃 chart token）",
      render: () => (
        <Stage>
          <Radar />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Radar
          </div>
        </Stage>
      ),
    },
    {
      name: "密集环 + 双瓣快扫",
      render: () => (
        <Stage>
          <Radar ringCount={16} spokeCount={16} sweepSpeed={1.8} sweepLobes={2} />
        </Stage>
      ),
    },
    {
      name: "自定义色（青绿）· 高亮度",
      render: () => (
        <Stage>
          <Radar color="oklch(0.78 0.16 165)" brightness={1.4} scale={0.45} />
        </Stage>
      ),
    },
    {
      name: "宽扫描臂 · 无辐条 · 关视差",
      render: () => (
        <Stage>
          <Radar
            spokeCount={0}
            sweepWidth={1}
            sweepSpeed={0.8}
            enableMouseInteraction={false}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Radar
        scale={p.scale as number}
        ringCount={p.ringCount as number}
        spokeCount={p.spokeCount as number}
        sweepSpeed={p.sweepSpeed as number}
        sweepLobes={p.sweepLobes as number}
        brightness={p.brightness as number}
        enableMouseInteraction={p.enableMouseInteraction as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <Radar`,
      `    scale={${p.scale}}`,
      `    ringCount={${p.ringCount}}`,
      `    spokeCount={${p.spokeCount}}`,
      `    sweepSpeed={${p.sweepSpeed}}`,
      `    sweepLobes={${p.sweepLobes}}`,
      `    brightness={${p.brightness}}`,
      `    enableMouseInteraction={${p.enableMouseInteraction}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
