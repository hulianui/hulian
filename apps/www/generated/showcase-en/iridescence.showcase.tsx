"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Iridescence } from "../../../../packages/ui/src/iridescence/iridescence";
function Stage({ dark = true, children, height = "h-56", }: {
    dark?: boolean;
    children: React.ReactNode;
    height?: string;
}) {
    return (<div className={`relative ${height} w-full max-w-xl overflow-hidden rounded-xl border border-border`} style={{ background: dark ? "oklch(0.12 0.02 265)" : "oklch(0.96 0.005 265)" }}>
      {children}
    </div>);
}
export const iridescenceShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Iridescence is the background layer of absolute inset-0, which needs to be placed in the relative + overflow-hidden container, and the content is stacked on top with absolute.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 265)" }}>
  <Iridescence />
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-sm font-medium text-white/80">Iridescence</span>
  </div>
</div>`,
            render: () => (<Stage>
          <Iridescence />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-white/80 select-none">
              Iridescence
            </span>
          </div>
        </Stage>),
        },
        {
            title: "Custom color",
            description: "color accepts any CSS color string (hex / oklch / hsl / var(--token)); automatically read when not passed --color-chart-3 Follow the topic.",
            code: `<Iridescence color="oklch(0.72 0.22 50)" speed={0.8} />`,
            render: () => (<Stage>
          <Iridescence color="oklch(0.72 0.22 50)" speed={0.8}/>
        </Stage>),
        },
        {
            title: "RGB array color \u00B7 high speed disturbance",
            description: "color can also pass [r, g, b] (0\u20131 range) array; increase speed / amplitude to make the flow more intense.",
            code: `<Iridescence color={[0.3, 0.6, 1.0]} speed={1.5} amplitude={0.2} />`,
            render: () => (<Stage>
          <Iridescence color={[0.3, 0.6, 1.0]} speed={1.5} amplitude={0.2}/>
        </Stage>),
        },
        {
            title: "Wallpaper level (turn off mouse response)",
            description: "mouseReact={false} Let uMouse be fixed, and with low speed it is suitable for quiet Hero background.",
            code: `<div className="relative h-72 overflow-hidden rounded-xl">
  <Iridescence speed={0.3} mouseReact={false} />
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">Tide</p>
    <p className="text-xs text-white/50">Hulian component library \u00B7 Enterprise level \u00B7 High quality</p>
  </div>
</div>`,
            render: () => (<Stage height="h-72">
          <Iridescence speed={0.3} mouseReact={false}/>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white drop-shadow-sm">
              Tide
            </p>
            <p className="text-xs text-white/50">
              Hulian component library · Enterprise level · High quality
            </p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "speed",
            type: "number",
            defaultValue: 1,
            label: "Speed multiplier",
        },
        {
            prop: "amplitude",
            type: "number",
            defaultValue: 0.1,
            label: "Mouse offset range",
        },
        {
            prop: "mouseReact",
            type: "boolean",
            defaultValue: true,
            label: "Respond to mouse",
        },
    ],
    states: [
        {
            name: "default (dark background \u00B7 default parameters)",
            render: () => (<Stage>
          <Iridescence />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-white/80 select-none">
              Iridescence
            </span>
          </div>
        </Stage>),
        },
        {
            name: "Light base",
            render: () => (<Stage dark={false}>
          <Iridescence />
        </Stage>),
        },
        {
            name: "Custom color (warm orange CSS string)",
            render: () => (<Stage>
          <Iridescence color="oklch(0.72 0.22 50)" speed={0.8}/>
        </Stage>),
        },
        {
            name: "Custom color (RGB array \u00B7 cold blue)",
            render: () => (<Stage>
          <Iridescence color={[0.3, 0.6, 1.0]} speed={1.5} amplitude={0.2}/>
        </Stage>),
        },
        {
            name: "High speed \u00B7 Strong mouse disturbance",
            render: () => (<Stage>
          <Iridescence speed={3} amplitude={0.4}/>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/60 select-none">
              speed=3 · amplitude=0.4
            </span>
          </div>
        </Stage>),
        },
        {
            name: "Low speed \u00B7 Turn off mouse (wallpaper level)",
            render: () => (<Stage height="h-72">
          <Iridescence speed={0.3} mouseReact={false}/>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white drop-shadow-sm">
              Tide
            </p>
            <p className="text-xs text-white/50">
              Hulian component library · Enterprise level · High quality
            </p>
          </div>
        </Stage>),
        },
        {
            name: "reduced-motion fallback (static iridescent gradient)",
            render: () => (<Stage>
          <div aria-hidden className="absolute inset-0 z-0 pointer-events-none bg-[conic-gradient(from_0deg_at_50%_50%,var(--color-chart-1)_0%,var(--color-chart-2)_25%,var(--color-chart-3)_50%,var(--color-chart-4)_75%,var(--color-chart-1)_100%)] opacity-60"/>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/70 select-none">
              Static downgrade (without WebGL / reduced-motion)
            </span>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Iridescence speed={p.speed as number} amplitude={p.amplitude as number} mouseReact={p.mouseReact as boolean}/>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-white/70 select-none">Iridescence</span>
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.12 0.02 265)" }}>`,
        `  <Iridescence`,
        `    speed={${p.speed}}`,
        `    amplitude={${p.amplitude}}`,
        `    mouseReact={${p.mouseReact}}`,
        `  />`,
        `  {/* Content is stacked on top of WebGL canvas */}`,
        `  <div className="absolute inset-0 flex items-center justify-center">`,
        `    <h2 className="text-2xl font-bold text-white">Hero Title</h2>`,
        `  </div>`,
        `</div>`,
    ].join("\n"),
};
