"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { DarkVeil } from "./dark-veil";

/** 展示用深色底容器，让暗色帷幕效果清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.12 0.02 280)" }}
    >
      {children}
    </div>
  );
}

export const darkVeilShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认冷调暗色帷幕，放进 relative 容器即可铺满。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 280)" }}>
  <DarkVeil />
</div>`,
      render: () => (
        <Stage>
          <DarkVeil />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            DarkVeil
          </div>
        </Stage>
      ),
    },
    {
      title: "色相偏移 + 扭曲",
      description: "hueShift 旋转基调，warpAmount 让帷幕产生波动折射感。",
      code: `<DarkVeil hueShift={120} warpAmount={0.08} speed={0.6} />`,
      render: () => (
        <Stage>
          <DarkVeil hueShift={120} warpAmount={0.08} speed={0.6} />
        </Stage>
      ),
    },
    {
      title: "复古显示器",
      description: "scanline + noise 叠出 CRT 扫描线与胶片颗粒质感。",
      code: `<DarkVeil
  hueShift={200}
  scanlineIntensity={0.35}
  scanlineFrequency={1.6}
  noiseIntensity={0.04}
  speed={0.4}
/>`,
      render: () => (
        <Stage>
          <DarkVeil
            hueShift={200}
            scanlineIntensity={0.35}
            scanlineFrequency={1.6}
            noiseIntensity={0.04}
            speed={0.4}
          />
        </Stage>
      ),
    },
    {
      title: "壁纸级（省电）",
      description: "慢速 + resolutionScale 降采样省电，作内容承托背景。",
      code: `<DarkVeil hueShift={60} speed={0.25} resolutionScale={0.6} />`,
      render: () => (
        <Stage>
          <DarkVeil hueShift={60} speed={0.25} resolutionScale={0.6} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">深邃 · 克制 · 原生适配</p>
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "hueShift", type: "number", defaultValue: 0, label: "色相偏移 °" },
    { prop: "speed", type: "number", defaultValue: 0.5, label: "流动速度" },
    { prop: "warpAmount", type: "number", defaultValue: 0, label: "空间扭曲" },
    {
      prop: "scanlineIntensity",
      type: "number",
      defaultValue: 0,
      label: "扫描线强度",
    },
    {
      prop: "scanlineFrequency",
      type: "number",
      defaultValue: 0,
      label: "扫描线频率",
    },
    {
      prop: "noiseIntensity",
      type: "number",
      defaultValue: 0,
      label: "颗粒噪声",
    },
  ],

  states: [
    {
      name: "default（默认冷调帷幕）",
      render: () => (
        <Stage>
          <DarkVeil />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            DarkVeil
          </div>
        </Stage>
      ),
    },
    {
      name: "色相偏移 + 扭曲（暖紫波动）",
      render: () => (
        <Stage>
          <DarkVeil hueShift={120} warpAmount={0.08} speed={0.6} />
        </Stage>
      ),
    },
    {
      name: "复古显示器（扫描线 + 颗粒）",
      render: () => (
        <Stage>
          <DarkVeil
            hueShift={200}
            scanlineIntensity={0.35}
            scanlineFrequency={1.6}
            noiseIntensity={0.04}
            speed={0.4}
          />
        </Stage>
      ),
    },
    {
      name: "壁纸级（慢速 · 半分辨率省电）",
      render: () => (
        <Stage>
          <DarkVeil hueShift={60} speed={0.25} resolutionScale={0.6} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">深邃 · 克制 · 原生适配</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <DarkVeil
        hueShift={p.hueShift as number}
        speed={p.speed as number}
        warpAmount={p.warpAmount as number}
        scanlineIntensity={p.scanlineIntensity as number}
        scanlineFrequency={p.scanlineFrequency as number}
        noiseIntensity={p.noiseIntensity as number}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        DarkVeil
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 280)" }}>`,
      `  <DarkVeil`,
      `    hueShift={${p.hueShift}}`,
      `    speed={${p.speed}}`,
      `    warpAmount={${p.warpAmount}}`,
      `    scanlineIntensity={${p.scanlineIntensity}}`,
      `    scanlineFrequency={${p.scanlineFrequency}}`,
      `    noiseIntensity={${p.noiseIntensity}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
