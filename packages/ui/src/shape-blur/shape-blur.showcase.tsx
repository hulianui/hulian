"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ShapeBlur } from "./shape-blur";
import type { ShapeBlurVariation } from "./shape-blur.types";

/**
 * 演示舞台：深色容器（提示用户移动鼠标揭示形状高光）。
 * 组件假定放在 relative 容器内；自带 absolute inset-0 z-0。
 */
function Stage({
  children,
  hint = "移动鼠标揭示形状",
  className = "",
}: {
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 ${className}`}
      style={{ background: "oklch(0.13 0.02 270)" }}
    >
      {children}
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-xs text-white/35">
        {hint}
      </p>
    </div>
  );
}

const VARIATIONS: ShapeBlurVariation[] = [
  "round-rect",
  "circle-fill",
  "circle-stroke",
  "triangle",
];

export const shapeBlurShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认圆角矩形描边，鼠标靠近时柔光圆擦亮形状边缘；色吃 foreground token。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ShapeBlur variation="round-rect" />
</div>`,
      render: () => (
        <Stage>
          <ShapeBlur variation="round-rect" />
        </Stage>
      ),
    },
    {
      title: "实心圆",
      description: 'variation="circle-fill"，circleSize 放大擦亮区域。',
      code: `<ShapeBlur variation="circle-fill" circleSize={0.4} />`,
      render: () => (
        <Stage hint="鼠标擦亮实心圆">
          <ShapeBlur variation="circle-fill" circleSize={0.4} />
        </Stage>
      ),
    },
    {
      title: "圆环描边 + 自定义色",
      description: 'variation="circle-stroke"，color 传任意 CSS 颜色覆盖默认前景色。',
      code: `<ShapeBlur
  variation="circle-stroke"
  color="oklch(0.82 0.16 75)"
  circleSize={0.35}
/>`,
      render: () => (
        <Stage hint="鼠标擦亮圆环">
          <ShapeBlur
            variation="circle-stroke"
            color="oklch(0.82 0.16 75)"
            circleSize={0.35}
          />
        </Stage>
      ),
    },
    {
      title: "三角形",
      description: 'variation="triangle"，蓝紫色填充。',
      code: `<ShapeBlur
  variation="triangle"
  color="oklch(0.7 0.22 280)"
  circleSize={0.32}
/>`,
      render: () => (
        <Stage hint="鼠标擦亮三角">
          <ShapeBlur
            variation="triangle"
            color="oklch(0.7 0.22 280)"
            circleSize={0.32}
          />
        </Stage>
      ),
    },
  ],

  controls: [
    {
      prop: "variation",
      type: "select",
      options: VARIATIONS,
      defaultValue: "round-rect",
      label: "形状",
    },
    { prop: "shapeSize", type: "number", defaultValue: 1.2, label: "形状尺寸" },
    { prop: "roundness", type: "number", defaultValue: 0.4, label: "圆角" },
    { prop: "borderSize", type: "number", defaultValue: 0.05, label: "描边宽" },
    { prop: "circleSize", type: "number", defaultValue: 0.3, label: "光圆半径" },
    { prop: "circleEdge", type: "number", defaultValue: 0.5, label: "光圆羽化" },
    { prop: "damping", type: "number", defaultValue: 8, label: "跟随阻尼" },
    {
      prop: "color",
      type: "text",
      defaultValue: "",
      label: "自定义色（留空=foreground）",
    },
  ],

  states: [
    {
      name: "default（圆角矩形描边 · foreground token）",
      render: () => (
        <Stage>
          <ShapeBlur variation="round-rect" />
        </Stage>
      ),
    },
    {
      name: "实心圆（circle-fill）",
      render: () => (
        <Stage hint="鼠标擦亮实心圆">
          <ShapeBlur variation="circle-fill" circleSize={0.4} />
        </Stage>
      ),
    },
    {
      name: "圆环描边（circle-stroke · 暖金色）",
      render: () => (
        <Stage hint="鼠标擦亮圆环">
          <ShapeBlur
            variation="circle-stroke"
            color="oklch(0.82 0.16 75)"
            circleSize={0.35}
          />
        </Stage>
      ),
    },
    {
      name: "三角形（triangle · 蓝紫色）",
      render: () => (
        <Stage hint="鼠标擦亮三角">
          <ShapeBlur
            variation="triangle"
            color="oklch(0.7 0.22 280)"
            circleSize={0.32}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ShapeBlur
        variation={p.variation as ShapeBlurVariation}
        shapeSize={p.shapeSize as number}
        roundness={p.roundness as number}
        borderSize={p.borderSize as number}
        circleSize={p.circleSize as number}
        circleEdge={p.circleEdge as number}
        damping={p.damping as number}
        color={(p.color as string) || undefined}
      />
    </Stage>
  ),

  toCode: (p) => {
    const colorLine = p.color ? `\n    color="${p.color}"` : "";
    return [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.13 0.02 270)" }}>`,
      `  <ShapeBlur`,
      `    variation="${p.variation}"`,
      `    shapeSize={${p.shapeSize}}`,
      `    roundness={${p.roundness}}`,
      `    borderSize={${p.borderSize}}`,
      `    circleSize={${p.circleSize}}`,
      `    circleEdge={${p.circleEdge}}`,
      `    damping={${p.damping}}${colorLine}`,
      `  />`,
      `</div>`,
    ].join("\n");
  },
};
