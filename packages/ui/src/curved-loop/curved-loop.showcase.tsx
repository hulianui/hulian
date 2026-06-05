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
