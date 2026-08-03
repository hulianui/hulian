"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Aurora } from "../../../../packages/ui/src/aurora/aurora";
function Stage({ children, dark = true, }: {
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: dark ? "oklch(0.14 0.02 255)" : "oklch(0.97 0.005 255)" }}>
      {children}
    </div>);
}
export const auroraShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative + overflow-hidden container, Aurora is layered with absolute inset-0, and children is automatically layered on top of Aurora.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Aurora className="absolute inset-0 opacity-80">
    <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
      Aurora
    </div>
  </Aurora>
</div>`,
            render: () => (<Stage>
          <Aurora className="absolute inset-0 opacity-80">
            <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
              Aurora
            </div>
          </Aurora>
        </Stage>),
        },
        {
            title: "Custom ribbon",
            description: "Pass any CSS color via colors (supports chart token / oklch) and switch to warm orange tone.",
            code: `<Aurora
  colors={["var(--color-chart-3)", "var(--color-chart-1)", "oklch(0.72 0.22 30)"]}
  blur={40}
  speed={25}
  className="absolute inset-0 opacity-75"
/>`,
            render: () => (<Stage>
          <Aurora colors={["var(--color-chart-3)", "var(--color-chart-1)", "oklch(0.72 0.22 30)"]} blur={40} speed={25} className="absolute inset-0 opacity-75"/>
        </Stage>),
        },
        {
            title: "Blur and speed",
            description: "blur The larger the ribbon, the softer it is. The larger speed is, the slower the animation is. The combination creates a wallpaper-level delicate flow.",
            code: `<Aurora blur={60} speed={45} className="absolute inset-0 opacity-90">
  <div className="flex h-full flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/60">Enterprise level \u00B7 High quality \u00B7 Native adaptation </p>
  </div>
</Aurora>`,
            render: () => (<Stage>
          <Aurora blur={60} speed={45} className="absolute inset-0 opacity-90">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-lg font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/60">Enterprise-grade · High quality · Native-ready</p>
            </div>
          </Aurora>
        </Stage>),
        },
        {
            title: "Close Radial mask",
            description: "When showRadialMask={false}, the aurora covers the entire container and no longer fades toward the four corners.",
            code: `<Aurora showRadialMask={false} className="absolute inset-0 opacity-70" />`,
            render: () => (<Stage>
          <Aurora showRadialMask={false} className="absolute inset-0 opacity-70"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "blur", type: "number", defaultValue: 30, label: "Blur radius px" },
        { prop: "speed", type: "number", defaultValue: 20, label: "Animation seconds" },
        {
            prop: "showRadialMask",
            type: "boolean",
            defaultValue: true,
            label: "Radial mask",
        },
    ],
    states: [
        {
            name: "default (dark background \u00B7 default settings)",
            render: () => (<Stage>
          <Aurora className="absolute inset-0 opacity-80">
            <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
              Aurora
            </div>
          </Aurora>
        </Stage>),
        },
        {
            name: "Light base",
            render: () => (<Stage dark={false}>
          <Aurora className="absolute inset-0 opacity-60"/>
        </Stage>),
        },
        {
            name: "Custom ribbon (warm orange tone)",
            render: () => (<Stage>
          <Aurora colors={[
                    "var(--color-chart-3)",
                    "var(--color-chart-1)",
                    "oklch(0.72 0.22 30)",
                ]} blur={40} speed={25} className="absolute inset-0 opacity-75"/>
        </Stage>),
        },
        {
            name: "No radial mask (full)",
            render: () => (<Stage>
          <Aurora showRadialMask={false} className="absolute inset-0 opacity-70"/>
        </Stage>),
        },
        {
            name: "Low speed and high blur (wallpaper level)",
            render: () => (<Stage>
          <Aurora blur={60} speed={45} className="absolute inset-0 opacity-90">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-lg font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/60">Enterprise-grade · High quality · Native-ready</p>
            </div>
          </Aurora>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Aurora blur={p.blur as number} speed={p.speed as number} showRadialMask={p.showRadialMask as boolean} className="absolute inset-0 opacity-80">
        <div className="flex h-full items-center justify-center text-sm text-white/70">
          Aurora
        </div>
      </Aurora>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <Aurora`,
        `    blur={${p.blur}}`,
        `    speed={${p.speed}}`,
        `    showRadialMask={${p.showRadialMask}}`,
        `    className="absolute inset-0 opacity-80"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
