"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PixelBlast } from "../../../../packages/ui/src/pixel-blast/pixel-blast";
function Stage({ children, dark = true, }: {
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10" style={{
            background: dark ? "oklch(0.12 0.02 285)" : "oklch(0.97 0.005 285)",
        }}>
      {children}
    </div>);
}
export const pixelBlastShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative overflow-hidden container. The component comes with absolute inset-0 z-0; the default square lattice, the main color reads --color-primary, and the light and shade are adaptive.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <PixelBlast />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">PixelBlast</p>
  </div>
</div>`,
            render: () => (<Stage>
          <PixelBlast />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-2xl font-bold tracking-tight text-white/90">PixelBlast</p>
          </div>
        </Stage>),
        },
        {
            title: "Shape variant",
            description: "variant supports four pixel unit shapes square / circle / triangle / diamond, and pixelSize controls the single cell size.",
            code: `<>
  <PixelBlast variant="circle" pixelSize={6} />
  <PixelBlast variant="triangle" patternDensity={1.3} />
  <PixelBlast variant="diamond" pixelSize={5} />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <Stage>
            <PixelBlast variant="circle" pixelSize={6}/>
            <div className="relative z-10 flex h-full items-center justify-center">
              <p className="text-sm font-semibold text-white/70">circle · Dot printing feel</p>
            </div>
          </Stage>
          <Stage>
            <PixelBlast variant="triangle" patternDensity={1.3} patternScale={2.5}/>
            <div className="relative z-10 flex h-full items-center justify-center">
              <p className="text-sm font-semibold text-white/70">triangle · Textured</p>
            </div>
          </Stage>
          <Stage>
            <PixelBlast variant="diamond" pixelSizeJitter={0.5} pixelSize={5}/>
            <div className="relative z-10 flex h-full items-center justify-center">
              <p className="text-sm font-semibold text-white/70">diamond · Staggered particles</p>
            </div>
          </Stage>
        </div>),
        },
        {
            title: "Custom color + strong fade",
            description: "color is connected to any CSS color; edgeFade is increased to make the four corners fade out softer, making it easier to use the dot matrix as the content background.",
            code: `<PixelBlast
  variant="square"
  color="oklch(0.65 0.26 285)"
  speed={0.25}
  patternScale={1.5}
  edgeFade={0.7}
/>`,
            render: () => (<Stage>
          <PixelBlast variant="square" color="oklch(0.65 0.26 285)" speed={0.25} patternScale={1.5} edgeFade={0.7}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-violet-200/90">Aurora Blue Purple · Slow Wallpaper</p>
          </div>
        </Stage>),
        },
        {
            title: "No fade overlay",
            description: "edgeFade={0} Cancel the surrounding fade, and the hard edge of the dot matrix covers the entire container.",
            code: `<PixelBlast variant="circle" color="oklch(0.74 0.18 55)" edgeFade={0} pixelSize={5} />`,
            render: () => (<Stage>
          <PixelBlast variant="circle" color="oklch(0.74 0.18 55)" edgeFade={0} pixelSize={5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">edgeFade = 0 · Full</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "variant",
            type: "select",
            options: ["square", "circle", "triangle", "diamond"],
            defaultValue: "square",
            label: "Shape",
        },
        { prop: "pixelSize", type: "number", defaultValue: 4, label: "Pixel size" },
        { prop: "patternScale", type: "number", defaultValue: 2, label: "Noise Scaling" },
        { prop: "patternDensity", type: "number", defaultValue: 1, label: "Filling density" },
        { prop: "pixelSizeJitter", type: "number", defaultValue: 0, label: "Size jitter" },
        { prop: "speed", type: "number", defaultValue: 0.5, label: "Speed" },
        { prop: "edgeFade", type: "number", defaultValue: 0.5, label: "Edge fade" },
        { prop: "color", type: "text", defaultValue: "", label: "Custom color (leave blank=primary)" },
    ],
    states: [
        {
            name: "default (dark bottom\u00B7primary token\u00B7square)",
            render: () => (<Stage>
          <PixelBlast />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold tracking-tight text-white/90">PixelBlast</p>
            <p className="text-sm text-white/50">Dithering dot matrix WebGL background</p>
          </div>
        </Stage>),
        },
        {
            name: "Dots (circle \u00B7 pixelSize=6)",
            render: () => (<Stage>
          <PixelBlast variant="circle" pixelSize={6}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">circle · Dot printing feel</p>
          </div>
        </Stage>),
        },
        {
            name: "Triangular texture (triangle \u00B7 High density)",
            render: () => (<Stage>
          <PixelBlast variant="triangle" patternDensity={1.3} patternScale={2.5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">triangle · Textured</p>
          </div>
        </Stage>),
        },
        {
            name: "Diamond + size jitter (diamond \u00B7 jitter=0.5)",
            render: () => (<Stage>
          <PixelBlast variant="diamond" pixelSizeJitter={0.5} pixelSize={5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">diamond · Staggered particles</p>
          </div>
        </Stage>),
        },
        {
            name: "Customized Aurora Blue Purple + Slow Wallpaper",
            render: () => (<Stage>
          <PixelBlast variant="square" color="oklch(0.65 0.26 285)" speed={0.25} patternScale={1.5} edgeFade={0.7}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-violet-200/90">Aurora Blue Purple</p>
            <p className="text-xs text-white/40">Slow · Strong fade · Wallpaper level</p>
          </div>
        </Stage>),
        },
        {
            name: "No fade (edgeFade=0 \u00B7 Warm orange)",
            render: () => (<Stage>
          <PixelBlast variant="circle" color="oklch(0.74 0.18 55)" edgeFade={0} pixelSize={5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">edgeFade = 0 · Full</p>
          </div>
        </Stage>),
        },
        {
            name: "Light base (bright theme)",
            render: () => (<Stage dark={false}>
          <PixelBlast variant="square" color="oklch(0.55 0.2 270)" edgeFade={0.4}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-neutral-700">Light base · Custom color</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <PixelBlast variant={p.variant as "square" | "circle" | "triangle" | "diamond"} pixelSize={p.pixelSize as number} patternScale={p.patternScale as number} patternDensity={p.patternDensity as number} pixelSizeJitter={p.pixelSizeJitter as number} speed={p.speed as number} edgeFade={p.edgeFade as number} color={(p.color as string) || undefined}/>
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">PixelBlast · WebGL Background</p>
      </div>
    </Stage>),
    toCode: (p) => {
        const colorLine = p.color ? `
    color="${p.color}"` : "";
        return [
            `<div className="relative h-64 overflow-hidden rounded-xl"`,
            `     style={{ background: "oklch(0.12 0.02 285)" }}>`,
            `  <PixelBlast`,
            `    variant="${p.variant}"`,
            `    pixelSize={${p.pixelSize}}`,
            `    patternScale={${p.patternScale}}`,
            `    patternDensity={${p.patternDensity}}`,
            `    pixelSizeJitter={${p.pixelSizeJitter}}`,
            `    speed={${p.speed}}`,
            `    edgeFade={${p.edgeFade}}${colorLine}`,
            `  />`,
            `  <div className="relative z-10">Content</div>`,
            `</div>`,
        ].join("\n");
    },
};
