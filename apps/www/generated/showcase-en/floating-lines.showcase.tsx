"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FloatingLines } from "../../../../packages/ui/src/floating-lines/floating-lines";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const floatingLinesShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Three sets of floating wire harness backgrounds, the lines produce radial bending and traction when the mouse is close; the default color is chart token.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <FloatingLines />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    FloatingLines
  </div>
</div>`,
            render: () => (<Stage>
          <FloatingLines />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            FloatingLines
          </div>
        </Stage>),
        },
        {
            title: "Intensive and slow (wallpaper level)",
            description: "Increase the size of lineCount to make the wiring harness denser, and adjust the size of animationSpeed to slow down, suitable for hero background overlay copywriting.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <FloatingLines lineCount={10} animationSpeed={0.6} lineDistance={4} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
    <p className="text-lg font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/60">Enterprise level \u00B7 High quality \u00B7 Native adaptation </p>
  </div>
</div>`,
            render: () => (<Stage>
          <FloatingLines lineCount={10} animationSpeed={0.6} lineDistance={4}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Enterprise-grade · High quality · Native-ready</p>
          </div>
        </Stage>),
        },
        {
            title: "Custom ribbon \u00B7 Off interaction",
            description: "colors Custom gradient ribbon; interactive=false Turn off pointer pulling to make a pure background.",
            code: `<FloatingLines
  colors={[
    "var(--color-chart-3)",
    "oklch(0.72 0.22 30)",
    "var(--color-chart-1)",
  ]}
  interactive={false}
  animationSpeed={1.4}
/>`,
            render: () => (<Stage>
          <FloatingLines colors={[
                    "var(--color-chart-3)",
                    "oklch(0.72 0.22 30)",
                    "var(--color-chart-1)",
                ]} interactive={false} animationSpeed={1.4}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "lineCount", type: "number", defaultValue: 6, label: "Number of lines in each group" },
        { prop: "lineDistance", type: "number", defaultValue: 5, label: "Line spacing" },
        { prop: "animationSpeed", type: "number", defaultValue: 1, label: "Speed multiplier" },
        { prop: "interactive", type: "boolean", defaultValue: true, label: "Pointer interaction" },
    ],
    states: [
        {
            name: "default (dark background \u00B7 default settings)",
            render: () => (<Stage>
          <FloatingLines />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            FloatingLines
          </div>
        </Stage>),
        },
        {
            name: "Intensive and slow (wallpaper level)",
            render: () => (<Stage>
          <FloatingLines lineCount={10} animationSpeed={0.6} lineDistance={4}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Enterprise-grade · High quality · Native-ready</p>
          </div>
        </Stage>),
        },
        {
            name: "Warm orange band \u00B7 Off interaction",
            render: () => (<Stage>
          <FloatingLines colors={[
                    "var(--color-chart-3)",
                    "oklch(0.72 0.22 30)",
                    "var(--color-chart-1)",
                ]} interactive={false} animationSpeed={1.4}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <FloatingLines lineCount={p.lineCount as number} lineDistance={p.lineDistance as number} animationSpeed={p.animationSpeed as number} interactive={p.interactive as boolean}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        FloatingLines
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <FloatingLines`,
        `    lineCount={${p.lineCount}}`,
        `    lineDistance={${p.lineDistance}}`,
        `    animationSpeed={${p.animationSpeed}}`,
        `    interactive={${p.interactive}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
