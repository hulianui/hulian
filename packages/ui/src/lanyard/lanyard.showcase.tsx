"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Lanyard } from "./lanyard";

/** 展示用舞台：固定高度 + 中性深底，让挂绳与工牌的摆动清晰可见。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-80 w-full max-w-md overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const lanyardShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "放进 relative 定位容器，组件自带占位工牌——拖一下放手看物理回弹摆动。",
      code: `<div
  className="relative h-80 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.16 0.02 255)" }}
>
  <Lanyard className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <Lanyard className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "自定义工牌内容",
      description: "传 children 替换占位工牌，挂绳物理与拖拽行为保持不变。",
      code: `<Lanyard className="absolute inset-0">
  <div className="w-44 rounded-xl border border-border bg-surface p-4 text-center shadow-lg">
    <div className="mx-auto mb-3 size-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/5" />
    <p className="text-sm font-semibold text-foreground">林屿</p>
    <p className="mt-0.5 text-xs text-muted">前端工程师 · No.0421</p>
  </div>
</Lanyard>`,
      render: () => (
        <Stage>
          <Lanyard className="absolute inset-0">
            <div className="w-44 rounded-xl border border-border bg-surface p-4 text-center shadow-lg">
              <div className="mx-auto mb-3 size-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/5" />
              <p className="text-sm font-semibold text-foreground">林屿</p>
              <p className="mt-0.5 text-xs text-muted">前端工程师 · No.0421</p>
            </div>
          </Lanyard>
        </Stage>
      ),
    },
    {
      title: "绵软余摆",
      description: "长绳 + 低 stiffness + 高 damping，松手后余摆更久更软。",
      code: `<Lanyard
  className="absolute inset-0"
  ropeLength={160}
  stiffness={0.025}
  damping={0.965}
  title="慢摇工牌"
  subtitle="拖一下放手看余摆"
/>`,
      render: () => (
        <Stage>
          <Lanyard
            className="absolute inset-0"
            ropeLength={160}
            stiffness={0.025}
            damping={0.965}
            title="慢摇工牌"
            subtitle="拖一下放手看余摆"
          />
        </Stage>
      ),
    },
    {
      title: "自定义绳色",
      description: "ropeColor 接受任意 CSS 颜色（token 须带 --color- 前缀）。",
      code: `<Lanyard
  className="absolute inset-0"
  ropeColor="oklch(0.72 0.2 45)"
  title="VIP"
  subtitle="橙色挂绳"
/>`,
      render: () => (
        <Stage>
          <Lanyard
            className="absolute inset-0"
            ropeColor="oklch(0.72 0.2 45)"
            title="VIP"
            subtitle="橙色挂绳"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "ropeLength", type: "number", defaultValue: 120, label: "挂绳长度 px" },
    { prop: "stiffness", type: "number", defaultValue: 0.045, label: "回弹刚度" },
    { prop: "damping", type: "number", defaultValue: 0.92, label: "阻尼系数" },
  ],

  states: [
    {
      name: "default（默认占位工牌·可拖拽）",
      render: () => (
        <Stage>
          <Lanyard className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "自定义工牌内容",
      render: () => (
        <Stage>
          <Lanyard className="absolute inset-0">
            <div className="w-44 rounded-xl border border-border bg-surface p-4 text-center shadow-lg">
              <div className="mx-auto mb-3 size-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/5" />
              <p className="text-sm font-semibold text-foreground">林屿</p>
              <p className="mt-0.5 text-xs text-muted">前端工程师 · No.0421</p>
            </div>
          </Lanyard>
        </Stage>
      ),
    },
    {
      name: "长绳·绵软余摆（低刚度高阻尼）",
      render: () => (
        <Stage>
          <Lanyard
            className="absolute inset-0"
            ropeLength={160}
            stiffness={0.025}
            damping={0.965}
            title="慢摇工牌"
            subtitle="拖一下放手看余摆"
          />
        </Stage>
      ),
    },
    {
      name: "自定义绳色（暖橙）",
      render: () => (
        <Stage>
          <Lanyard
            className="absolute inset-0"
            ropeColor="oklch(0.72 0.2 45)"
            title="VIP"
            subtitle="橙色挂绳"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Lanyard
        className="absolute inset-0"
        ropeLength={p.ropeLength as number}
        stiffness={p.stiffness as number}
        damping={p.damping as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-80 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
      `  <Lanyard`,
      `    className="absolute inset-0"`,
      `    ropeLength={${p.ropeLength}}`,
      `    stiffness={${p.stiffness}}`,
      `    damping={${p.damping}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
