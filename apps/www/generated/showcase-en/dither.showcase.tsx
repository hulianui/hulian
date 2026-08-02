"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Dither } from "../../../../packages/ui/src/dither/dither";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const ditherShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative + overflow-hidden container. The component comes with absolute inset-0 z-0, and the content is stacked on top with z-10.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Dither />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    Dither
  </div>
</div>`,
            render: () => (<Stage>
          <Dither />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Dither
          </div>
        </Stage>),
        },
        {
            title: "Pixel Art (Coarse Mosaic)",
            description: "Increase pixelSize to make the dither particles thicker, and get the 8-bit retro texture with fewer color levels.",
            code: `<Dither pixelSize={6} colorNum={3} />`,
            render: () => (<Stage>
          <Dither pixelSize={6} colorNum={3}/>
        </Stage>),
        },
        {
            title: "Delicate color gradation",
            description: "colorNum The larger, the more color levels, and the smoother and more delicate the texture.",
            code: `<Dither colorNum={8} pixelSize={2} waveSpeed={0.08} />`,
            render: () => (<Stage>
          <Dither colorNum={8} pixelSize={2} waveSpeed={0.08}/>
        </Stage>),
        },
        {
            title: "Customized ripple color",
            description: "Pass waveColor to overwrite the default chart token; any CSS color (hex / oklch / rgb) is acceptable.",
            code: `<Dither waveColor="oklch(0.72 0.22 40)" colorNum={4} pixelSize={3} />`,
            render: () => (<Stage>
          <Dither waveColor="oklch(0.72 0.22 40)" colorNum={4} pixelSize={3}/>
        </Stage>),
        },
        {
            title: "Freeze still frame",
            description: "disableAnimation The frozen waveform is a static picture (equivalent to reduced-motion), suitable for static covers.",
            code: `<Dither disableAnimation waveColor="oklch(0.72 0.22 40)" />`,
            render: () => (<Stage>
          <Dither disableAnimation waveColor="oklch(0.72 0.22 40)"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "colorNum", type: "number", defaultValue: 4, label: "Quantized Levels" },
        { prop: "pixelSize", type: "number", defaultValue: 2, label: "Pixel block size" },
        { prop: "waveSpeed", type: "number", defaultValue: 0.05, label: "Ripple speed" },
        {
            prop: "disableAnimation",
            type: "boolean",
            defaultValue: false,
            label: "Freeze animation",
        },
    ],
    states: [
        {
            name: "default (default parameters)",
            render: () => (<Stage>
          <Dither />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Dither
          </div>
        </Stage>),
        },
        {
            name: "Coarse Mosaic (pixelSize 6 \u00B7 Pixel Art)",
            render: () => (<Stage>
          <Dither pixelSize={6} colorNum={3}/>
        </Stage>),
        },
        {
            name: "Multi-color gradation (colorNum 8 \u00B7 Delicate)",
            render: () => (<Stage>
          <Dither colorNum={8} pixelSize={2} waveSpeed={0.08}/>
        </Stage>),
        },
        {
            name: "Custom color (warm orange \u00B7 freeze frame)",
            render: () => (<Stage>
          <Dither waveColor="oklch(0.72 0.22 40)" colorNum={4} pixelSize={3} disableAnimation/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Dither colorNum={p.colorNum as number} pixelSize={p.pixelSize as number} waveSpeed={p.waveSpeed as number} disableAnimation={p.disableAnimation as boolean}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Dither
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <Dither`,
        `    colorNum={${p.colorNum}}`,
        `    pixelSize={${p.pixelSize}}`,
        `    waveSpeed={${p.waveSpeed}}`,
        `    disableAnimation={${p.disableAnimation}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
