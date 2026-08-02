"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ElectricBorder } from "../../../../packages/ui/src/electric-border/electric-border";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex min-h-48 w-full max-w-md items-center justify-center rounded-xl border border-border p-10" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const electricBorderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Use ElectricBorder to wrap any content, and you will get a circle of electrified and beating borders.",
            code: `<ElectricBorder borderRadius={16}>
  <div className="px-8 py-6 text-sm font-medium">Electric Border</div>
</ElectricBorder>`,
            render: () => (<Stage>
          <ElectricBorder borderRadius={16}>
            <div className="px-8 py-6 text-sm font-medium text-white/85">
              Electric Border
            </div>
          </ElectricBorder>
        </Stage>),
        },
        {
            title: "Speed and Chaos",
            description: "speed controls the jitter speed, chaos controls the intensity of arc tearing.",
            code: `<ElectricBorder chaos={2} speed={2} borderRadius={20}>
  <div className="px-8 py-6 text-sm">Discharging</div>
</ElectricBorder>`,
            render: () => (<Stage>
          <ElectricBorder chaos={2} speed={2} borderRadius={20}>
            <div className="px-8 py-6 text-sm text-white/80">Discharging</div>
          </ElectricBorder>
        </Stage>),
        },
        {
            title: "Custom colors and rounded corners",
            description: "color Eat any CSS color (it is recommended to use var(--color-...) token), set the maximum value for borderRadius to make a capsule.",
            code: `<ElectricBorder color="var(--color-chart-3)" borderRadius={999} thickness={2}>
  <button type="button" className="px-6 py-3 text-sm font-semibold">
    Try it now
  </button>
</ElectricBorder>`,
            render: () => (<Stage>
          <ElectricBorder color="var(--color-chart-3)" borderRadius={999} thickness={2}>
            <button type="button" className="px-6 py-3 text-sm font-semibold text-white">
              Try it now
            </button>
          </ElectricBorder>
        </Stage>),
        },
        {
            title: "Thick Halo Wrapped Card",
            description: "thickness Enlarge the soft edge to make the glow more obvious, suitable for emphasizing key cards.",
            code: `<ElectricBorder thickness={3} chaos={1.4} borderRadius={14}>
  <div className="w-56 space-y-1 px-5 py-4">
    <p className="text-sm font-semibold">Hulian Component Library</p>
    <p className="text-xs opacity-60">Powered bezel \u00B7 Zero dependence on SVG turbulence</p>
  </div>
</ElectricBorder>`,
            render: () => (<Stage>
          <ElectricBorder thickness={3} chaos={1.4} borderRadius={14}>
            <div className="w-56 space-y-1 px-5 py-4">
              <p className="text-sm font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/60">
                Powered Bezel · Zero Dependence SVG Turbulence
              </p>
            </div>
          </ElectricBorder>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 1, label: "Jitter speed" },
        { prop: "chaos", type: "number", defaultValue: 1, label: "Degree of disorder" },
        { prop: "thickness", type: "number", defaultValue: 2, label: "Halo thickness px" },
        { prop: "borderRadius", type: "number", defaultValue: 16, label: "Rounded corners px" },
    ],
    states: [
        {
            name: "default (main color arc)",
            render: () => (<Stage>
          <ElectricBorder borderRadius={16}>
            <div className="px-8 py-6 text-sm font-medium text-white/85">
              Electric Border
            </div>
          </ElectricBorder>
        </Stage>),
        },
        {
            name: "High turbulence + fast jitter",
            render: () => (<Stage>
          <ElectricBorder chaos={2} speed={2} borderRadius={20}>
            <div className="px-8 py-6 text-sm text-white/80">Discharging</div>
          </ElectricBorder>
        </Stage>),
        },
        {
            name: "Warm color + round button",
            render: () => (<Stage>
          <ElectricBorder color="var(--color-chart-3)" borderRadius={999} thickness={2}>
            <button type="button" className="px-6 py-3 text-sm font-semibold text-white">
              Try it now
            </button>
          </ElectricBorder>
        </Stage>),
        },
        {
            name: "Card Wrapped (Thick Halo)",
            render: () => (<Stage>
          <ElectricBorder thickness={3} chaos={1.4} borderRadius={14}>
            <div className="w-56 space-y-1 px-5 py-4">
              <p className="text-sm font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/60">Powered Bezel · Zero Dependence SVG Turbulence</p>
            </div>
          </ElectricBorder>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ElectricBorder speed={p.speed as number} chaos={p.chaos as number} thickness={p.thickness as number} borderRadius={p.borderRadius as number}>
        <div className="px-8 py-6 text-sm text-white/80">Electric Border</div>
      </ElectricBorder>
    </Stage>),
    toCode: (p) => [
        `<ElectricBorder`,
        `  speed={${p.speed}}`,
        `  chaos={${p.chaos}}`,
        `  thickness={${p.thickness}}`,
        `  borderRadius={${p.borderRadius}}`,
        `>`,
        `  <div className="px-8 py-6">Electric Border</div>`,
        `</ElectricBorder>`,
    ].join("\n"),
};
