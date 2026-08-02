import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LiquidChrome } from "../../../../packages/ui/src/liquid-chrome/liquid-chrome";
function Frame({ height = "h-48", children, }: {
    height?: string;
    children?: React.ReactNode;
}) {
    return (<div className={`relative w-full overflow-hidden rounded-xl border border-border bg-surface ${height}`}>
      {children}
    </div>);
}
export const liquidChromeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "LiquidChrome itself is filled with absolute inset-0 and needs to be placed in the relative + overflow-hidden container; the default reading is --color-chart-2 following the theme.",
            code: `<div className="relative h-48 overflow-hidden rounded-xl">
  <LiquidChrome />
</div>`,
            render: () => (<Frame>
          <LiquidChrome />
        </Frame>),
        },
        {
            title: "Custom metallic color",
            description: "baseColor can pass [r, g, b] (0\u20131) array or CSS color string to bring out metallic textures such as dark blue/dark copper.",
            code: `<LiquidChrome baseColor={[0.18, 0.1, 0.03]} speed={0.25} amplitude={0.7} />`,
            render: () => (<Frame>
          <LiquidChrome baseColor={[0.18, 0.1, 0.03]} speed={0.25} amplitude={0.7} frequencyX={3.0} frequencyY={2.0}/>
        </Frame>),
        },
        {
            title: "High amplitude fast \u00B7 non-interactive",
            description: "interactive={false} Turn off mouse ripple; increase amplitude / speed to make the liquid level more intense.",
            code: `<LiquidChrome interactive={false} amplitude={0.9} speed={0.45} frequencyX={3.5} frequencyY={2.5} />`,
            render: () => (<Frame>
          <LiquidChrome interactive={false} amplitude={0.9} speed={0.45} frequencyX={3.5} frequencyY={2.5}/>
        </Frame>),
        },
        {
            title: "as Hero background layer",
            description: "Raise the container and use z-10 to overlay the content on the liquid background.",
            code: `<div className="relative h-72 overflow-hidden rounded-xl">
  <LiquidChrome speed={0.18} amplitude={0.55} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 text-center">
    <p className="text-2xl font-bold text-white drop-shadow-md">Liquid Chrome</p>
    <p className="text-sm text-white/70 drop-shadow">WebGL liquid chromium metal flow background</p>
  </div>
</div>`,
            render: () => (<Frame height="h-72">
          <LiquidChrome speed={0.18} amplitude={0.55}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-2xl font-bold text-white drop-shadow-md">Liquid Chrome</p>
            <p className="text-sm text-white/70 drop-shadow">
              WebGL Liquid chromium metal flow background
            </p>
          </div>
        </Frame>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 0.2 },
        { prop: "amplitude", type: "number", defaultValue: 0.6 },
        { prop: "frequencyX", type: "number", defaultValue: 2.5 },
        { prop: "frequencyY", type: "number", defaultValue: 1.5 },
        { prop: "interactive", type: "boolean", defaultValue: true },
    ],
    states: [
        {
            name: "default (chart-2 token \u00B7 Mouse interaction)",
            render: () => (<Frame>
          <LiquidChrome />
        </Frame>),
        },
        {
            name: "baseColor Array \u00B7 Dark Blue Metallic",
            render: () => (<Frame>
          <LiquidChrome baseColor={[0.03, 0.08, 0.22]} speed={0.15} amplitude={0.5}/>
        </Frame>),
        },
        {
            name: "baseColor Array \u00B7 Dark Bronze Gold",
            render: () => (<Frame>
          <LiquidChrome baseColor={[0.18, 0.1, 0.03]} speed={0.25} amplitude={0.7} frequencyX={3.0} frequencyY={2.0}/>
        </Frame>),
        },
        {
            name: "High amplitude \u00B7 Fast (amplitude=0.9, speed=0.45)",
            render: () => (<Frame>
          <LiquidChrome amplitude={0.9} speed={0.45} frequencyX={3.5} frequencyY={2.5}/>
        </Frame>),
        },
        {
            name: "Non-interactive (interactive=false)",
            render: () => (<Frame>
          <LiquidChrome interactive={false} amplitude={0.5} speed={0.2}/>
        </Frame>),
        },
        {
            name: "tall hero (make demo background layer)",
            render: () => (<Frame height="h-72">
          <LiquidChrome speed={0.18} amplitude={0.55}/>

          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-2xl font-bold text-white drop-shadow-md">Liquid Chrome</p>
            <p className="text-sm text-white/70 drop-shadow">
              WebGL Liquid chromium metal flow background
            </p>
          </div>
        </Frame>),
        },
        {
            name: "reduced-motion fallback (static gradient)",
            render: () => (<Frame>
          <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,var(--color-chart-1)_0%,var(--color-chart-2)_30%,var(--color-chart-3)_60%,var(--color-chart-4)_100%)]" aria-hidden/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/80">Static metal gradient fallback</p>
          </div>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <LiquidChrome speed={p.speed as number} amplitude={p.amplitude as number} frequencyX={p.frequencyX as number} frequencyY={p.frequencyY as number} interactive={p.interactive as boolean}/>
    </Frame>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl">`,
        `  <LiquidChrome`,
        `    speed={${p.speed}}`,
        `    amplitude={${p.amplitude}}`,
        `    frequencyX={${p.frequencyX}}`,
        `    frequencyY={${p.frequencyY}}`,
        `    interactive={${p.interactive}}`,
        `  />`,
        `  {/*Content layer (z-10 superimposed on the background)*/}`,
        `  <div className="relative z-10 flex h-full items-center justify-center">`,
        `    <p className="text-white text-xl font-bold">Your Content</p>`,
        `  </div>`,
        `</div>`,
    ].join("\n"),
};
