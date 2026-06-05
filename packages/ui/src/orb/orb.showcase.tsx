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
