"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Silk } from "./silk";

/**
 * 演示舞台：深色容器，让丝绸效果充分展现。
 * 组件假定放在 relative 容器内；自带 absolute inset-0 z-0。
 */
function Stage({
  children,
  dark = true,
  className = "",
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 ${className}`}
      style={{
        background: dark ? "oklch(0.12 0.02 270)" : "oklch(0.96 0.005 270)",
      }}
    >
      {children}
    </div>
  );
}

export const silkShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative 容器，Silk 自带 absolute inset-0 z-0；内容用 relative z-10 层叠在丝绸之上。默认吃 chart-1 token。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
    <p className="text-2xl font-bold tracking-tight text-white/90">Silk</p>
    <p className="text-sm text-white/50">丝绸流动 WebGL 背景</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <Silk />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold tracking-tight text-white/90">Silk</p>
            <p className="text-sm text-white/50">丝绸流动 WebGL 背景</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "速度与缩放",
      description: "speed 控制流动快慢，scale 控制纹理密度，低速大 scale 更细腻。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk speed={2} scale={1.5} />
</div>`,
      render: () => (
        <Stage>
          <Silk speed={2} scale={1.5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">speed=2 · scale=1.5</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义颜色",
      description: "color 接受任意 CSS 颜色（hex / oklch / rgb），定制丝绸主色调。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk color="oklch(0.78 0.18 55)" speed={4} scale={1.2} />
</div>`,
      render: () => (
        <Stage>
          <Silk color="oklch(0.78 0.18 55)" speed={4} scale={1.2} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">暖金丝绸</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "颗粒强度",
      description: "noiseIntensity 控制颗粒质感，0 为纯净丝绸，调高获得磨砂胶片感。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk noiseIntensity={0} speed={5} />
</div>`,
      render: () => (
        <Stage>
          <Silk noiseIntensity={0} speed={5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">纯净丝绸（无颗粒）</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "纹理旋转",
      description: "rotation（弧度）旋转丝绸纹理方向，Math.PI / 4 即 45° 斜向。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk rotation={Math.PI / 4} speed={4} />
</div>`,
      render: () => (
        <Stage>
          <Silk rotation={Math.PI / 4} speed={4} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">rotation = π/4</p>
          </div>
        </Stage>
      ),
    },
  ],
  controls: [
    { prop: "speed",          type: "number",  defaultValue: 5,    label: "速度" },
    { prop: "scale",          type: "number",  defaultValue: 1,    label: "缩放" },
    { prop: "noiseIntensity", type: "number",  defaultValue: 1.5,  label: "颗粒强度" },
    { prop: "rotation",       type: "number",  defaultValue: 0,    label: "旋转（弧度）" },
    { prop: "color",          type: "text",    defaultValue: "",   label: "自定义色（留空=chart-1）" },
  ],

  states: [
    {
      name: "default（深色底·chart-1 token）",
      render: () => (
        <Stage>
          <Silk />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold tracking-tight text-white/90">Silk</p>
            <p className="text-sm text-white/50">丝绸流动 WebGL 背景</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "高速流动（speed=12）",
      render: () => (
        <Stage>
          <Silk speed={12} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">speed = 12</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "低速·细腻（speed=2·scale=1.5）",
      render: () => (
        <Stage>
          <Silk speed={2} scale={1.5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">speed=2 · scale=1.5</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "自定义暖金色",
      render: () => (
        <Stage>
          <Silk color="oklch(0.78 0.18 55)" speed={4} scale={1.2} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">暖金丝绸</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "自定义极光蓝紫",
      render: () => (
        <Stage>
          <Silk color="oklch(0.65 0.28 285)" speed={3} noiseIntensity={2} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-violet-200/80">极光蓝紫</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "45°旋转（rotation=π/4）",
      render: () => (
        <Stage>
          <Silk rotation={Math.PI / 4} speed={4} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">rotation = π/4</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "无颗粒（noiseIntensity=0）",
      render: () => (
        <Stage>
          <Silk noiseIntensity={0} speed={5} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">纯净丝绸（无颗粒）</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "高颗粒（noiseIntensity=4）",
      render: () => (
        <Stage>
          <Silk noiseIntensity={4} speed={3} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">高颗粒质感</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "作品详情 Hero（码尺 Codemarker）",
      render: () => (
        <div
          className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10"
          style={{ background: "oklch(0.10 0.025 265)" }}
        >
          <Silk speed={3} scale={1.1} color="oklch(0.58 0.22 280)" noiseIntensity={1.2} />
          {/* 顶部徽标光晕 */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.65_0.22_280/0.35),transparent)]" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white backdrop-blur-sm">
                CM
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                Codemarker
              </span>
            </div>
            <h1 className="text-center text-3xl font-bold tracking-tight text-white">
              码尺・代码度量平台
            </h1>
            <p className="text-center text-sm leading-relaxed text-white/50">
              可视化代码质量 · 智能追踪技术债 · 团队效能洞察
            </p>
          </div>
        </div>
      ),
    },
    {
      name: "浅色底（亮色主题）",
      render: () => (
        <Stage dark={false}>
          <Silk speed={4} color="oklch(0.55 0.2 270)" noiseIntensity={1.0} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-neutral-700">浅色底 · 自定义色</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Silk
        speed={p.speed as number}
        scale={p.scale as number}
        noiseIntensity={p.noiseIntensity as number}
        rotation={p.rotation as number}
        color={(p.color as string) || undefined}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">Silk · WebGL 背景</p>
      </div>
    </Stage>
  ),

  toCode: (p) => {
    const colorLine = p.color ? `\n    color="${p.color}"` : "";
    return [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 270)" }}>`,
      `  <Silk`,
      `    speed={${p.speed}}`,
      `    scale={${p.scale}}`,
      `    noiseIntensity={${p.noiseIntensity}}`,
      `    rotation={${p.rotation}}${colorLine}`,
      `  />`,
      `  <div className="relative z-10">内容</div>`,
      `</div>`,
    ].join("\n");
  },
};
