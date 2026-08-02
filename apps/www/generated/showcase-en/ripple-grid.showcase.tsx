"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RippleGrid } from "../../../../packages/ui/src/ripple-grid/ripple-grid";
function Stage({ children, dark = true, }: {
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10" style={{ background: dark ? "oklch(0.12 0.02 265)" : "oklch(0.97 0.005 265)" }}>
      {children}
    </div>);
}
export const rippleGridShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default dark background + chart-1 token grid; placed in relative container comes with absolute inset-0 z-0.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 265)" }}>
  <RippleGrid />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">RippleGrid</p>
  </div>
</div>`,
            render: () => (<Stage>
          <RippleGrid />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-2xl font-bold tracking-tight text-white/90">
              RippleGrid
            </p>
          </div>
        </Stage>),
        },
        {
            title: "Dense grid\u00B7Strong glow",
            description: "gridSize encrypts the grid, glowIntensity improves line halo, and gridThickness sharpens lines.",
            code: `<RippleGrid gridSize={18} glowIntensity={0.3} gridThickness={20} />`,
            render: () => (<Stage>
          <RippleGrid gridSize={18} glowIntensity={0.3} gridThickness={20}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">Dense grid·Strong glow</p>
          </div>
        </Stage>),
        },
        {
            title: "Rainbow color",
            description: "enableRainbow causes the mesh to cycle between RGB over time (color is ignored at this time).",
            code: `<RippleGrid enableRainbow rippleIntensity={0.08} gridSize={12} />`,
            render: () => (<Stage>
          <RippleGrid enableRainbow rippleIntensity={0.08} gridSize={12}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/80">Rainbow Ripples</p>
          </div>
        </Stage>),
        },
        {
            title: "Diamond Grid \u00B7 Custom Color",
            description: "gridRotation=45 is rotated into a diamond grid, and color is passed to any CSS color to cover token.",
            code: `<RippleGrid
  gridRotation={45}
  color="oklch(0.78 0.18 75)"
  gridSize={9}
  rippleIntensity={0.06}
/>`,
            render: () => (<Stage>
          <RippleGrid gridRotation={45} color="oklch(0.78 0.18 75)" gridSize={9} rippleIntensity={0.06}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">
              45° diamond · warm gold
            </p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "rippleIntensity", type: "number", defaultValue: 0.05, label: "Ripple intensity" },
        { prop: "gridSize", type: "number", defaultValue: 10, label: "Grid density" },
        { prop: "gridThickness", type: "number", defaultValue: 15, label: "Line sharpness" },
        { prop: "glowIntensity", type: "number", defaultValue: 0.1, label: "Glow intensity" },
        { prop: "gridRotation", type: "number", defaultValue: 0, label: "Rotation (degrees)" },
        { prop: "enableRainbow", type: "boolean", defaultValue: false, label: "Rainbow color" },
        { prop: "mouseInteraction", type: "boolean", defaultValue: true, label: "Mouse interaction" },
        { prop: "color", type: "text", defaultValue: "", label: "Custom color (leave blank =chart-1)" },
    ],
    states: [
        {
            name: "default (dark bottom\u00B7chart-1 token)",
            render: () => (<Stage>
          <RippleGrid />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">RippleGrid</p>
            <p className="text-sm text-white/50">Ripple Grid WebGL Background</p>
          </div>
        </Stage>),
        },
        {
            name: "Dense grid + strong glow (gridSize=18\u00B7glow=0.3)",
            render: () => (<Stage>
          <RippleGrid gridSize={18} glowIntensity={0.3} gridThickness={20}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">Dense grid·Strong glow</p>
          </div>
        </Stage>),
        },
        {
            name: "Rainbow cycle color (enableRainbow)",
            render: () => (<Stage>
          <RippleGrid enableRainbow rippleIntensity={0.08} gridSize={12}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/80">Rainbow Ripples</p>
          </div>
        </Stage>),
        },
        {
            name: "45\u00B0 diamond mesh + warm gold",
            render: () => (<Stage>
          <RippleGrid gridRotation={45} color="oklch(0.78 0.18 75)" gridSize={9} rippleIntensity={0.06}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">45° diamond · warm gold</p>
          </div>
        </Stage>),
        },
        {
            name: "Light base (bright theme)",
            render: () => (<Stage dark={false}>
          <RippleGrid color="oklch(0.55 0.2 270)" opacity={0.85}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-neutral-700">Light base · Custom color</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <RippleGrid rippleIntensity={p.rippleIntensity as number} gridSize={p.gridSize as number} gridThickness={p.gridThickness as number} glowIntensity={p.glowIntensity as number} gridRotation={p.gridRotation as number} enableRainbow={p.enableRainbow as boolean} mouseInteraction={p.mouseInteraction as boolean} color={(p.color as string) || undefined}/>
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">RippleGrid · WebGL Background</p>
      </div>
    </Stage>),
    toCode: (p) => {
        const colorLine = p.color ? `
    color="${p.color}"` : "";
        return [
            `<div className="relative h-64 overflow-hidden rounded-xl"`,
            `     style={{ background: "oklch(0.12 0.02 265)" }}>`,
            `  <RippleGrid`,
            `    rippleIntensity={${p.rippleIntensity}}`,
            `    gridSize={${p.gridSize}}`,
            `    gridThickness={${p.gridThickness}}`,
            `    glowIntensity={${p.glowIntensity}}`,
            `    gridRotation={${p.gridRotation}}`,
            `    enableRainbow={${p.enableRainbow}}`,
            `    mouseInteraction={${p.mouseInteraction}}${colorLine}`,
            `  />`,
            `  <div className="relative z-10">Content</div>`,
            `</div>`,
        ].join("\n");
    },
};
