"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Orb } from "./orb";

// 提供方形容器：Orb 是焦点元素，canvas 填满容器，尺寸由外层决定。
function OrbFrame({
  children,
  size = 280,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-bg"
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

export const orbShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "Orb 填满父容器（block h-full w-full），由外层方形容器决定尺寸；默认蓝紫色系。",
      code: `<div className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl bg-bg">
  <Orb />
</div>`,
      render: () => (
        <OrbFrame>
          <Orb />
        </OrbFrame>
      ),
    },
    {
      title: "色相旋转",
      description: "hue 以度为单位旋转 YIQ 色相：约 120 偏绿、60 偏琥珀、300 偏紫红。",
      code: `<Orb hue={120} />`,
      render: () => (
        <OrbFrame>
          <Orb hue={120} />
        </OrbFrame>
      ),
    },
    {
      title: "强制悬停态",
      description: "forceHoverState 常驻发光+扭曲，适合演示/截图；hoverIntensity 调扭曲强度。",
      code: `<Orb forceHoverState hoverIntensity={0.4} />`,
      render: () => (
        <OrbFrame>
          <Orb forceHoverState hoverIntensity={0.4} />
        </OrbFrame>
      ),
    },
    {
      title: "尺寸与禁用旋转",
      description: "尺寸由外层容器控制；rotateOnHover={false} 关闭悬停自转。",
      code: `<div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-bg">
  <Orb rotateOnHover={false} />
</div>`,
      render: () => (
        <OrbFrame size={160}>
          <Orb rotateOnHover={false} />
        </OrbFrame>
      ),
    },
  ],
  controls: [
    { prop: "hue", type: "number", defaultValue: 0, label: "色相旋转(度)" },
    { prop: "hoverIntensity", type: "number", defaultValue: 0.2, label: "悬停强度" },
    { prop: "rotateOnHover", type: "boolean", defaultValue: true, label: "悬停旋转" },
    { prop: "forceHoverState", type: "boolean", defaultValue: false, label: "强制悬停态" },
  ],
  states: [
    {
      name: "默认（蓝紫·hue=0）",
      render: () => (
        <OrbFrame>
          <Orb />
        </OrbFrame>
      ),
    },
    {
      name: "chart-1 蓝（hue=0）",
      render: () => (
        <OrbFrame>
          <Orb hue={0} />
        </OrbFrame>
      ),
    },
    {
      name: "chart-2 绿（hue=120）",
      render: () => (
        <OrbFrame>
          <Orb hue={120} />
        </OrbFrame>
      ),
    },
    {
      name: "chart-3 琥珀（hue=60）",
      render: () => (
        <OrbFrame>
          <Orb hue={60} />
        </OrbFrame>
      ),
    },
    {
      name: "chart-4 紫红（hue=300）",
      render: () => (
        <OrbFrame>
          <Orb hue={300} />
        </OrbFrame>
      ),
    },
    {
      name: "强制悬停态（发光+扭曲）",
      render: () => (
        <OrbFrame>
          <Orb forceHoverState hoverIntensity={0.4} />
        </OrbFrame>
      ),
    },
    {
      name: "高强度悬停（hoverIntensity=0.6）",
      render: () => (
        <OrbFrame>
          <Orb forceHoverState hoverIntensity={0.6} hue={180} />
        </OrbFrame>
      ),
    },
    {
      name: "大尺寸 400×400",
      render: () => (
        <OrbFrame size={400}>
          <Orb hue={240} />
        </OrbFrame>
      ),
    },
    {
      name: "小尺寸 160×160（不旋转）",
      render: () => (
        <OrbFrame size={160}>
          <Orb rotateOnHover={false} />
        </OrbFrame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <OrbFrame>
      <Orb
        hue={p.hue as number}
        hoverIntensity={p.hoverIntensity as number}
        rotateOnHover={p.rotateOnHover as boolean}
        forceHoverState={p.forceHoverState as boolean}
      />
    </OrbFrame>
  ),
  toCode: (p) =>
    `<div className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl bg-bg">
  <Orb
    hue={${p.hue}}
    hoverIntensity={${p.hoverIntensity}}
    rotateOnHover={${p.rotateOnHover}}
    forceHoverState={${p.forceHoverState}}
  />
</div>`,
};
