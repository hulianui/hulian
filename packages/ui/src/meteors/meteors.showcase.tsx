"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Meteors } from "./meteors";

function Sky({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const meteorsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "把 Meteors 放进一个 relative + overflow-hidden 容器，默认 20 颗流星斜向下落。",
      code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors />
  <div className="grid h-full place-items-center text-sm text-muted">Meteors</div>
</div>`,
      render: () => (
        <Sky>
          <Meteors />
          <div className="grid h-full place-items-center text-sm text-muted">Meteors</div>
        </Sky>
      ),
    },
    {
      title: "流星数量",
      description: "用 number 控制流星密度，少量更克制、大量更绚烂。",
      code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors number={40} />
</div>`,
      render: () => (
        <Sky>
          <Meteors number={40} />
          <div className="grid h-full place-items-center text-sm text-muted">number=40</div>
        </Sky>
      ),
    },
    {
      title: "下落速度与延迟",
      description:
        "minDuration / maxDuration 控制单颗流星的时长区间，minDelay / maxDelay 控制错落出场。",
      code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors number={24} minDuration={3} maxDuration={6} minDelay={0} maxDelay={2} />
</div>`,
      render: () => (
        <Sky>
          <Meteors number={24} minDuration={3} maxDuration={6} minDelay={0} maxDelay={2} />
          <div className="grid h-full place-items-center text-sm text-muted">慢速错落</div>
        </Sky>
      ),
    },
    {
      title: "下落角度",
      description: "angle 调整流星下落方向（度），215 为默认左下，可改成竖直或反向。",
      code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors number={20} angle={250} />
</div>`,
      render: () => (
        <Sky>
          <Meteors number={20} angle={250} />
          <div className="grid h-full place-items-center text-sm text-muted">angle=250</div>
        </Sky>
      ),
    },
    {
      title: "自定义颜色",
      description: "流星头/尾用 currentColor，通过 className 的 text-* 类即可换色。",
      code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors number={24} className="text-primary" />
</div>`,
      render: () => (
        <Sky>
          <Meteors number={24} className="text-primary" />
          <div className="grid h-full place-items-center text-sm text-muted">text-primary</div>
        </Sky>
      ),
    },
  ],
  controls: [{ prop: "number", type: "number", defaultValue: 20 }],
  states: [
    {
      name: "default（20 颗流星）",
      render: () => (
        <Sky>
          <Meteors />
          <div className="grid h-full place-items-center text-sm text-muted">Meteors</div>
        </Sky>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Sky>
      <Meteors number={p.number as number} />
      <div className="grid h-full place-items-center text-sm text-muted">Meteors</div>
    </Sky>
  ),
  toCode: (p) =>
    `<div className="relative overflow-hidden">\n  <Meteors number={${p.number}} />\n</div>`,
};
