"use client";
import type { CSSProperties } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ModelViewer } from "./model-viewer";

/** 展示用深色舞台底，让 3D 模型与接触阴影清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl">
      <div
        className="overflow-hidden rounded-xl"
        style={{ background: "oklch(0.16 0.02 255)" }}
      >
        {children}
      </div>
    </div>
  );
}

/** 一个有体积感的「模型」占位：多层立方面 + 主色高光，纯 CSS 3D */
function Cube({ size = 120 }: { size?: number }) {
  const face: CSSProperties = {
    position: "absolute",
    inset: 0,
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
  };
  return (
    <div
      className="[transform-style:preserve-3d]"
      style={{ width: size, height: size, position: "relative" }}
    >
      <div
        style={{
          ...face,
          background:
            "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-4))",
          transform: `translateZ(${size / 2}px)`,
          boxShadow: "0 0 32px var(--color-chart-1)",
        }}
      >
        <span className="text-2xl font-semibold text-white">瑚</span>
      </div>
      <div
        style={{
          ...face,
          background: "var(--color-surface)",
          transform: `rotateY(90deg) translateZ(${size / 2}px)`,
        }}
      />
      <div
        style={{
          ...face,
          background: "var(--color-surface)",
          transform: `rotateX(90deg) translateZ(${size / 2}px)`,
        }}
      />
    </div>
  );
}

export const modelViewerShowcase: ShowcaseSpec = {
  controls: [
    { prop: "autoRotate", type: "boolean", defaultValue: false, label: "自动旋转" },
    {
      prop: "autoRotateSpeed",
      type: "number",
      defaultValue: 24,
      label: "自转速度 °/s",
    },
    {
      prop: "enableMouseParallax",
      type: "boolean",
      defaultValue: true,
      label: "鼠标视差",
    },
    {
      prop: "enableHoverRotation",
      type: "boolean",
      defaultValue: true,
      label: "悬停倾斜",
    },
    {
      prop: "showContactShadow",
      type: "boolean",
      defaultValue: true,
      label: "接触阴影",
    },
  ],

  states: [
    {
      name: "default（拖拽旋转 + 视差 + 悬停倾斜）",
      render: () => (
        <Stage>
          <ModelViewer height={320}>
            <Cube />
          </ModelViewer>
        </Stage>
      ),
    },
    {
      name: "自动旋转",
      render: () => (
        <Stage>
          <ModelViewer height={320} autoRotate autoRotateSpeed={28}>
            <Cube />
          </ModelViewer>
        </Stage>
      ),
    },
    {
      name: "极简（关掉所有交互辅助，仅拖拽）",
      render: () => (
        <Stage>
          <ModelViewer
            height={300}
            enableMouseParallax={false}
            enableHoverRotation={false}
            showContactShadow={false}
            showResetButton={false}
          >
            <div
              className="grid size-32 place-items-center rounded-2xl text-4xl font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-chart-2), var(--color-chart-5))",
                transform: "translateZ(40px)",
              }}
            >
              UI
            </div>
          </ModelViewer>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ModelViewer
        height={320}
        autoRotate={p.autoRotate as boolean}
        autoRotateSpeed={p.autoRotateSpeed as number}
        enableMouseParallax={p.enableMouseParallax as boolean}
        enableHoverRotation={p.enableHoverRotation as boolean}
        showContactShadow={p.showContactShadow as boolean}
      >
        <Cube />
      </ModelViewer>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
      `  <ModelViewer`,
      `    height={320}`,
      `    autoRotate={${p.autoRotate}}`,
      `    autoRotateSpeed={${p.autoRotateSpeed}}`,
      `    enableMouseParallax={${p.enableMouseParallax}}`,
      `    enableHoverRotation={${p.enableHoverRotation}}`,
      `    showContactShadow={${p.showContactShadow}}`,
      `  >`,
      `    {/* 任意 children 作为「模型」 */}`,
      `    <YourModel />`,
      `  </ModelViewer>`,
      `</div>`,
    ].join("\n"),
};
