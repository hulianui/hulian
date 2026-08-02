import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ReflectiveCard } from "../../../../packages/ui/src/reflective-card/reflective-card";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex w-full items-center justify-center overflow-hidden rounded-xl border border-border p-8" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
export const reflectiveCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Out-of-the-box metal reflective ID card, with high-gloss strips sweeping back and forth along the diagonal, built-in by default on title / subtitle / footer.",
            code: `<ReflectiveCard />`,
            render: () => (<Stage>
          <ReflectiveCard />
        </Stage>),
        },
        {
            title: "Customized copywriting and color matching",
            description: "sheenColor controls the main highlight color, baseColor controls the base color, and title / subtitle / footer are all customizable.",
            code: `<ReflectiveCard
  sheenColor="oklch(0.85 0.16 85)"
  baseColor="var(--color-chart-3)"
  title="JANE SMITH"
  subtitle="PLATINUM MEMBER"
  footerLabel="MEMBER NO."
  footerValue="0042-7781-1190"
/>`,
            render: () => (<Stage>
          <ReflectiveCard sheenColor="oklch(0.85 0.16 85)" baseColor="var(--color-chart-3)" title="JANE SMITH" subtitle="PLATINUM MEMBER" footerLabel="MEMBER NO." footerValue="0042-7781-1190"/>
        </Stage>),
        },
        {
            title: "Metallic and frosted",
            description: "metalness controls the intensity of the highlight layer, roughness controls the frosted noise, and speed controls the highlight sweep duration (seconds).",
            code: `<ReflectiveCard metalness={0.4} roughness={0.8} speed={9} />`,
            render: () => (<Stage>
          <ReflectiveCard metalness={0.4} roughness={0.8} speed={9}/>
        </Stage>),
        },
        {
            title: "Custom content",
            description: "Passed by children Completely replaces the built-in layout, retaining only the metallic reflective background and borders.",
            code: `<ReflectiveCard baseColor="var(--color-chart-2)">
  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
    <p className="text-3xl font-bold tracking-widest">Hulian</p>
    <p className="text-xs uppercase tracking-[0.3em] opacity-70">
      Reflective Card
    </p>
  </div>
</ReflectiveCard>`,
            render: () => (<Stage>
          <ReflectiveCard baseColor="var(--color-chart-2)">
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-3xl font-bold tracking-widest">Hulian</p>
              <p className="text-xs uppercase tracking-[0.3em] opacity-70">
                Reflective Card
              </p>
            </div>
          </ReflectiveCard>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 6, label: "Highlight Seconds" },
        { prop: "roughness", type: "number", defaultValue: 0.35, label: "Matte 0\u20131" },
        { prop: "metalness", type: "number", defaultValue: 1, label: "Metallic 0\u20131" },
    ],
    states: [
        {
            name: "default (metal ID card)",
            render: () => (<Stage>
          <ReflectiveCard />
        </Stage>),
        },
        {
            name: "Warm golden highlight",
            render: () => (<Stage>
          <ReflectiveCard sheenColor="oklch(0.85 0.16 85)" baseColor="var(--color-chart-3)" title="JANE SMITH" subtitle="PLATINUM MEMBER" footerLabel="MEMBER NO." footerValue="0042-7781-1190"/>
        </Stage>),
        },
        {
            name: "Low metallic feel \u00B7 Heavy matte",
            render: () => (<Stage>
          <ReflectiveCard metalness={0.4} roughness={0.8} speed={9}/>
        </Stage>),
        },
        {
            name: "Custom content (children slot)",
            render: () => (<Stage>
          <ReflectiveCard baseColor="var(--color-chart-2)">
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-3xl font-bold tracking-widest">Hulian</p>
              <p className="text-xs uppercase tracking-[0.3em] opacity-70">
                Reflective Card
              </p>
            </div>
          </ReflectiveCard>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ReflectiveCard speed={p.speed as number} roughness={p.roughness as number} metalness={p.metalness as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="flex items-center justify-center rounded-xl p-8"`,
        `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
        `  <ReflectiveCard`,
        `    speed={${p.speed}}`,
        `    roughness={${p.roughness}}`,
        `    metalness={${p.metalness}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
