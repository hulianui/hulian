"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Aurora } from "./aurora";

/** 展示用深色底容器，让极光效果清晰可见 */
function Stage({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: dark ? "oklch(0.14 0.02 255)" : "oklch(0.97 0.005 255)" }}
    >
      {children}
    </div>
  );
}

export const auroraShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative + overflow-hidden 容器，Aurora 以 absolute inset-0 铺底，children 自动层叠在极光之上。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Aurora className="absolute inset-0 opacity-80">
    <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
      Aurora
    </div>
  </Aurora>
</div>`,
      render: () => (
        <Stage>
          <Aurora className="absolute inset-0 opacity-80">
            <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
              Aurora
            </div>
          </Aurora>
        </Stage>
      ),
    },
    {
      title: "自定义色带",
      description: "通过 colors 传任意 CSS 颜色（支持 chart token / oklch），切换成暖橙调。",
      code: `<Aurora
  colors={["var(--color-chart-3)", "var(--color-chart-1)", "oklch(0.72 0.22 30)"]}
  blur={40}
  speed={25}
  className="absolute inset-0 opacity-75"
/>`,
      render: () => (
        <Stage>
          <Aurora
            colors={["var(--color-chart-3)", "var(--color-chart-1)", "oklch(0.72 0.22 30)"]}
            blur={40}
            speed={25}
            className="absolute inset-0 opacity-75"
          />
        </Stage>
      ),
    },
    {
      title: "模糊与速度",
      description: "blur 越大色带越柔，speed 越大动画越慢，组合出壁纸级的细腻流动。",
      code: `<Aurora blur={60} speed={45} className="absolute inset-0 opacity-90">
  <div className="flex h-full flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">瑚琏组件库</p>
    <p className="text-xs text-white/60">企业级 · 高质量 · 原生适配</p>
  </div>
</Aurora>`,
      render: () => (
        <Stage>
          <Aurora blur={60} speed={45} className="absolute inset-0 opacity-90">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-lg font-semibold text-white">瑚琏组件库</p>
              <p className="text-xs text-white/60">企业级 · 高质量 · 原生适配</p>
            </div>
          </Aurora>
        </Stage>
      ),
    },
    {
      title: "关闭径向 mask",
      description: "showRadialMask={false} 时极光铺满整个容器，不再向四角渐隐。",
      code: `<Aurora showRadialMask={false} className="absolute inset-0 opacity-70" />`,
      render: () => (
        <Stage>
          <Aurora showRadialMask={false} className="absolute inset-0 opacity-70" />
        </Stage>
      ),
    },
  ],
  controls: [
    { prop: "blur", type: "number", defaultValue: 30, label: "模糊半径 px" },
    { prop: "speed", type: "number", defaultValue: 20, label: "动画秒数" },
    {
      prop: "showRadialMask",
      type: "boolean",
      defaultValue: true,
      label: "径向 mask",
    },
  ],

  states: [
    {
      name: "default（深色底·默认参数）",
      render: () => (
        <Stage>
          <Aurora className="absolute inset-0 opacity-80">
            <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
              Aurora
            </div>
          </Aurora>
        </Stage>
      ),
    },
    {
      name: "浅色底",
      render: () => (
        <Stage dark={false}>
          <Aurora className="absolute inset-0 opacity-60" />
        </Stage>
      ),
    },
    {
      name: "自定义色带（暖橙调）",
      render: () => (
        <Stage>
          <Aurora
            colors={[
              "var(--color-chart-3)",
              "var(--color-chart-1)",
              "oklch(0.72 0.22 30)",
            ]}
            blur={40}
            speed={25}
            className="absolute inset-0 opacity-75"
          />
        </Stage>
      ),
    },
    {
      name: "无径向 mask（铺满）",
      render: () => (
        <Stage>
          <Aurora showRadialMask={false} className="absolute inset-0 opacity-70" />
        </Stage>
      ),
    },
    {
      name: "低速高模糊（壁纸级）",
      render: () => (
        <Stage>
          <Aurora blur={60} speed={45} className="absolute inset-0 opacity-90">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-lg font-semibold text-white">瑚琏组件库</p>
              <p className="text-xs text-white/60">企业级 · 高质量 · 原生适配</p>
            </div>
          </Aurora>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Aurora
        blur={p.blur as number}
        speed={p.speed as number}
        showRadialMask={p.showRadialMask as boolean}
        className="absolute inset-0 opacity-80"
      >
        <div className="flex h-full items-center justify-center text-sm text-white/70">
          Aurora
        </div>
      </Aurora>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <Aurora`,
      `    blur={${p.blur}}`,
      `    speed={${p.speed}}`,
      `    showRadialMask={${p.showRadialMask}}`,
      `    className="absolute inset-0 opacity-80"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
