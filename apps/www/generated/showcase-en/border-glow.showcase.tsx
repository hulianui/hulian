"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BorderGlow } from "../../../../packages/ui/src/border-glow/border-glow";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex min-h-64 w-full items-center justify-center rounded-xl p-12" style={{ background: "oklch(0.13 0.02 280)" }}>
      {children}
    </div>);
}
function CardBody({ title, desc }: {
    title: string;
    desc: string;
}) {
    return (<div className="w-64 p-7">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-1.5 text-sm text-white/55">{desc}</p>
    </div>);
}
export const borderGlowShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Move the pointer over the card, and the border will light up along the light cone. A dark background is required.",
            code: `<div
  className="rounded-xl p-12"
  style={{ background: "oklch(0.13 0.02 280)" }}
>
  <BorderGlow>
    <div className="w-64 p-7">
      <p className="text-base font-semibold text-white">Hulian Component Library</p>
      <p className="mt-1.5 text-sm text-white/55">Move the pointer over the card, and the border will light up along the light cone. </p>
    </div>
  </BorderGlow>
</div>`,
            render: () => (<Stage>
          <BorderGlow>
            <CardBody title="Hulian component library" desc="Move the pointer over the card and the border will light up along the light cone."/>
          </BorderGlow>
        </Stage>),
        },
        {
            title: "Mount automatic scanning",
            description: "When animated is mounted, it will scan around the edge without a pointer; when reduced-motion is used, it will be skipped automatically.",
            code: `<BorderGlow animated>
  <div className="w-64 p-7">
    <p className="text-base font-semibold text-white">Automatic scanning</p>
    <p className="mt-1.5 text-sm text-white/55">Automatically wrap around the edge when mounting. </p>
  </div>
</BorderGlow>`,
            render: () => (<Stage>
          <BorderGlow animated>
            <CardBody title="Automatic scanning" desc="Automatically circle the edge when mounting, skipping under reduced-motion."/>
          </BorderGlow>
        </Stage>),
        },
        {
            title: "Customized glow color",
            description: "glowColor / colors all go to chart token, automatically take the light and dark theme.",
            code: `<BorderGlow
  glowColor="var(--color-chart-2)"
  colors={[
    "var(--color-chart-2)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ]}
  glowRadius={56}
>
  <div className="w-64 p-7">
    <p className="text-base font-semibold text-white">Cyan neon</p>
  </div>
</BorderGlow>`,
            render: () => (<Stage>
          <BorderGlow glowColor="var(--color-chart-2)" colors={[
                    "var(--color-chart-2)",
                    "var(--color-chart-4)",
                    "var(--color-chart-5)",
                ]} glowRadius={56}>
            <CardBody title="Cyan neon" desc="Glow color/Grid color full range chart token."/>
          </BorderGlow>
        </Stage>),
        },
        {
            title: "High sensitivity + strong halo",
            description: "Turn down edgeSensitivity to trigger earlier, turn up glowIntensity / coneSpread to strengthen the highlight arc.",
            code: `<BorderGlow
  edgeSensitivity={10}
  glowIntensity={1.6}
  coneSpread={40}
>
  <div className="w-64 p-7">
    <p className="text-base font-semibold text-white">High energy frame</p>
  </div>
</BorderGlow>`,
            render: () => (<Stage>
          <BorderGlow edgeSensitivity={10} glowIntensity={1.6} coneSpread={40}>
            <CardBody title="High energy frame" desc="Earlier trigger, stronger halo, wider highlight arc."/>
          </BorderGlow>
        </Stage>),
        },
    ],
    controls: [
        { prop: "edgeSensitivity", type: "number", defaultValue: 30, label: "Edge sensitivity" },
        { prop: "glowRadius", type: "number", defaultValue: 40, label: "Halo radius px" },
        { prop: "glowIntensity", type: "number", defaultValue: 1, label: "Halo intensity" },
        { prop: "coneSpread", type: "number", defaultValue: 25, label: "Light cone width" },
        { prop: "borderRadius", type: "number", defaultValue: 28, label: "Rounded corners px" },
        { prop: "animated", type: "boolean", defaultValue: false, label: "Mount scanning" },
    ],
    states: [
        {
            name: "default (move in the card and light the border along the pointer)",
            render: () => (<Stage>
          <BorderGlow>
            <CardBody title="Hulian component library" desc="Move the pointer over the card and the border will light up along the light cone."/>
          </BorderGlow>
        </Stage>),
        },
        {
            name: "Mount automatic scanning (animated)",
            render: () => (<Stage>
          <BorderGlow animated>
            <CardBody title="Automatic scanning" desc="Automatically circle the edge when mounting, skipping under reduced-motion."/>
          </BorderGlow>
        </Stage>),
        },
        {
            name: "Customized luminous color (chart-2 blue tone)",
            render: () => (<Stage>
          <BorderGlow glowColor="var(--color-chart-2)" colors={[
                    "var(--color-chart-2)",
                    "var(--color-chart-4)",
                    "var(--color-chart-5)",
                ]} glowRadius={56}>
            <CardBody title="Cyan neon" desc="Glow color/Grid color full range chart token."/>
          </BorderGlow>
        </Stage>),
        },
        {
            name: "High sensitivity + strong halo",
            render: () => (<Stage>
          <BorderGlow edgeSensitivity={10} glowIntensity={1.6} coneSpread={40}>
            <CardBody title="High energy frame" desc="Earlier trigger, stronger halo, wider highlight arc."/>
          </BorderGlow>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <BorderGlow edgeSensitivity={p.edgeSensitivity as number} glowRadius={p.glowRadius as number} glowIntensity={p.glowIntensity as number} coneSpread={p.coneSpread as number} borderRadius={p.borderRadius as number} animated={p.animated as boolean}>
        <CardBody title="Hulian BorderGlow" desc="Move in or turn on scanning to view the luminous border."/>
      </BorderGlow>
    </Stage>),
    toCode: (p) => [
        `<div className="rounded-xl p-12" style={{ background: "oklch(0.13 0.02 280)" }}>`,
        `  <BorderGlow`,
        `    edgeSensitivity={${p.edgeSensitivity}}`,
        `    glowRadius={${p.glowRadius}}`,
        `    glowIntensity={${p.glowIntensity}}`,
        `    coneSpread={${p.coneSpread}}`,
        `    borderRadius={${p.borderRadius}}`,
        `    animated={${p.animated}}`,
        `  >`,
        `    <div className="w-64 p-7">\u2026</div>`,
        `  </BorderGlow>`,
        `</div>`,
    ].join("\n"),
};
