"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BorderGlow } from "./border-glow";

/** 深色底容器，让边框发光清晰可见（指针靠近卡片边缘点亮）。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-64 w-full items-center justify-center rounded-xl p-12"
      style={{ background: "oklch(0.13 0.02 280)" }}
    >
      {children}
    </div>
  );
}

/** 卡片内部示意内容。 */
function CardBody({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="w-64 p-7">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-1.5 text-sm text-white/55">{desc}</p>
    </div>
  );
}

export const borderGlowShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "把指针移到卡片上，边框会沿光锥跟随点亮。需深色底烘托。",
      code: `<div
  className="rounded-xl p-12"
  style={{ background: "oklch(0.13 0.02 280)" }}
>
  <BorderGlow>
    <div className="w-64 p-7">
      <p className="text-base font-semibold text-white">瑚琏组件库</p>
      <p className="mt-1.5 text-sm text-white/55">把指针移到卡片上，边框会沿光锥点亮。</p>
    </div>
  </BorderGlow>
</div>`,
      render: () => (
        <Stage>
          <BorderGlow>
            <CardBody title="瑚琏组件库" desc="把指针移到卡片上，边框会沿光锥点亮。" />
          </BorderGlow>
        </Stage>
      ),
    },
    {
      title: "挂载自动扫光",
      description: "animated 时挂载即绕边扫一圈，无需指针；reduced-motion 下自动跳过。",
      code: `<BorderGlow animated>
  <div className="w-64 p-7">
    <p className="text-base font-semibold text-white">自动扫光</p>
    <p className="mt-1.5 text-sm text-white/55">挂载时自动绕边一圈。</p>
  </div>
</BorderGlow>`,
      render: () => (
        <Stage>
          <BorderGlow animated>
            <CardBody title="自动扫光" desc="挂载时自动绕边一圈，reduced-motion 下跳过。" />
          </BorderGlow>
        </Stage>
      ),
    },
    {
      title: "自定义发光色",
      description: "glowColor / colors 全走 chart token，自动吃明暗主题。",
      code: `<BorderGlow
  glowColor="var(--color-chart-2)"
  colors={[
    "var(--color-chart-2)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ]}
  glowRadius={56}
>
  <div className="w-64 p-7">
    <p className="text-base font-semibold text-white">青色霓虹</p>
  </div>
</BorderGlow>`,
      render: () => (
        <Stage>
          <BorderGlow
            glowColor="var(--color-chart-2)"
            colors={[
              "var(--color-chart-2)",
              "var(--color-chart-4)",
              "var(--color-chart-5)",
            ]}
            glowRadius={56}
          >
            <CardBody title="青色霓虹" desc="发光色 / 网格色全走 chart token。" />
          </BorderGlow>
        </Stage>
      ),
    },
    {
      title: "高灵敏 + 强光晕",
      description: "调小 edgeSensitivity 更早触发，调大 glowIntensity / coneSpread 加强高亮弧。",
      code: `<BorderGlow
  edgeSensitivity={10}
  glowIntensity={1.6}
  coneSpread={40}
>
  <div className="w-64 p-7">
    <p className="text-base font-semibold text-white">高能边框</p>
  </div>
</BorderGlow>`,
      render: () => (
        <Stage>
          <BorderGlow edgeSensitivity={10} glowIntensity={1.6} coneSpread={40}>
            <CardBody title="高能边框" desc="更早触发、更强光晕、更宽高亮弧。" />
          </BorderGlow>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "edgeSensitivity", type: "number", defaultValue: 30, label: "边缘灵敏度" },
    { prop: "glowRadius", type: "number", defaultValue: 40, label: "光晕半径 px" },
    { prop: "glowIntensity", type: "number", defaultValue: 1, label: "光晕强度" },
    { prop: "coneSpread", type: "number", defaultValue: 25, label: "光锥宽度" },
    { prop: "borderRadius", type: "number", defaultValue: 28, label: "圆角 px" },
    { prop: "animated", type: "boolean", defaultValue: false, label: "挂载扫光" },
  ],

  states: [
    {
      name: "default（移入卡片，沿指针点亮边框）",
      render: () => (
        <Stage>
          <BorderGlow>
            <CardBody title="瑚琏组件库" desc="把指针移到卡片上，边框会沿光锥点亮。" />
          </BorderGlow>
        </Stage>
      ),
    },
    {
      name: "挂载自动扫光（animated）",
      render: () => (
        <Stage>
          <BorderGlow animated>
            <CardBody title="自动扫光" desc="挂载时自动绕边一圈，reduced-motion 下跳过。" />
          </BorderGlow>
        </Stage>
      ),
    },
    {
      name: "自定义发光色（chart-2 青调）",
      render: () => (
        <Stage>
          <BorderGlow
            glowColor="var(--color-chart-2)"
            colors={[
              "var(--color-chart-2)",
              "var(--color-chart-4)",
              "var(--color-chart-5)",
            ]}
            glowRadius={56}
          >
            <CardBody title="青色霓虹" desc="发光色 / 网格色全走 chart token。" />
          </BorderGlow>
        </Stage>
      ),
    },
    {
      name: "高灵敏 + 强光晕",
      render: () => (
        <Stage>
          <BorderGlow edgeSensitivity={10} glowIntensity={1.6} coneSpread={40}>
            <CardBody title="高能边框" desc="更早触发、更强光晕、更宽高亮弧。" />
          </BorderGlow>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <BorderGlow
        edgeSensitivity={p.edgeSensitivity as number}
        glowRadius={p.glowRadius as number}
        glowIntensity={p.glowIntensity as number}
        coneSpread={p.coneSpread as number}
        borderRadius={p.borderRadius as number}
        animated={p.animated as boolean}
      >
        <CardBody title="瑚琏 BorderGlow" desc="移入或开启扫光查看发光边框。" />
      </BorderGlow>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="rounded-xl p-12" style={{ background: "oklch(0.13 0.02 280)" }}>`,
      `  <BorderGlow`,
      `    edgeSensitivity={${p.edgeSensitivity}}`,
      `    glowRadius={${p.glowRadius}}`,
      `    glowIntensity={${p.glowIntensity}}`,
      `    coneSpread={${p.coneSpread}}`,
      `    borderRadius={${p.borderRadius}}`,
      `    animated={${p.animated}}`,
      `  >`,
      `    <div className="w-64 p-7">…</div>`,
      `  </BorderGlow>`,
      `</div>`,
    ].join("\n"),
};
