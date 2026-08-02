"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Lightfall } from "../../../../packages/ui/src/lightfall/lightfall";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.13 0.02 265)" }}>
      {children}
    </div>);
}
export const lightfallShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The component comes with absolute inset-0 z-0, just put it into the relative dark container.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <Lightfall />
  <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
    Lightfall
  </div>
</div>`,
            render: () => (<Stage>
          <Lightfall />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Lightfall
          </div>
        </Stage>),
        },
        {
            title: "Dense multi-beam (warm orange tone)",
            description: "streakCount plus beam + custom warm color colors, density density adjustment.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <Lightfall
    streakCount={6}
    density={1.2}
    colors={[
      "var(--color-chart-3)",
      "var(--color-chart-1)",
      "oklch(0.74 0.2 35)",
    ]}
    glow={1.3}
  />
</div>`,
            render: () => (<Stage>
          <Lightfall streakCount={6} density={1.2} colors={[
                    "var(--color-chart-3)",
                    "var(--color-chart-1)",
                    "oklch(0.74 0.2 35)",
                ]} glow={1.3}/>
        </Stage>),
        },
        {
            title: "Wallpaper level (slow speed\u00B7long tail\u00B7no interaction)",
            description: "speed slows down + streakLength stretches, turns off mouseInteraction as a static background.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <Lightfall
    speed={0.25}
    streakCount={3}
    streakLength={1.8}
    backgroundGlow={0.8}
    mouseInteraction={false}
  />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/60">Enterprise level \u00B7 High quality \u00B7 Native adaptation </p>
  </div>
</div>`,
            render: () => (<Stage>
          <Lightfall speed={0.25} streakCount={3} streakLength={1.8} backgroundGlow={0.8} mouseInteraction={false}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Enterprise-grade · High quality · Native-ready</p>
          </div>
        </Stage>),
        },
        {
            title: "Stable and always bright (thin beam)",
            description: "twinkle=0 turns off light and dark breathing, streakWidth adjusts fine.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <Lightfall twinkle={0} streakWidth={0.7} streakCount={4} />
</div>`,
            render: () => (<Stage>
          <Lightfall twinkle={0} streakWidth={0.7} streakCount={4}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "streakCount", type: "number", defaultValue: 2, label: "Number of beams" },
        { prop: "speed", type: "number", defaultValue: 0.5, label: "Fall speed" },
        { prop: "glow", type: "number", defaultValue: 1, label: "Glow intensity" },
        {
            prop: "mouseInteraction",
            type: "boolean",
            defaultValue: true,
            label: "Mouse interaction",
        },
    ],
    states: [
        {
            name: "default (dark background \u00B7 default settings)",
            render: () => (<Stage>
          <Lightfall />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Lightfall
          </div>
        </Stage>),
        },
        {
            name: "Dense multi-beam (warm orange tone)",
            render: () => (<Stage>
          <Lightfall streakCount={6} density={1.2} colors={[
                    "var(--color-chart-3)",
                    "var(--color-chart-1)",
                    "oklch(0.74 0.2 35)",
                ]} glow={1.3}/>
        </Stage>),
        },
        {
            name: "Slow wallpaper level (long tail\u00B7no interaction)",
            render: () => (<Stage>
          <Lightfall speed={0.25} streakCount={3} streakLength={1.8} backgroundGlow={0.8} mouseInteraction={false}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Enterprise-grade · High quality · Native-ready</p>
          </div>
        </Stage>),
        },
        {
            name: "Stable and always bright (twinkle=0\u00B7Thin beam)",
            render: () => (<Stage>
          <Lightfall twinkle={0} streakWidth={0.7} streakCount={4}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Lightfall streakCount={p.streakCount as number} speed={p.speed as number} glow={p.glow as number} mouseInteraction={p.mouseInteraction as boolean}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Lightfall
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.13 0.02 265)" }}>`,
        `  <Lightfall`,
        `    streakCount={${p.streakCount}}`,
        `    speed={${p.speed}}`,
        `    glow={${p.glow}}`,
        `    mouseInteraction={${p.mouseInteraction}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
