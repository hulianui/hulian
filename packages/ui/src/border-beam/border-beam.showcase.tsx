"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BorderBeam } from "./border-beam";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-40 w-72 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const borderBeamShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "BorderBeam 是 absolute inset-0 叠加层，放在 relative + rounded + overflow-hidden 容器内即沿边框绕行一束光。默认 primary→chart-2 渐变。",
      code: `<div className="relative h-40 w-72 overflow-hidden rounded-xl border border-border bg-surface">
  <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
  <BorderBeam />
</div>`,
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
          <BorderBeam />
        </Card>
      ),
    },
    {
      title: "反向 · 放慢",
      description: "reverse 让光束逆向绕行，duration 调整一圈秒数，size 调光束方块边长。",
      code: `<BorderBeam reverse duration={10} size={80} />`,
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Reverse</div>
          <BorderBeam reverse duration={10} size={80} />
        </Card>
      ),
    },
    {
      title: "自定义颜色",
      description: "colorFrom / colorTo 可换任意 CSS 颜色或 token，呈现品牌色光束。",
      code: `<BorderBeam colorFrom="var(--color-chart-3)" colorTo="var(--color-chart-5)" borderWidth={2} />`,
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Custom Color</div>
          <BorderBeam
            colorFrom="var(--color-chart-3)"
            colorTo="var(--color-chart-5)"
            borderWidth={2}
          />
        </Card>
      ),
    },
  ],
  controls: [
    { prop: "duration", type: "number", defaultValue: 6 },
    { prop: "size", type: "number", defaultValue: 60 },
  ],
  states: [
    {
      name: "default（primary→chart 光束绕边）",
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
          <BorderBeam />
        </Card>
      ),
    },
    {
      name: "反向 · 慢",
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Reverse</div>
          <BorderBeam reverse duration={10} size={80} />
        </Card>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Card>
      <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
      <BorderBeam duration={p.duration as number} size={p.size as number} />
    </Card>
  ),
  toCode: (p) =>
    `<div className="relative">\n  ...content\n  <BorderBeam duration={${p.duration}} size={${p.size}} />\n</div>`,
};
