"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Silk } from "../../../../packages/ui/src/silk/silk";
function Stage({ children, dark = true, className = "", }: {
    children: React.ReactNode;
    dark?: boolean;
    className?: string;
}) {
    return (<div className={`relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 ${className}`} style={{
            background: dark ? "oklch(0.12 0.02 270)" : "oklch(0.96 0.005 270)",
        }}>
      {children}
    </div>);
}
export const silkShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Placed into the relative container, Silk comes with absolute inset-0 z-0; the contents are layered on top of the silk with relative z-10. The default is chart-1 token.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
    <p className="text-2xl font-bold tracking-tight text-white/90">Silk</p>
    <p className="text-sm text-white/50">Silk flow WebGL background</p>
  </div>
</div>`,
            render: () => (<Stage>
          <Silk />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold tracking-tight text-white/90">Silk</p>
            <p className="text-sm text-white/50">Silk flow WebGL background</p>
          </div>
        </Stage>),
        },
        {
            title: "Speed and Zoom",
            description: "speed controls the flow speed, scale controls the texture density, and the low speed scale is more delicate.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk speed={2} scale={1.5} />
</div>`,
            render: () => (<Stage>
          <Silk speed={2} scale={1.5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">speed=2 · scale=1.5</p>
          </div>
        </Stage>),
        },
        {
            title: "Custom color",
            description: "color accepts any CSS color (hex / oklch / rgb), customized silk main color.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk color="oklch(0.78 0.18 55)" speed={4} scale={1.2} />
</div>`,
            render: () => (<Stage>
          <Silk color="oklch(0.78 0.18 55)" speed={4} scale={1.2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">Warm golden silk</p>
          </div>
        </Stage>),
        },
        {
            title: "Particle strength",
            description: "noiseIntensity Controls the grainy texture, 0 is pure silk, increase it to obtain a matte film feel.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk noiseIntensity={0} speed={5} />
</div>`,
            render: () => (<Stage>
          <Silk noiseIntensity={0} speed={5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">Pure silk (no particles)</p>
          </div>
        </Stage>),
        },
        {
            title: "Texture rotation",
            description: "rotation (radian) rotates the silk texture direction, Math.PI / 4 is 45\u00B0 oblique.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Silk rotation={Math.PI / 4} speed={4} />
</div>`,
            render: () => (<Stage>
          <Silk rotation={Math.PI / 4} speed={4}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">rotation = π/4</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 5, label: "Speed" },
        { prop: "scale", type: "number", defaultValue: 1, label: "Zoom" },
        { prop: "noiseIntensity", type: "number", defaultValue: 1.5, label: "Particle strength" },
        { prop: "rotation", type: "number", defaultValue: 0, label: "Rotation (radians)" },
        { prop: "color", type: "text", defaultValue: "", label: "Custom color (leave blank =chart-1)" },
    ],
    states: [
        {
            name: "default (dark bottom\u00B7chart-1 token)",
            render: () => (<Stage>
          <Silk />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold tracking-tight text-white/90">Silk</p>
            <p className="text-sm text-white/50">Silk flow WebGL background</p>
          </div>
        </Stage>),
        },
        {
            name: "High-speed flow (speed=12)",
            render: () => (<Stage>
          <Silk speed={12}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">speed = 12</p>
          </div>
        </Stage>),
        },
        {
            name: "Low speed\u00B7Delicate (speed=2\u00B7scale=1.5)",
            render: () => (<Stage>
          <Silk speed={2} scale={1.5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">speed=2 · scale=1.5</p>
          </div>
        </Stage>),
        },
        {
            name: "Custom warm gold color",
            render: () => (<Stage>
          <Silk color="oklch(0.78 0.18 55)" speed={4} scale={1.2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">Warm golden silk</p>
          </div>
        </Stage>),
        },
        {
            name: "Customized Aurora Blue and Purple",
            render: () => (<Stage>
          <Silk color="oklch(0.65 0.28 285)" speed={3} noiseIntensity={2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-violet-200/80">Aurora Blue Purple</p>
          </div>
        </Stage>),
        },
        {
            name: "45\u00B0 rotation (rotation=\u03C0/4)",
            render: () => (<Stage>
          <Silk rotation={Math.PI / 4} speed={4}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">rotation = π/4</p>
          </div>
        </Stage>),
        },
        {
            name: "No particles (noiseIntensity=0)",
            render: () => (<Stage>
          <Silk noiseIntensity={0} speed={5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">Pure silk (no particles)</p>
          </div>
        </Stage>),
        },
        {
            name: "High particle size (noiseIntensity=4)",
            render: () => (<Stage>
          <Silk noiseIntensity={4} speed={3}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">High grain texture</p>
          </div>
        </Stage>),
        },
        {
            name: "Work details Hero (size ruler Codemarker)",
            render: () => (<div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10" style={{ background: "oklch(0.10 0.025 265)" }}>
          <Silk speed={3} scale={1.1} color="oklch(0.58 0.22 280)" noiseIntensity={1.2}/>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.65_0.22_280/0.35),transparent)]"/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white backdrop-blur-sm">
                CM
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                Codemarker
              </span>
            </div>
            <h1 className="text-center text-3xl font-bold tracking-tight text-white">
              Code Ruler・Code Measurement Platform
            </h1>
            <p className="text-center text-sm leading-relaxed text-white/50">
              Visualize code quality · Intelligent tracking of technical debt · Team performance insights
            </p>
          </div>
        </div>),
        },
        {
            name: "Light base (bright theme)",
            render: () => (<Stage dark={false}>
          <Silk speed={4} color="oklch(0.55 0.2 270)" noiseIntensity={1.0}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-neutral-700">Light base · Custom color</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Silk speed={p.speed as number} scale={p.scale as number} noiseIntensity={p.noiseIntensity as number} rotation={p.rotation as number} color={(p.color as string) || undefined}/>
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">Silk · WebGL Background</p>
      </div>
    </Stage>),
    toCode: (p) => {
        const colorLine = p.color ? `
    color="${p.color}"` : "";
        return [
            `<div className="relative h-64 overflow-hidden rounded-xl"`,
            `     style={{ background: "oklch(0.12 0.02 270)" }}>`,
            `  <Silk`,
            `    speed={${p.speed}}`,
            `    scale={${p.scale}}`,
            `    noiseIntensity={${p.noiseIntensity}}`,
            `    rotation={${p.rotation}}${colorLine}`,
            `  />`,
            `  <div className="relative z-10">Content</div>`,
            `</div>`,
        ].join("\n");
    },
};
