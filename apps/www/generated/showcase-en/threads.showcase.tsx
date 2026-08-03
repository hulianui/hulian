"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Threads } from "../../../../packages/ui/src/threads/threads";
function Stage({ children, height = "h-56", dark = true, }: {
    children: React.ReactNode;
    height?: string;
    dark?: boolean;
}) {
    return (<div className={`relative ${height} w-full max-w-2xl overflow-hidden rounded-xl border border-border`} style={{
            background: dark ? "oklch(0.10 0.015 265)" : "oklch(0.97 0.005 255)",
        }}>
      {children}
    </div>);
}
export const threadsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Threads is the absolute inset-0 background layer, placed in the relative + overflow-hidden container; the content layer is stacked on top with z-10. When not passing color, read --color-chart-1 and follow the topic.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.10 0.015 265)" }}>
  <Threads />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-sm font-medium text-white/60">Threads</p>
  </div>
</div>`,
            render: () => (<Stage>
          <Threads />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm font-medium text-white/60">Threads</p>
          </div>
        </Stage>),
        },
        {
            title: "Custom color",
            description: "color supports [r, g, b] array, hex, oklch, var(--token) etc. in any format.",
            code: `<Threads color="#f97316" amplitude={0.8} distance={0.5} />`,
            render: () => (<Stage>
          <Threads color="#f97316" amplitude={0.8} distance={0.5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">color="#f97316"</p>
          </div>
        </Stage>),
        },
        {
            title: "Amplitude and line spacing",
            description: "amplitude controls the wire swing, and distance increases the longitudinal spacing of each wire.",
            code: `<Threads color="var(--color-chart-3)" amplitude={2.5} distance={0.3} />`,
            render: () => (<Stage>
          <Threads color="var(--color-chart-3)" amplitude={2.5} distance={0.3}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">amplitude=2.5</p>
          </div>
        </Stage>),
        },
        {
            title: "Disable mouse interaction",
            description: "enableMouseInteraction={false} The rear silk thread no longer changes with the pointer, suitable for purely decorative backgrounds.",
            code: `<Threads enableMouseInteraction={false} />`,
            render: () => (<Stage>
          <Threads enableMouseInteraction={false}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">enableMouseInteraction=false</p>
          </div>
        </Stage>),
        },
        {
            title: "Hero Large card",
            description: "Raise the container and overlay the title and sub-copy to form the first screen background.",
            code: `<div className="relative h-80 overflow-hidden rounded-xl">
  <Threads color={[0.18, 0.45, 0.88]} amplitude={1.4} distance={0.2} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 text-center">
    <h2 className="text-2xl font-bold text-white">Hulian Component Library</h2>
    <p className="max-w-sm text-sm text-white/60">Enterprise level \u00B7 High quality \u00B7 Native adaptive light and dark themes</p>
  </div>
</div>`,
            render: () => (<Stage height="h-80">
          <Threads color={[0.18, 0.45, 0.88]} amplitude={1.4} distance={0.2}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <h2 className="text-2xl font-bold text-white">Hulian component library</h2>
            <p className="max-w-sm text-sm text-white/60">
              Enterprise level · High quality · Native adaptation to light and dark themes
            </p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "amplitude",
            type: "number",
            defaultValue: 1,
            label: "Amplitude (amplitude)",
        },
        {
            prop: "distance",
            type: "number",
            defaultValue: 0,
            label: "Line spacing (distance)",
        },
        {
            prop: "enableMouseInteraction",
            type: "boolean",
            defaultValue: true,
            label: "Mouse interaction",
        },
    ],
    states: [
        {
            name: "Default (dark background \u00B7 chart-1 color)",
            render: () => (<Stage>
          <Threads />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm font-medium text-white/60">Threads</p>
          </div>
        </Stage>),
        },
        {
            name: "Blue tone \u00B7 Array color",
            render: () => (<Stage>
          <Threads color={[0.22, 0.53, 0.96]} amplitude={1.2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">color=[0.22, 0.53, 0.96]</p>
          </div>
        </Stage>),
        },
        {
            name: "Warm orange \u00B7 CSS hex",
            render: () => (<Stage>
          <Threads color="#f97316" amplitude={0.8} distance={0.5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">color="#f97316"</p>
          </div>
        </Stage>),
        },
        {
            name: "chart-3 token \u00B7 High amplitude",
            render: () => (<Stage>
          <Threads color="var(--color-chart-3)" amplitude={2.5} distance={0.3}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">amplitude=2.5</p>
          </div>
        </Stage>),
        },
        {
            name: "Widen the line spacing \u00B7 distance=1.5",
            render: () => (<Stage>
          <Threads amplitude={1} distance={1.5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">distance=1.5</p>
          </div>
        </Stage>),
        },
        {
            name: "Disable mouse interaction",
            render: () => (<Stage>
          <Threads enableMouseInteraction={false}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/50">enableMouseInteraction=false</p>
          </div>
        </Stage>),
        },
        {
            name: "Light base",
            render: () => (<Stage dark={false}>
          <Threads color="var(--color-chart-1)" amplitude={1.2}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-foreground/50">Light color container</p>
          </div>
        </Stage>),
        },
        {
            name: "Hero usage example (large card)",
            render: () => (<Stage height="h-80">
          <Threads color={[0.18, 0.45, 0.88]} amplitude={1.4} distance={0.2}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <h2 className="text-2xl font-bold text-white">Hulian component library</h2>
            <p className="max-w-sm text-sm text-white/60">
              Enterprise level · High quality · Native adaptation to light and dark themes
            </p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Threads amplitude={p.amplitude as number} distance={p.distance as number} enableMouseInteraction={p.enableMouseInteraction as boolean}/>
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm text-white/50">Threads</p>
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.10 0.015 265)" }}>`,
        `  <Threads`,
        `    amplitude={${p.amplitude}}`,
        `    distance={${p.distance}}`,
        `    enableMouseInteraction={${p.enableMouseInteraction}}`,
        `  />`,
        `  {/* Content overlaid on z-10 */}`,
        `  <div className="relative z-10">\u2026</div>`,
        `</div>`,
    ].join("\n"),
};
