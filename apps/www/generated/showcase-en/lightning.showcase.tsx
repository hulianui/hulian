"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Lightning } from "../../../../packages/ui/src/lightning/lightning";
function Stage({ children, className = "", }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (<div className={`relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 ${className}`} style={{ background: "oklch(0.10 0.02 265)" }}>
      {children}
    </div>);
}
export const lightningShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default blue-purple phase is 230, the component comes with absolute inset-0 z-0, and the content overlaps z-10.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.10 0.02 265)" }}>
  <Lightning />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
    <p className="text-2xl font-bold tracking-tight text-white/90">Lightning</p>
    <p className="text-sm text-white/50">fbm Noise arc background</p>
  </div>
</div>`,
            render: () => (<Stage>
          <Lightning />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">Lightning</p>
            <p className="text-sm text-white/50">fbm Noise arc background</p>
          </div>
        </Stage>),
        },
        {
            title: "Warm orange phase (high intensity)",
            description: "hue=30 Cut warm orange, intensity / speed turn it up to be brighter and noisier.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.10 0.02 265)" }}>
  <Lightning hue={30} intensity={1.4} speed={1.3} />
</div>`,
            render: () => (<Stage>
          <Lightning hue={30} intensity={1.4} speed={1.3}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">hue = 30</p>
          </div>
        </Stage>),
        },
        {
            title: "Eat chart token (light and dark adaptive)",
            description: "Pass color to cover the hue path, shader directly eat token, and follow the theme switching.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.10 0.02 265)" }}>
  <Lightning color="var(--color-chart-1)" intensity={1.2} />
</div>`,
            render: () => (<Stage>
          <Lightning color="var(--color-chart-1)" intensity={1.2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">token Color Picking · Light and Dark Adaptive</p>
          </div>
        </Stage>),
        },
        {
            title: "Fine and slow battery",
            description: "size turns it up to make the splits thinner, and speed turns it down to make the surge more soothing.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.10 0.02 265)" }}>
  <Lightning size={1.6} speed={0.6} hue={280} />
</div>`,
            render: () => (<Stage>
          <Lightning size={1.6} speed={0.6} hue={280}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-violet-200/80">size=1.6 · speed=0.6</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "hue", type: "number", defaultValue: 230, label: "Hue (0\u2013360, effective when the left color is empty)" },
        { prop: "speed", type: "number", defaultValue: 1, label: "Speed" },
        { prop: "intensity", type: "number", defaultValue: 1, label: "Brightness intensity" },
        { prop: "size", type: "number", defaultValue: 1, label: "Noise scale" },
        { prop: "xOffset", type: "number", defaultValue: 0, label: "Horizontal offset" },
        { prop: "color", type: "text", defaultValue: "", label: "Custom color (leave blank = by hue)" },
    ],
    states: [
        {
            name: "default (blue-violet phase 230)",
            render: () => (<Stage>
          <Lightning />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">Lightning</p>
            <p className="text-sm text-white/50">fbm Noise arc background</p>
          </div>
        </Stage>),
        },
        {
            name: "Warm orange phase (hue=30\u00B7High intensity)",
            render: () => (<Stage>
          <Lightning hue={30} intensity={1.4} speed={1.3}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">hue = 30</p>
          </div>
        </Stage>),
        },
        {
            name: "Eat chart token (color=var(--color-chart-1))",
            render: () => (<Stage>
          <Lightning color="var(--color-chart-1)" intensity={1.2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">token Color Picking · Light and Dark Adaptive</p>
          </div>
        </Stage>),
        },
        {
            name: "Fine slow battery (size=1.6\u00B7speed=0.6)",
            render: () => (<Stage>
          <Lightning size={1.6} speed={0.6} hue={280}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-violet-200/80">size=1.6 · speed=0.6</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Lightning hue={p.hue as number} speed={p.speed as number} intensity={p.intensity as number} size={p.size as number} xOffset={p.xOffset as number} color={(p.color as string) || undefined}/>
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">Lightning · WebGL Background</p>
      </div>
    </Stage>),
    toCode: (p) => {
        const colorLine = p.color ? `
    color="${p.color}"` : "";
        return [
            `<div className="relative h-64 overflow-hidden rounded-xl"`,
            `     style={{ background: "oklch(0.10 0.02 265)" }}>`,
            `  <Lightning`,
            `    hue={${p.hue}}`,
            `    speed={${p.speed}}`,
            `    intensity={${p.intensity}}`,
            `    size={${p.size}}`,
            `    xOffset={${p.xOffset}}${colorLine}`,
            `  />`,
            `  <div className="relative z-10">Content</div>`,
            `</div>`,
        ].join("\n");
    },
};
