"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Lightning } from "./lightning";

/** 深色舞台：黑底让闪电辉光充分展现。组件自带 absolute inset-0 z-0。 */
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
      style={{ background: "oklch(0.10 0.02 265)" }}
    >
      {children}
    </div>
  );
}

export const lightningShowcase: ShowcaseSpec = {
  controls: [
    { prop: "hue",       type: "number", defaultValue: 230, label: "色相（0–360，留色为空时生效）" },
    { prop: "speed",     type: "number", defaultValue: 1,   label: "速度" },
    { prop: "intensity", type: "number", defaultValue: 1,   label: "辉度强度" },
    { prop: "size",      type: "number", defaultValue: 1,   label: "噪声尺度" },
    { prop: "xOffset",   type: "number", defaultValue: 0,   label: "水平偏移" },
    { prop: "color",     type: "text",   defaultValue: "",  label: "自定义色（留空=按色相）" },
  ],

  states: [
    {
      name: "default（蓝紫色相 230）",
      render: () => (
        <Stage>
          <Lightning />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">Lightning</p>
            <p className="text-sm text-white/50">fbm 噪声电弧背景</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "暖橙色相（hue=30·高强度）",
      render: () => (
        <Stage>
          <Lightning hue={30} intensity={1.4} speed={1.3} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">hue = 30</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "吃 chart token（color=var(--color-chart-1)）",
      render: () => (
        <Stage>
          <Lightning color="var(--color-chart-1)" intensity={1.2} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">token 取色 · 明暗自适应</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "细密慢电（size=1.6·speed=0.6）",
      render: () => (
        <Stage>
          <Lightning size={1.6} speed={0.6} hue={280} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-violet-200/80">size=1.6 · speed=0.6</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Lightning
        hue={p.hue as number}
        speed={p.speed as number}
        intensity={p.intensity as number}
        size={p.size as number}
        xOffset={p.xOffset as number}
        color={(p.color as string) || undefined}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">Lightning · WebGL 背景</p>
      </div>
    </Stage>
  ),

  toCode: (p) => {
    const colorLine = p.color ? `\n    color="${p.color}"` : "";
    return [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.10 0.02 265)" }}>`,
      `  <Lightning`,
      `    hue={${p.hue}}`,
      `    speed={${p.speed}}`,
      `    intensity={${p.intensity}}`,
      `    size={${p.size}}`,
      `    xOffset={${p.xOffset}}${colorLine}`,
      `  />`,
      `  <div className="relative z-10">内容</div>`,
      `</div>`,
    ].join("\n");
  },
};
