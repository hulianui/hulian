"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GridDistortion } from "./grid-distortion";

/** 深色底舞台，让网格扭曲效果清晰可见，并提示鼠标可交互 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
      <span className="pointer-events-none absolute bottom-2 right-3 z-10 text-[11px] text-white/40">
        移动鼠标扭曲网格
      </span>
    </div>
  );
}

export const gridDistortionShowcase: ShowcaseSpec = {
  controls: [
    { prop: "grid", type: "number", defaultValue: 15, label: "网格密度" },
    { prop: "mouse", type: "number", defaultValue: 0.1, label: "鼠标半径" },
    { prop: "strength", type: "number", defaultValue: 0.15, label: "扭曲强度" },
    { prop: "relaxation", type: "number", defaultValue: 0.9, label: "弛豫系数" },
  ],

  states: [
    {
      name: "default（程序化网格底纹·默认参数）",
      render: () => (
        <Stage>
          <GridDistortion />
        </Stage>
      ),
    },
    {
      name: "高密度 + 强扭曲",
      render: () => (
        <Stage>
          <GridDistortion grid={24} strength={0.3} mouse={0.18} />
        </Stage>
      ),
    },
    {
      name: "余韵长（高弛豫·涟漪不易散）",
      render: () => (
        <Stage>
          <GridDistortion relaxation={0.96} strength={0.2} />
        </Stage>
      ),
    },
    {
      name: "暖色底纹（自定义 color）",
      render: () => (
        <Stage>
          <GridDistortion color="oklch(0.72 0.22 30)" grid={18} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <GridDistortion
        grid={p.grid as number}
        mouse={p.mouse as number}
        strength={p.strength as number}
        relaxation={p.relaxation as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <GridDistortion`,
      `    grid={${p.grid}}`,
      `    mouse={${p.mouse}}`,
      `    strength={${p.strength}}`,
      `    relaxation={${p.relaxation}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
