"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PixelSnow } from "../../../../packages/ui/src/pixel-snow/pixel-snow";
import type { PixelSnowVariant } from "../../../../packages/ui/src/pixel-snow/pixel-snow.types";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.13 0.02 255)" }}>
      {children}
    </div>);
}
export const pixelSnowShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative overflow-hidden container; the default square pixel snow, the color is adaptive according to the brightness of the background behind you (dark bright snow / light dark snow).",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <PixelSnow />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    PixelSnow
  </div>
</div>`,
            render: () => (<Stage>
          <PixelSnow />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            PixelSnow
          </div>
        </Stage>),
        },
        {
            title: "Shape variant",
            description: "variant supports three snowflake shapes: square (square) / round (dot) / snowflake (six-armed snowflake).",
            code: `<>
  <PixelSnow variant="snowflake" density={0.45} speed={1.6} />
  <PixelSnow variant="round" pixelResolution={90} density={0.4} />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <Stage>
            <PixelSnow variant="snowflake" density={0.45} speed={1.6}/>
          </Stage>
          <Stage>
            <PixelSnow variant="round" pixelResolution={90} density={0.4}/>
          </Stage>
        </div>),
        },
        {
            title: "Retro large mosaic",
            description: "Decrease pixelResolution (the number of \"large pixels\" cut horizontally) to make the mosaic blocks larger and have a stronger retro feel.",
            code: `<PixelSnow variant="round" pixelResolution={90} density={0.4} />`,
            render: () => (<Stage>
          <PixelSnow variant="round" pixelResolution={90} density={0.4}/>
        </Stage>),
        },
        {
            title: "Customized cold blue \u00B7 slow wallpaper",
            description: "color Connect to any CSS color to lock the snowflake tone; slow speed + moderate density as the snow background of the title area.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <PixelSnow color="oklch(0.85 0.08 230)" speed={0.7} density={0.3} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
    <p className="text-lg font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/60">Pixel Snow \u00B7 Light and Dark Adaptive</p>
  </div>
</div>`,
            render: () => (<Stage>
          <PixelSnow color="oklch(0.85 0.08 230)" speed={0.7} density={0.3}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Pixel Snow · Light and Dark Adaptive</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "variant",
            type: "select",
            options: ["square", "round", "snowflake"],
            defaultValue: "square",
            label: "Snowflake shape",
        },
        { prop: "density", type: "number", defaultValue: 0.3, label: "Density 0\u20130.6" },
        { prop: "speed", type: "number", defaultValue: 1.25, label: "Falling speed" },
        {
            prop: "pixelResolution",
            type: "number",
            defaultValue: 200,
            label: "Pixel resolution",
        },
        { prop: "direction", type: "number", defaultValue: 125, label: "Wind direction angle\u00B0" },
    ],
    states: [
        {
            name: "default (block pixel snow)",
            render: () => (<Stage>
          <PixelSnow />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            PixelSnow
          </div>
        </Stage>),
        },
        {
            name: "Six-arm snowflake \u00B7 High density",
            render: () => (<Stage>
          <PixelSnow variant="snowflake" density={0.45} speed={1.6}/>
        </Stage>),
        },
        {
            name: "Polka dot snow \u00B7 Large mosaic (retro)",
            render: () => (<Stage>
          <PixelSnow variant="round" pixelResolution={90} density={0.4}/>
        </Stage>),
        },
        {
            name: "Custom cold blue \u00B7 Slow wallpaper",
            render: () => (<Stage>
          <PixelSnow color="oklch(0.85 0.08 230)" speed={0.7} density={0.3}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Pixel Snow · Light and Dark Adaptive</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <PixelSnow variant={p.variant as PixelSnowVariant} density={p.density as number} speed={p.speed as number} pixelResolution={p.pixelResolution as number} direction={p.direction as number}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        PixelSnow
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.13 0.02 255)" }}>`,
        `  <PixelSnow`,
        `    variant="${p.variant}"`,
        `    density={${p.density}}`,
        `    speed={${p.speed}}`,
        `    pixelResolution={${p.pixelResolution}}`,
        `    direction={${p.direction}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
