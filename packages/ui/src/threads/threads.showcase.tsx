"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Threads } from "./threads";

// ---------------------------------------------------------------------------
// 展示舞台容器：深色底让丝线效果清晰可见
// ---------------------------------------------------------------------------
function Stage({
  children,
  height = "h-56",
  dark = true,
}: {
  children: React.ReactNode;
  height?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative ${height} w-full max-w-2xl overflow-hidden rounded-xl border border-border`}
      style={{
        background: dark ? "oklch(0.10 0.015 265)" : "oklch(0.97 0.005 255)",
      }}
    >
      {children}
    </div>
  );
}

export const threadsShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "amplitude",
      type: "number",
      defaultValue: 1,
      label: "振幅（amplitude）",
    },
    {
      prop: "distance",
      type: "number",
      defaultValue: 0,
      label: "线间距（distance）",
    },
    {
      prop: "enableMouseInteraction",
      type: "boolean",
      defaultValue: true,
      label: "鼠标交互",
    },
  ],

  states: [
    {
      name: "默认（深色底 · chart-1 色）",
      render: () => (
        <Stage>
          <Threads />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm font-medium text-white/60">Threads</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "蓝色调 · 数组 color",
      render: () => (
        <Stage>
          <Threads color={[0.22, 0.53, 0.96]} amplitude={1.2} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">color=[0.22, 0.53, 0.96]</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "暖橙色 · CSS hex",
      render: () => (
        <Stage>
          <Threads color="#f97316" amplitude={0.8} distance={0.5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">color="#f97316"</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "chart-3 token · 高振幅",
      render: () => (
        <Stage>
          <Threads color="var(--color-chart-3)" amplitude={2.5} distance={0.3} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">amplitude=2.5</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "线间距拉开 · distance=1.5",
      render: () => (
        <Stage>
          <Threads amplitude={1} distance={1.5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">distance=1.5</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "禁用鼠标交互",
      render: () => (
        <Stage>
          <Threads enableMouseInteraction={false} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">enableMouseInteraction=false</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "浅色底",
      render: () => (
        <Stage dark={false}>
          <Threads color="var(--color-chart-1)" amplitude={1.2} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-foreground/50">浅色容器</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "Hero 用法示例（大卡）",
      render: () => (
        <Stage height="h-80">
          <Threads color={[0.18, 0.45, 0.88]} amplitude={1.4} distance={0.2} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <h2 className="text-2xl font-bold text-white">瑚琏组件库</h2>
            <p className="max-w-sm text-sm text-white/60">
              企业级 · 高质量 · 原生适配明暗主题
            </p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Threads
        amplitude={p.amplitude as number}
        distance={p.distance as number}
        enableMouseInteraction={p.enableMouseInteraction as boolean}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm text-white/50">Threads</p>
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.10 0.015 265)" }}>`,
      `  <Threads`,
      `    amplitude={${p.amplitude}}`,
      `    distance={${p.distance}}`,
      `    enableMouseInteraction={${p.enableMouseInteraction}}`,
      `  />`,
      `  {/* 内容层叠在 z-10 */}`,
      `  <div className="relative z-10">…</div>`,
      `</div>`,
    ].join("\n"),
};
