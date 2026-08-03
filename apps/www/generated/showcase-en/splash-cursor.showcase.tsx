"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SplashCursor } from "../../../../packages/ui/src/splash-cursor/splash-cursor";
function Stage({ children, hint = "Move / click mouse within this area", dark = true, }: {
    children: React.ReactNode;
    hint?: string;
    dark?: boolean;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: dark ? "oklch(0.14 0.02 255)" : "oklch(0.97 0.005 255)" }}>
      {children}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <span className={dark
            ? "text-sm font-medium text-white/55" : "text-sm font-medium text-foreground/55"}>
          {hint}
        </span>
      </div>
    </div>);
}
export const splashCursorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Place it in the relative container, drag the pointer to sputter the colored dye, and default to rainbow mode.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <SplashCursor />
</div>`,
            render: () => (<Stage>
          <SplashCursor />
        </Stage>),
        },
        {
            title: "Fixed theme color",
            description: "rainbow={false} Closes the hue cycle, and the single-color dye defaults to chart-1 token.",
            code: `<SplashCursor rainbow={false} />`,
            render: () => (<Stage hint="Single color dye · Eat chart-1 token">
          <SplashCursor rainbow={false}/>
        </Stage>),
        },
        {
            title: "Violent tailing",
            description: "High splatForce + High dissipation retention rate + large radius, swipe quickly to see long tails.",
            code: `<SplashCursor splatForce={1.8} dissipation={0.97} splatRadius={72} />`,
            render: () => (<Stage hint="Move quickly to see the long tail">
          <SplashCursor splatForce={1.8} dissipation={0.97} splatRadius={72}/>
        </Stage>),
        },
        {
            title: "Light and soft",
            description: "opacity Darken the content and stack it below the light content to avoid overpowering the content.",
            code: `<SplashCursor opacity={0.7} splatRadius={48} />`,
            render: () => (<Stage dark={false} hint="Light base can also be layered with colors">
          <SplashCursor opacity={0.7} splatRadius={48}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "rainbow", type: "boolean", defaultValue: true, label: "Rainbow Mode" },
        { prop: "splatRadius", type: "number", defaultValue: 56, label: "Sputtering radius px" },
        { prop: "splatForce", type: "number", defaultValue: 1, label: "Sputtering intensity" },
        { prop: "dissipation", type: "number", defaultValue: 0.92, label: "Retention rate 0-1" },
        { prop: "opacity", type: "number", defaultValue: 1, label: "Opacity" },
    ],
    states: [
        {
            name: "default (rainbow sputtering)",
            render: () => (<Stage>
          <SplashCursor />
        </Stage>),
        },
        {
            name: "Fixed theme color (chart token)",
            render: () => (<Stage hint="Single color dye · Eat chart-1 token">
          <SplashCursor rainbow={false}/>
        </Stage>),
        },
        {
            name: "Violent tailing (high intensity + slow dissipation)",
            render: () => (<Stage hint="Move quickly to see the long tail">
          <SplashCursor splatForce={1.8} dissipation={0.97} splatRadius={72}/>
        </Stage>),
        },
        {
            name: "Light color base \u00B7 Soft",
            render: () => (<Stage dark={false} hint="Light base can also be layered with colors">
          <SplashCursor opacity={0.7} splatRadius={48}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <SplashCursor rainbow={p.rainbow as boolean} splatRadius={p.splatRadius as number} splatForce={p.splatForce as number} dissipation={p.dissipation as number} opacity={p.opacity as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <SplashCursor`,
        `    rainbow={${p.rainbow}}`,
        `    splatRadius={${p.splatRadius}}`,
        `    splatForce={${p.splatForce}}`,
        `    dissipation={${p.dissipation}}`,
        `    opacity={${p.opacity}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
