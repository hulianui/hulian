"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GradualBlur } from "./gradual-blur";
import type { GradualBlurPosition } from "./gradual-blur.types";

/** 展示用舞台：带丰富纹理底，让贴边渐进模糊清晰可见 */
function Stage({
  children,
  position = "bottom",
}: {
  children: React.ReactNode;
  position?: GradualBlurPosition;
}) {
  const isHorizontal = position === "left" || position === "right";
  return (
    <div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface">
      {/* 底层纹理：多色斜条纹，被渐进模糊柔化才能看出效果 */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--color-chart-1) 0 18px, var(--color-chart-2) 18px 36px, var(--color-chart-4) 36px 54px)",
          opacity: 0.85,
        }}
      />
      {/* 文字内容，验证模糊作用于真实下层内容 */}
      <div
        className={
          isHorizontal
            ? "relative flex h-full items-center px-8"
            : "relative flex h-full flex-col justify-end p-6"
        }
      >
        <p className="text-2xl font-semibold text-foreground drop-shadow">
          瑚琏组件库
        </p>
        <p className="text-sm text-muted">企业级 · 高质量 · 渐进式模糊贴边</p>
      </div>
      {children}
    </div>
  );
}

export const gradualBlurShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "position",
      type: "select",
      options: ["top", "bottom", "left", "right"],
      defaultValue: "bottom",
      label: "贴边方向",
    },
    { prop: "strength", type: "number", defaultValue: 2, label: "模糊强度" },
    { prop: "divCount", type: "number", defaultValue: 5, label: "层数" },
    {
      prop: "exponential",
      type: "boolean",
      defaultValue: false,
      label: "指数递增",
    },
  ],

  states: [
    {
      name: "default（底部渐进模糊）",
      render: () => (
        <Stage position="bottom">
          <GradualBlur position="bottom" height="7rem" />
        </Stage>
      ),
    },
    {
      name: "顶部 · 强模糊指数递增",
      render: () => (
        <Stage position="top">
          <GradualBlur
            position="top"
            height="8rem"
            strength={4}
            divCount={8}
            exponential
          />
        </Stage>
      ),
    },
    {
      name: "右侧竖条 · bezier 曲线",
      render: () => (
        <Stage position="right">
          <GradualBlur
            position="right"
            width="9rem"
            strength={2.5}
            divCount={6}
            curve="bezier"
          />
        </Stage>
      ),
    },
    {
      name: "悬停增强（hover 进一步变糊）",
      render: () => (
        <Stage position="bottom">
          <GradualBlur
            position="bottom"
            height="7rem"
            strength={1.5}
            hoverIntensity={2}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage position={p.position as GradualBlurPosition}>
      <GradualBlur
        position={p.position as GradualBlurPosition}
        strength={p.strength as number}
        divCount={p.divCount as number}
        exponential={p.exponential as boolean}
        height="7rem"
        width="9rem"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl bg-surface">`,
      `  {/* …下层内容… */}`,
      `  <GradualBlur`,
      `    position="${p.position}"`,
      `    strength={${p.strength}}`,
      `    divCount={${p.divCount}}`,
      `    exponential={${p.exponential}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
