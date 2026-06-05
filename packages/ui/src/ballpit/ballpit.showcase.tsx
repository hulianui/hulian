"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Ballpit } from "./ballpit";

/** 展示用深色底容器，让彩色小球清晰可见 */
function Stage({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: dark ? "oklch(0.14 0.02 255)" : "oklch(0.97 0.005 255)" }}
    >
      {children}
    </div>
  );
}

export const ballpitShowcase: ShowcaseSpec = {
  controls: [
    { prop: "count", type: "number", defaultValue: 80, label: "小球数量" },
    { prop: "gravity", type: "number", defaultValue: 900, label: "重力" },
    { prop: "bounce", type: "number", defaultValue: 0.86, label: "弹性 0–1" },
    { prop: "followCursor", type: "boolean", defaultValue: true, label: "跟随光标" },
  ],

  states: [
    {
      name: "default（深色底·默认参数·移动光标试试）",
      render: () => (
        <Stage>
          <Ballpit />
          <div className="pointer-events-none relative z-10 flex h-full items-end justify-center pb-4 text-sm font-medium text-white/70">
            移动光标推开小球
          </div>
        </Stage>
      ),
    },
    {
      name: "失重漂浮（gravity=0）",
      render: () => (
        <Stage>
          <Ballpit gravity={0} bounce={1} count={60} />
        </Stage>
      ),
    },
    {
      name: "大球少量（壁纸级）",
      render: () => (
        <Stage>
          <Ballpit count={28} sizeRange={[24, 44]} gravity={700} />
        </Stage>
      ),
    },
    {
      name: "纯背景（不跟光标·浅色底）",
      render: () => (
        <Stage dark={false}>
          <Ballpit followCursor={false} count={100} sizeRange={[8, 18]} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Ballpit
        count={p.count as number}
        gravity={p.gravity as number}
        bounce={p.bounce as number}
        followCursor={p.followCursor as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <Ballpit`,
      `    count={${p.count}}`,
      `    gravity={${p.gravity}}`,
      `    bounce={${p.bounce}}`,
      `    followCursor={${p.followCursor}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
