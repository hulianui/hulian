"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Prism } from "../../../../packages/ui/src/prism/prism";
import type { PrismAnimationType } from "../../../../packages/ui/src/prism/prism.types";
function Stage({ children, className = "", }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (<div className={`relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 ${className}`} style={{ background: "oklch(0.11 0.02 275)" }}>
      {children}
    </div>);
}
export const prismShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "is placed in the relative overflow-hidden container. The component comes with absolute inset-0 z-0; the content is stacked on top with relative z-10.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.11 0.02 275)" }}>
  <Prism />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">Prism</p>
  </div>
</div>`,
            render: () => (<Stage>
          <Prism />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-2xl font-bold text-white/90">Prism</p>
          </div>
        </Stage>),
        },
        {
            title: "Animation mode",
            description: "animationType Choose one of three: rotate (breathing swing) / 3drotate (three-dimensional rotation) / hover (follow the pointer).",
            code: `<Prism animationType="3drotate" glow={1.2} />`,
            render: () => (<Stage>
          <Prism animationType="3drotate" glow={1.2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">3D Rotation</p>
          </div>
        </Stage>),
        },
        {
            title: "High Glow\u00B7Pure",
            description: "glow brightens the volumetric light, noise=0 removes film grain and obtains a clean and transparent light spectrum.",
            code: `<Prism animationType="3drotate" glow={1.6} bloom={1.3} noise={0} />`,
            render: () => (<Stage>
          <Prism animationType="3drotate" glow={1.6} bloom={1.3} noise={0}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">High Glow · Pure</p>
          </div>
        </Stage>),
        },
        {
            title: "Product Hero",
            description: "Use offset to move the prism up to avoid the title, and layer a top halo to create a decorative background for the first marketing screen.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.09 0.025 270)" }}>
  <Prism
    animationType="3drotate"
    glow={1.3}
    scale={4.2}
    offset={{ x: 0, y: -40 }}
    colorFrequency={1.2}
  />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-8">
    <h1 className="text-3xl font-bold text-white">A beam of light, refracting the entire spectrum</h1>
    <p className="text-sm text-white/50">Enterprise-level component library \u00B7 WebGL decorative background</p>
  </div>
</div>`,
            render: () => (<div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10" style={{ background: "oklch(0.09 0.025 270)" }}>
          <Prism animationType="3drotate" glow={1.3} scale={4.2} offset={{ x: 0, y: -40 }} colorFrequency={1.2}/>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,oklch(0.7_0.2_280/0.3),transparent)]"/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-8">
            <h1 className="text-center text-3xl font-bold tracking-tight text-white">
              A beam of light refracts the entire spectrum
            </h1>
            <p className="text-center text-sm text-white/50">
              Enterprise component library · WebGL decorative background
            </p>
          </div>
        </div>),
        },
    ],
    controls: [
        {
            prop: "animationType",
            type: "select",
            defaultValue: "rotate",
            options: ["rotate", "3drotate", "hover"],
            label: "Animation mode",
        },
        { prop: "glow", type: "number", defaultValue: 1, label: "Glow intensity" },
        { prop: "scale", type: "number", defaultValue: 3.6, label: "Zoom" },
        { prop: "noise", type: "number", defaultValue: 0.5, label: "Particle strength" },
        { prop: "timeScale", type: "number", defaultValue: 0.5, label: "Time Speed" },
    ],
    states: [
        {
            name: "default (rotate \u00B7 Breathing Swing \u00B7 Theme Hue)",
            render: () => (<Stage>
          <Prism />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">Prism</p>
            <p className="text-sm text-white/50">Prism Spectroscopy WebGL Background</p>
          </div>
        </Stage>),
        },
        {
            name: "3drotate (three-dimensional rotation)",
            render: () => (<Stage>
          <Prism animationType="3drotate" glow={1.2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">3D Rotation</p>
          </div>
        </Stage>),
        },
        {
            name: "hover (Try following the pointer and moving the mouse)",
            render: () => (<Stage>
          <Prism animationType="hover" hoverStrength={2.4} inertia={0.06}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">Pointer following</p>
          </div>
        </Stage>),
        },
        {
            name: "High glow\u00B7No particles (glow=1.6\u00B7noise=0)",
            render: () => (<Stage>
          <Prism animationType="3drotate" glow={1.6} bloom={1.3} noise={0}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">High Glow · Pure</p>
          </div>
        </Stage>),
        },
        {
            name: "Product Hero (Prism Offset + Top Halo)",
            render: () => (<div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10" style={{ background: "oklch(0.09 0.025 270)" }}>
          <Prism animationType="3drotate" glow={1.3} scale={4.2} offset={{ x: 0, y: -40 }} colorFrequency={1.2}/>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,oklch(0.7_0.2_280/0.3),transparent)]"/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-8">
            <span className="text-xs font-medium uppercase tracking-widest text-white/40">
              Hulian UI
            </span>
            <h1 className="text-center text-3xl font-bold tracking-tight text-white">
              A beam of light refracts the entire spectrum
            </h1>
            <p className="text-center text-sm text-white/50">
              Enterprise-level component library · WebGL decorative background · Theme hue adaptive
            </p>
          </div>
        </div>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Prism animationType={p.animationType as PrismAnimationType} glow={p.glow as number} scale={p.scale as number} noise={p.noise as number} timeScale={p.timeScale as number}/>
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">Prism · WebGL Background</p>
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.11 0.02 275)" }}>`,
        `  <Prism`,
        `    animationType="${p.animationType}"`,
        `    glow={${p.glow}}`,
        `    scale={${p.scale}}`,
        `    noise={${p.noise}}`,
        `    timeScale={${p.timeScale}}`,
        `  />`,
        `  <div className="relative z-10">Content</div>`,
        `</div>`,
    ].join("\n"),
};
