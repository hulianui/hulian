"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ClickSpark } from "./click-spark";

/** 展示用容器：固定尺寸 + 提示文案，鼠标点击区域内任意处迸发火花。 */
function Stage({
  children,
  dark = false,
}: {
  children?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className="relative h-56 w-full max-w-xl cursor-pointer select-none overflow-hidden rounded-xl border border-border"
      style={
        dark
          ? { background: "oklch(0.16 0.02 255)" }
          : { background: "var(--color-surface)" }
      }
    >
      {children}
    </div>
  );
}

const Hint = ({ light = false }: { light?: boolean }) => (
  <div className="pointer-events-none flex h-full items-center justify-center">
    <span
      className={
        light
          ? "text-sm font-medium text-white/70"
          : "text-sm font-medium text-muted"
      }
    >
      点击此处放射火花
    </span>
  </div>
);

export const clickSparkShowcase: ShowcaseSpec = {
  controls: [
    { prop: "sparkCount", type: "number", defaultValue: 8, label: "火花数量" },
    { prop: "sparkSize", type: "number", defaultValue: 10, label: "线段长度 px" },
    { prop: "sparkRadius", type: "number", defaultValue: 15, label: "飞散半径 px" },
    { prop: "duration", type: "number", defaultValue: 400, label: "时长 ms" },
    {
      prop: "easing",
      type: "select",
      options: ["ease-out", "ease-in", "ease-in-out", "linear"],
      defaultValue: "ease-out",
      label: "缓动",
    },
  ],

  states: [
    {
      name: "default（前景色火花·默认参数）",
      render: () => (
        <Stage>
          <ClickSpark className="absolute inset-0">
            <Hint />
          </ClickSpark>
        </Stage>
      ),
    },
    {
      name: "深色底 + 暖橙火花",
      render: () => (
        <Stage dark>
          <ClickSpark
            sparkColor="var(--color-chart-3)"
            sparkCount={12}
            sparkRadius={22}
            className="absolute inset-0"
          >
            <Hint light />
          </ClickSpark>
        </Stage>
      ),
    },
    {
      name: "大爆发（长线段·慢缓动）",
      render: () => (
        <Stage dark>
          <ClickSpark
            sparkColor="var(--color-chart-1)"
            sparkCount={16}
            sparkSize={18}
            sparkRadius={36}
            duration={700}
            easing="ease-in-out"
            extraScale={1.2}
            className="absolute inset-0"
          >
            <Hint light />
          </ClickSpark>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ClickSpark
        sparkCount={p.sparkCount as number}
        sparkSize={p.sparkSize as number}
        sparkRadius={p.sparkRadius as number}
        duration={p.duration as number}
        easing={p.easing as "ease-out" | "ease-in" | "ease-in-out" | "linear"}
        className="absolute inset-0"
      >
        <Hint />
      </ClickSpark>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 cursor-pointer overflow-hidden rounded-xl border border-border">`,
      `  <ClickSpark`,
      `    sparkCount={${p.sparkCount}}`,
      `    sparkSize={${p.sparkSize}}`,
      `    sparkRadius={${p.sparkRadius}}`,
      `    duration={${p.duration}}`,
      `    easing="${p.easing}"`,
      `    className="absolute inset-0"`,
      `  >`,
      `    {/* 你的内容 */}`,
      `  </ClickSpark>`,
      `</div>`,
    ].join("\n"),
};
