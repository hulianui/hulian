"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Prism } from "./prism";
import type { PrismAnimationType } from "./prism.types";

/**
 * 演示舞台：深色容器，让棱镜分光辉光充分展现。
 * 组件假定放在 relative 容器内；自带 absolute inset-0 z-0。
 */
function Stage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 ${className}`}
      style={{ background: "oklch(0.11 0.02 275)" }}
    >
      {children}
    </div>
  );
}

export const prismShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放在 relative overflow-hidden 容器里，组件自带 absolute inset-0 z-0；内容用 relative z-10 叠在上层。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.11 0.02 275)" }}>
  <Prism />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">Prism</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <Prism />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-2xl font-bold text-white/90">Prism</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "动画模式",
      description:
        "animationType 三选一：rotate（呼吸摆动）/ 3drotate（三维旋转）/ hover（跟随指针）。",
      code: `<Prism animationType="3drotate" glow={1.2} />`,
      render: () => (
        <Stage>
          <Prism animationType="3drotate" glow={1.2} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">3D 旋转</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "高辉光·纯净",
      description: "glow 提亮体积光、noise=0 去掉胶片颗粒，得到干净通透的分光。",
      code: `<Prism animationType="3drotate" glow={1.6} bloom={1.3} noise={0} />`,
      render: () => (
        <Stage>
          <Prism animationType="3drotate" glow={1.6} bloom={1.3} noise={0} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">高辉光 · 纯净</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "产品 Hero",
      description:
        "用 offset 把棱镜上移避让标题，叠一层顶部光晕，做成营销首屏的装饰背景。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.09 0.025 270)" }}>
  <Prism
    animationType="3drotate"
    glow={1.3}
    scale={4.2}
    offset={{ x: 0, y: -40 }}
    colorFrequency={1.2}
  />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-8">
    <h1 className="text-3xl font-bold text-white">一束光，折出整个光谱</h1>
    <p className="text-sm text-white/50">企业级组件库 · WebGL 装饰背景</p>
  </div>
</div>`,
      render: () => (
        <div
          className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10"
          style={{ background: "oklch(0.09 0.025 270)" }}
        >
          <Prism
            animationType="3drotate"
            glow={1.3}
            scale={4.2}
            offset={{ x: 0, y: -40 }}
            colorFrequency={1.2}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,oklch(0.7_0.2_280/0.3),transparent)]" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-8">
            <h1 className="text-center text-3xl font-bold tracking-tight text-white">
              一束光，折出整个光谱
            </h1>
            <p className="text-center text-sm text-white/50">
              企业级组件库 · WebGL 装饰背景
            </p>
          </div>
        </div>
      ),
    },
  ],

  controls: [
    {
      prop: "animationType",
      type: "select",
      defaultValue: "rotate",
      options: ["rotate", "3drotate", "hover"],
      label: "动画模式",
    },
    { prop: "glow", type: "number", defaultValue: 1, label: "辉光强度" },
    { prop: "scale", type: "number", defaultValue: 3.6, label: "缩放" },
    { prop: "noise", type: "number", defaultValue: 0.5, label: "颗粒强度" },
    { prop: "timeScale", type: "number", defaultValue: 0.5, label: "时间速度" },
  ],

  states: [
    {
      name: "default（rotate·呼吸摆动·主题色相）",
      render: () => (
        <Stage>
          <Prism />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">Prism</p>
            <p className="text-sm text-white/50">棱镜分光 WebGL 背景</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "3drotate（三维旋转）",
      render: () => (
        <Stage>
          <Prism animationType="3drotate" glow={1.2} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">3D 旋转</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "hover（跟随指针·移动鼠标试试）",
      render: () => (
        <Stage>
          <Prism animationType="hover" hoverStrength={2.4} inertia={0.06} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">指针跟随</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "高辉光·无颗粒（glow=1.6·noise=0）",
      render: () => (
        <Stage>
          <Prism animationType="3drotate" glow={1.6} bloom={1.3} noise={0} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">高辉光 · 纯净</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "产品 Hero（棱镜偏置 + 顶光晕）",
      render: () => (
        <div
          className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10"
          style={{ background: "oklch(0.09 0.025 270)" }}
        >
          <Prism
            animationType="3drotate"
            glow={1.3}
            scale={4.2}
            offset={{ x: 0, y: -40 }}
            colorFrequency={1.2}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,oklch(0.7_0.2_280/0.3),transparent)]" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-8">
            <span className="text-xs font-medium uppercase tracking-widest text-white/40">
              Hulian UI
            </span>
            <h1 className="text-center text-3xl font-bold tracking-tight text-white">
              一束光，折出整个光谱
            </h1>
            <p className="text-center text-sm text-white/50">
              企业级组件库 · WebGL 装饰背景 · 主题色相自适应
            </p>
          </div>
        </div>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Prism
        animationType={p.animationType as PrismAnimationType}
        glow={p.glow as number}
        scale={p.scale as number}
        noise={p.noise as number}
        timeScale={p.timeScale as number}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">Prism · WebGL 背景</p>
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.11 0.02 275)" }}>`,
      `  <Prism`,
      `    animationType="${p.animationType}"`,
      `    glow={${p.glow}}`,
      `    scale={${p.scale}}`,
      `    noise={${p.noise}}`,
      `    timeScale={${p.timeScale}}`,
      `  />`,
      `  <div className="relative z-10">内容</div>`,
      `</div>`,
    ].join("\n"),
};
