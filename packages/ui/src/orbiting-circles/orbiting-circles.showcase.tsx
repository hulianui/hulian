"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { OrbitingCircles } from "./orbiting-circles";

const Chip = ({ c }: { c: string }) => (
  <span className="flex size-full items-center justify-center rounded-full bg-surface-hover text-xs text-foreground shadow-sm">
    {c}
  </span>
);

function Demo({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="relative flex h-[340px] w-[340px] items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">瑚琏</span>
      <OrbitingCircles radius={140} duration={20} reverse={reverse}>
        <Chip c="A" />
        <Chip c="B" />
        <Chip c="C" />
        <Chip c="D" />
      </OrbitingCircles>
      <OrbitingCircles radius={80} duration={14} reverse={!reverse} iconSize={32}>
        <Chip c="1" />
        <Chip c="2" />
      </OrbitingCircles>
    </div>
  );
}

export const orbitingCirclesShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "子元素沿圆周匀速环绕，中心放置标识/Logo。",
      code: `<div className="relative flex size-[340px] items-center justify-center">
  <span className="text-sm font-medium text-muted-foreground">瑚琏</span>
  <OrbitingCircles radius={140} duration={20}>
    <Chip c="A" />
    <Chip c="B" />
    <Chip c="C" />
    <Chip c="D" />
  </OrbitingCircles>
</div>`,
      render: () => <Demo />,
    },
    {
      title: "反向旋转",
      description: "reverse 让轨道逆向公转，常用于内外双环对冲增强层次。",
      code: `<OrbitingCircles radius={140} duration={20} reverse>
  <Chip c="A" />
  <Chip c="B" />
</OrbitingCircles>`,
      render: () => <Demo reverse />,
    },
    {
      title: "单环 · 隐藏轨道",
      description: "showPath=false 去掉虚线轨道，配合 iconSize 调子元素方框大小。",
      code: `<div className="relative flex size-[340px] items-center justify-center">
  <OrbitingCircles radius={120} duration={16} showPath={false} iconSize={48}>
    <Chip c="React" />
    <Chip c="TS" />
    <Chip c="CSS" />
  </OrbitingCircles>
</div>`,
      render: () => (
        <div className="relative flex h-[340px] w-[340px] items-center justify-center">
          <OrbitingCircles radius={120} duration={16} showPath={false} iconSize={48}>
            <Chip c="React" />
            <Chip c="TS" />
            <Chip c="CSS" />
          </OrbitingCircles>
        </div>
      ),
    },
  ],
  controls: [{ prop: "reverse", type: "boolean", defaultValue: false }],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "reverse", render: () => <Demo reverse /> },
  ],
  renderWithProps: (p) => <Demo reverse={Boolean(p.reverse)} />,
  toCode: () =>
    `<div className="relative flex size-[340px] items-center justify-center">\n  <OrbitingCircles radius={140} duration={20}>\n    <Icon /><Icon /><Icon />\n  </OrbitingCircles>\n</div>`,
};
