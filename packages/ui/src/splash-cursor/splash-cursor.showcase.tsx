"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SplashCursor } from "./splash-cursor";

/** 深色舞台：让彩色溅射在暗底上清晰发光；自带提示文字。 */
function Stage({
  children,
  hint = "在此区域内移动 / 点击鼠标",
  dark = true,
}: {
  children: React.ReactNode;
  hint?: string;
  dark?: boolean;
}) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: dark ? "oklch(0.14 0.02 255)" : "oklch(0.97 0.005 255)" }}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <span
          className={
            dark
              ? "text-sm font-medium text-white/55"
              : "text-sm font-medium text-foreground/55"
          }
        >
          {hint}
        </span>
      </div>
    </div>
  );
}

export const splashCursorShowcase: ShowcaseSpec = {
  controls: [
    { prop: "rainbow", type: "boolean", defaultValue: true, label: "彩虹模式" },
    { prop: "splatRadius", type: "number", defaultValue: 56, label: "溅射半径 px" },
    { prop: "splatForce", type: "number", defaultValue: 1, label: "溅射力度" },
    { prop: "dissipation", type: "number", defaultValue: 0.92, label: "保留率 0-1" },
    { prop: "opacity", type: "number", defaultValue: 1, label: "不透明度" },
  ],

  states: [
    {
      name: "default（彩虹溅射）",
      render: () => (
        <Stage>
          <SplashCursor />
        </Stage>
      ),
    },
    {
      name: "固定主题色（chart token）",
      render: () => (
        <Stage hint="单色染料 · 吃 chart-1 token">
          <SplashCursor rainbow={false} />
        </Stage>
      ),
    },
    {
      name: "猛烈拖尾（高力度 + 慢消散）",
      render: () => (
        <Stage hint="快速划过看长拖尾">
          <SplashCursor splatForce={1.8} dissipation={0.97} splatRadius={72} />
        </Stage>
      ),
    },
    {
      name: "浅色底 · 柔和",
      render: () => (
        <Stage dark={false} hint="浅底也能叠色">
          <SplashCursor opacity={0.7} splatRadius={48} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <SplashCursor
        rainbow={p.rainbow as boolean}
        splatRadius={p.splatRadius as number}
        splatForce={p.splatForce as number}
        dissipation={p.dissipation as number}
        opacity={p.opacity as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <SplashCursor`,
      `    rainbow={${p.rainbow}}`,
      `    splatRadius={${p.splatRadius}}`,
      `    splatForce={${p.splatForce}}`,
      `    dissipation={${p.dissipation}}`,
      `    opacity={${p.opacity}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
