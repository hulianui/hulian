"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { FaultyTerminal } from "./faulty-terminal";

/** 展示用深色终端机壳，让字符雨故障效果清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.12 0.01 255)" }}
    >
      {children}
    </div>
  );
}

export const faultyTerminalShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "出故障的 CRT 终端字符雨背景；默认字符着色吃 --color-chart-2，明暗自适应。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <FaultyTerminal />
</div>`,
      render: () => (
        <Stage>
          <FaultyTerminal />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/70">
            FaultyTerminal
          </div>
        </Stage>
      ),
    },
    {
      title: "老 CRT（暖橙 + 桶形畸变）",
      description: "tint 换暖橙、curvature 加大球面弯曲、scanline + 色散还原老显像管质感。",
      code: `<FaultyTerminal
  tint="oklch(0.72 0.2 45)"
  curvature={0.45}
  scanlineIntensity={0.5}
  chromaticAberration={3}
/>`,
      render: () => (
        <Stage>
          <FaultyTerminal
            tint="oklch(0.72 0.2 45)"
            curvature={0.45}
            scanlineIntensity={0.5}
            chromaticAberration={3}
          />
        </Stage>
      ),
    },
    {
      title: "信号撕裂（高故障量）",
      description: "加大 glitchAmount / chromaticAberration / flickerAmount 模拟信号干扰撕裂。",
      code: `<FaultyTerminal
  glitchAmount={2}
  chromaticAberration={5}
  flickerAmount={1.5}
  brightness={1.2}
/>`,
      render: () => (
        <Stage>
          <FaultyTerminal
            glitchAmount={2}
            chromaticAberration={5}
            flickerAmount={1.5}
            brightness={1.2}
          />
        </Stage>
      ),
    },
    {
      title: "冻结定格",
      description: "pause 暂停时间推进，画面定格；mouseReact=false 关掉鼠标响应做纯静态封面。",
      code: `<FaultyTerminal pause scale={2} mouseReact={false} />`,
      render: () => (
        <Stage>
          <FaultyTerminal pause scale={2} mouseReact={false} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "scale", type: "number", defaultValue: 1.5, label: "缩放" },
    { prop: "scanlineIntensity", type: "number", defaultValue: 0.3, label: "扫描线" },
    { prop: "curvature", type: "number", defaultValue: 0.2, label: "桶形畸变" },
    { prop: "brightness", type: "number", defaultValue: 1, label: "亮度" },
    { prop: "mouseReact", type: "boolean", defaultValue: true, label: "鼠标响应" },
  ],

  states: [
    {
      name: "default（绿色字符雨·默认参数）",
      render: () => (
        <Stage>
          <FaultyTerminal />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/70">
            FaultyTerminal
          </div>
        </Stage>
      ),
    },
    {
      name: "暖橙调 + 强桶形畸变（老 CRT）",
      render: () => (
        <Stage>
          <FaultyTerminal
            tint="oklch(0.72 0.2 45)"
            curvature={0.45}
            scanlineIntensity={0.5}
            chromaticAberration={3}
          />
        </Stage>
      ),
    },
    {
      name: "色散 + 高故障量（信号撕裂）",
      render: () => (
        <Stage>
          <FaultyTerminal
            glitchAmount={2}
            chromaticAberration={5}
            flickerAmount={1.5}
            brightness={1.2}
          />
        </Stage>
      ),
    },
    {
      name: "冻结定格（pause）",
      render: () => (
        <Stage>
          <FaultyTerminal pause scale={2} mouseReact={false} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <FaultyTerminal
        scale={p.scale as number}
        scanlineIntensity={p.scanlineIntensity as number}
        curvature={p.curvature as number}
        brightness={p.brightness as number}
        mouseReact={p.mouseReact as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.01 255)" }}>`,
      `  <FaultyTerminal`,
      `    scale={${p.scale}}`,
      `    scanlineIntensity={${p.scanlineIntensity}}`,
      `    curvature={${p.curvature}}`,
      `    brightness={${p.brightness}}`,
      `    mouseReact={${p.mouseReact}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
