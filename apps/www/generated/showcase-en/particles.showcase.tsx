"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Particles } from "../../../../packages/ui/src/particles/particles";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const particlesShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative container. Particles comes with absolute and inset-0. If color is not transferred, the theme foreground color will be used, and the mouse will be magnetically displaced when approaching it.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Particles quantity={120} />
  <div className="grid h-full place-items-center text-sm text-muted">Particles</div>
</div>`,
            render: () => (<Stage>
          <Particles quantity={120}/>
          <div className="grid h-full place-items-center text-sm text-muted">Particles</div>
        </Stage>),
        },
        {
            title: "Still and slow motion",
            description: "staticity The bigger the particle is, the less likely it is to follow the mouse. The larger ease is, the slower it will follow, creating a more restrained atmosphere.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Particles quantity={80} staticity={80} ease={80} />
</div>`,
            render: () => (<Stage>
          <Particles quantity={80} staticity={80} ease={80}/>
          <div className="grid h-full place-items-center text-sm text-muted">staticity=80 ease=80</div>
        </Stage>),
        },
        {
            title: "Specify color",
            description: "Pass color (#hex / rgb()) to fix the particle color and no longer follow the theme.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Particles quantity={100} color="#6366f1" />
</div>`,
            render: () => (<Stage>
          <Particles quantity={100} color="#6366f1"/>
          <div className="grid h-full place-items-center text-sm text-muted">color=#6366f1</div>
        </Stage>),
        },
        {
            title: "Particle size and drift",
            description: "size increases the single particle radius, and vx / vy gives a constant drift speed to form a directional flow.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Particles quantity={50} size={2} vx={0.3} vy={0.1} />
</div>`,
            render: () => (<Stage>
          <Particles quantity={50} size={2} vx={0.3} vy={0.1}/>
          <div className="grid h-full place-items-center text-sm text-muted">size=2 vx=0.3</div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "quantity", type: "number", defaultValue: 100 },
        { prop: "staticity", type: "number", defaultValue: 50 },
        { prop: "ease", type: "number", defaultValue: 50 },
        { prop: "size", type: "number", defaultValue: 0.4 },
    ],
    states: [
        {
            name: "default (theme color particles)",
            render: () => (<Stage>
          <Particles quantity={120}/>
          <div className="grid h-full place-items-center text-sm text-muted">Particles</div>
        </Stage>),
        },
        {
            name: "Slow speed high still",
            render: () => (<Stage>
          <Particles quantity={80} staticity={80} ease={80}/>
          <div className="grid h-full place-items-center text-sm text-muted">staticity=80 ease=80</div>
        </Stage>),
        },
        {
            name: "Specify color primary",
            render: () => (<Stage>

          <Particles quantity={100} color="#6366f1"/>
          <div className="grid h-full place-items-center text-sm text-muted">color=#6366f1</div>
        </Stage>),
        },
        {
            name: "Large particles + drift",
            render: () => (<Stage>
          <Particles quantity={50} size={2} vx={0.3} vy={0.1}/>
          <div className="grid h-full place-items-center text-sm text-muted">size=2 vx=0.3</div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Particles quantity={p.quantity as number} staticity={p.staticity as number} ease={p.ease as number} size={p.size as number}/>
      <div className="grid h-full place-items-center text-sm text-muted">Particles</div>
    </Stage>),
    toCode: (p) => `<div className="relative overflow-hidden">
  <Particles
    quantity={${p.quantity}}
    staticity={${p.staticity}}
    ease={${p.ease}}
    size={${p.size}}
  />
</div>`,
};
