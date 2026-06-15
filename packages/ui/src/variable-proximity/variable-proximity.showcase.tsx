"use client";
import { useRef } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { VariableProximity } from "./variable-proximity";
import type { VariableProximityFalloff } from "./variable-proximity.types";

/**
 * 展示台：提供居中容器 + containerRef（距离基于容器坐标系），
 * 鼠标移过文字即可看到字重/视觉尺寸随距离插值。
 * 注：font-variation-settings 需可变字体（variable font）才有可见变化，
 * 这里用系统可变字号轴回退，效果取决于运行环境字体。
 */
function Stage({
  from,
  to,
  radius,
  falloff,
  dark = true,
}: {
  from: string;
  to: string;
  radius: number;
  falloff: VariableProximityFalloff;
  dark?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative flex h-40 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border px-6 text-center"
      style={{ background: dark ? "oklch(0.16 0.02 255)" : "oklch(0.98 0.005 255)" }}
    >
      <VariableProximity
        label="把鼠标移到这里 Hover me"
        fromFontVariationSettings={from}
        toFontVariationSettings={to}
        containerRef={ref}
        radius={radius}
        falloff={falloff}
        className={dark ? "text-3xl font-medium text-white" : "text-3xl font-medium"}
      />
    </div>
  );
}

const FROM = "'wght' 400, 'opsz' 9";
const TO = "'wght' 900, 'opsz' 40";

export const variableProximityShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "用 containerRef 让距离基于容器坐标系；鼠标移近字形即逐字插值字重/视觉尺寸。",
      code: `const ref = useRef<HTMLDivElement>(null);

<div ref={ref} className="relative">
  <VariableProximity
    label="把鼠标移到这里 Hover me"
    fromFontVariationSettings="'wght' 400, 'opsz' 9"
    toFontVariationSettings="'wght' 900, 'opsz' 40"
    containerRef={ref}
    radius={90}
    falloff="linear"
  />
</div>`,
      render: () => <Stage from={FROM} to={TO} radius={90} falloff="linear" />,
    },
    {
      title: "高斯衰减",
      description: 'falloff="gaussian" 让中心更聚拢、过渡更柔和，配合较大半径更自然。',
      code: `<VariableProximity
  label="把鼠标移到这里 Hover me"
  fromFontVariationSettings="'wght' 400, 'opsz' 9"
  toFontVariationSettings="'wght' 900, 'opsz' 40"
  containerRef={ref}
  radius={120}
  falloff="gaussian"
/>`,
      render: () => <Stage from={FROM} to={TO} radius={120} falloff="gaussian" />,
    },
    {
      title: "指数衰减 · 小半径",
      description: 'falloff="exponential" 增长更陡，配合小半径只有贴近字形时才明显变化。',
      code: `<VariableProximity
  label="把鼠标移到这里 Hover me"
  fromFontVariationSettings="'wght' 400, 'opsz' 9"
  toFontVariationSettings="'wght' 900, 'opsz' 40"
  containerRef={ref}
  radius={55}
  falloff="exponential"
/>`,
      render: () => <Stage from={FROM} to={TO} radius={55} falloff="exponential" />,
    },
    {
      title: "浅色底",
      description: "在浅色背景上同样可用，文字色走 token 自动适配明暗。",
      code: `<div ref={ref} className="relative">
  <VariableProximity
    label="把鼠标移到这里 Hover me"
    fromFontVariationSettings="'wght' 400, 'opsz' 9"
    toFontVariationSettings="'wght' 900, 'opsz' 40"
    containerRef={ref}
    radius={90}
    falloff="linear"
    className="text-3xl font-medium"
  />
</div>`,
      render: () => (
        <Stage from={FROM} to={TO} radius={90} falloff="linear" dark={false} />
      ),
    },
  ],

  controls: [
    { prop: "radius", type: "number", defaultValue: 90, label: "影响半径 px" },
    {
      prop: "falloff",
      type: "select",
      options: ["linear", "exponential", "gaussian"],
      defaultValue: "linear",
      label: "衰减曲线",
    },
  ],

  states: [
    {
      name: "default（深色底 · linear）",
      render: () => <Stage from={FROM} to={TO} radius={90} falloff="linear" />,
    },
    {
      name: "gaussian（中心聚拢柔和）",
      render: () => <Stage from={FROM} to={TO} radius={120} falloff="gaussian" />,
    },
    {
      name: "exponential · 小半径（贴近才变）",
      render: () => <Stage from={FROM} to={TO} radius={55} falloff="exponential" />,
    },
    {
      name: "浅色底",
      render: () => <Stage from={FROM} to={TO} radius={90} falloff="linear" dark={false} />,
    },
  ],

  renderWithProps: (p) => (
    <Stage
      from={FROM}
      to={TO}
      radius={p.radius as number}
      falloff={p.falloff as VariableProximityFalloff}
    />
  ),

  toCode: (p) =>
    [
      `const ref = useRef<HTMLDivElement>(null);`,
      `<div ref={ref} className="relative">`,
      `  <VariableProximity`,
      `    label="把鼠标移到这里 Hover me"`,
      `    fromFontVariationSettings="${FROM}"`,
      `    toFontVariationSettings="${TO}"`,
      `    containerRef={ref}`,
      `    radius={${p.radius}}`,
      `    falloff="${p.falloff}"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
