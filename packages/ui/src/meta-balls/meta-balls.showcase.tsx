"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MetaBalls } from "./meta-balls";

/** 展示用深色底容器，让发光黏液球清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const metaBallsShowcase: ShowcaseSpec = {
  controls: [
    { prop: "speed", type: "number", defaultValue: 0.3, label: "速度倍率" },
    { prop: "ballCount", type: "number", defaultValue: 15, label: "小球数量" },
    { prop: "animationSize", type: "number", defaultValue: 30, label: "观察尺度" },
    { prop: "clumpFactor", type: "number", defaultValue: 1, label: "聚拢因子" },
    {
      prop: "enableMouseInteraction",
      type: "boolean",
      defaultValue: true,
      label: "鼠标交互",
    },
  ],

  states: [
    {
      name: "default（深色底·默认参数）",
      render: () => (
        <Stage>
          <MetaBalls className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "密集抱团（多球 + 小聚拢因子）",
      render: () => (
        <Stage>
          <MetaBalls
            className="absolute inset-0"
            ballCount={28}
            clumpFactor={0.7}
            speed={0.5}
          />
        </Stage>
      ),
    },
    {
      name: "暖色混调（chart-3 + chart-5）",
      render: () => (
        <Stage>
          <MetaBalls
            className="absolute inset-0"
            color="var(--color-chart-3)"
            cursorBallColor="var(--color-chart-5)"
            animationSize={40}
          />
        </Stage>
      ),
    },
    {
      name: "自动巡游（关闭鼠标交互）",
      render: () => (
        <Stage>
          <MetaBalls
            className="absolute inset-0"
            enableMouseInteraction={false}
            speed={0.25}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <MetaBalls
        className="absolute inset-0"
        speed={p.speed as number}
        ballCount={p.ballCount as number}
        animationSize={p.animationSize as number}
        clumpFactor={p.clumpFactor as number}
        enableMouseInteraction={p.enableMouseInteraction as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <MetaBalls`,
      `    className="absolute inset-0"`,
      `    speed={${p.speed}}`,
      `    ballCount={${p.ballCount}}`,
      `    animationSize={${p.animationSize}}`,
      `    clumpFactor={${p.clumpFactor}}`,
      `    enableMouseInteraction={${p.enableMouseInteraction}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
