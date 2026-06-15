"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CurvedLoop } from "./curved-loop";

/** 深色底容器，让弧线文字清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-44 w-full max-w-2xl items-center overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const curvedLoopShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "文案沿二次贝塞尔曲线无缝循环滚动，默认向下弯、向左滚，可拖拽拨动。",
      code: `<div className="flex h-44 items-center overflow-hidden rounded-xl">
  <CurvedLoop text="瑚琏 · HULIAN · " className="text-white" />
</div>`,
      render: () => (
        <Stage>
          <CurvedLoop text="瑚琏 · HULIAN · " className="text-white" />
        </Stage>
      ),
    },
    {
      title: "向上弯曲",
      description: "curveAmount 传负值令曲线向上凸（正值向下凹，0 近似直线）。",
      code: `<CurvedLoop text="ENTERPRISE UI · " curveAmount={-220} />`,
      render: () => (
        <Stage>
          <CurvedLoop
            text="ENTERPRISE UI · "
            curveAmount={-220}
            className="text-[var(--color-chart-1)]"
          />
        </Stage>
      ),
    },
    {
      title: "右滚 · 高速",
      description: "direction=\"right\" 反向滚动，speed 调大加快。",
      code: `<CurvedLoop text="瑚琏组件库 · " direction="right" speed={4} />`,
      render: () => (
        <Stage>
          <CurvedLoop
            text="瑚琏组件库 · "
            direction="right"
            speed={4}
            className="text-[var(--color-chart-2)]"
          />
        </Stage>
      ),
    },
    {
      title: "纯展示（禁拖拽）",
      description: "interactive={false} 关闭拖拽交互，仅自动滚动。",
      code: `<CurvedLoop text="HULIAN UI · " interactive={false} />`,
      render: () => (
        <Stage>
          <CurvedLoop text="HULIAN UI · " interactive={false} className="text-white/80" />
        </Stage>
      ),
    },
  ],
  controls: [
    { prop: "text", type: "text", defaultValue: "瑚琏 · HULIAN · ", label: "文案" },
    { prop: "speed", type: "number", defaultValue: 2, label: "速度 px/帧" },
    { prop: "curveAmount", type: "number", defaultValue: 320, label: "弯曲量" },
    {
      prop: "direction",
      type: "select",
      options: ["left", "right"],
      defaultValue: "left",
      label: "方向",
    },
    { prop: "interactive", type: "boolean", defaultValue: true, label: "可拖拽" },
  ],

  states: [
    {
      name: "default（向下弯·左滚）",
      render: () => (
        <Stage>
          <CurvedLoop text="瑚琏 · HULIAN · " className="text-white" />
        </Stage>
      ),
    },
    {
      name: "向上弯（curveAmount 负值）",
      render: () => (
        <Stage>
          <CurvedLoop
            text="ENTERPRISE UI · "
            curveAmount={-220}
            className="text-[var(--color-chart-1)]"
          />
        </Stage>
      ),
    },
    {
      name: "右滚 + 高速",
      render: () => (
        <Stage>
          <CurvedLoop
            text="瑚琏组件库 · "
            direction="right"
            speed={4}
            className="text-[var(--color-chart-2)]"
          />
        </Stage>
      ),
    },
    {
      name: "不可拖拽（纯展示）",
      render: () => (
        <Stage>
          <CurvedLoop text="HULIAN UI · " interactive={false} className="text-white/80" />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <CurvedLoop
        text={p.text as string}
        speed={p.speed as number}
        curveAmount={p.curveAmount as number}
        direction={p.direction as "left" | "right"}
        interactive={p.interactive as boolean}
        className="text-white"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="flex h-44 items-center overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <CurvedLoop`,
      `    text=${JSON.stringify(p.text)}`,
      `    speed={${p.speed}}`,
      `    curveAmount={${p.curveAmount}}`,
      `    direction="${p.direction}"`,
      `    interactive={${p.interactive}}`,
      `    className="text-white"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
