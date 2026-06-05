"use client";

import type { ShowcaseSpec } from "../showcase/types";
import { Particles } from "./particles";

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const particlesShowcase: ShowcaseSpec = {
  controls: [
    { prop: "quantity", type: "number", defaultValue: 100 },
    { prop: "staticity", type: "number", defaultValue: 50 },
    { prop: "ease", type: "number", defaultValue: 50 },
    { prop: "size", type: "number", defaultValue: 0.4 },
  ],
  states: [
    {
      name: "default（主题色粒子）",
      render: () => (
        <Stage>
          <Particles quantity={120} />
          <div className="grid h-full place-items-center text-sm text-muted">Particles</div>
        </Stage>
      ),
    },
    {
      name: "慢速高静止",
      render: () => (
        <Stage>
          <Particles quantity={80} staticity={80} ease={80} />
          <div className="grid h-full place-items-center text-sm text-muted">staticity=80 ease=80</div>
        </Stage>
      ),
    },
    {
      name: "指定颜色 primary",
      render: () => (
        <Stage>
          {/* color 直接传 CSS var 解析值，或用十六进制硬编码 demo 色 */}
          <Particles quantity={100} color="#6366f1" />
          <div className="grid h-full place-items-center text-sm text-muted">color=#6366f1</div>
        </Stage>
      ),
    },
    {
      name: "大粒子 + 漂移",
      render: () => (
        <Stage>
          <Particles quantity={50} size={2} vx={0.3} vy={0.1} />
          <div className="grid h-full place-items-center text-sm text-muted">size=2 vx=0.3</div>
        </Stage>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Stage>
      <Particles
        quantity={p.quantity as number}
        staticity={p.staticity as number}
        ease={p.ease as number}
        size={p.size as number}
      />
      <div className="grid h-full place-items-center text-sm text-muted">Particles</div>
    </Stage>
  ),
  toCode: (p) =>
    `<div className="relative overflow-hidden">\n  <Particles\n    quantity={${p.quantity}}\n    staticity={${p.staticity}}\n    ease={${p.ease}}\n    size={${p.size}}\n  />\n</div>`,
};
