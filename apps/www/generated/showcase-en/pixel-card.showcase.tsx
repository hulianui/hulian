"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PixelCard } from "../../../../packages/ui/src/pixel-card/pixel-card";
function CardBody({ title, subtitle, }: {
    title: string;
    subtitle: string;
}) {
    return (<div className="flex flex-col items-center gap-1 px-6 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted">{subtitle}</p>
    </div>);
}
const variantOptions = ["default", "blue", "pink", "amber"] as const;
export const pixelCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "When hovering/focusing, the pixels grow ripple-like from the center outwards, shrinking and dissipating frame by frame.",
            code: `<PixelCard variant="default" className="h-48 w-64">
  <div className="flex flex-col items-center gap-1 px-6 text-center">
    <p className="text-base font-semibold text-foreground">Hulian Component Library</p>
    <p className="text-xs text-muted">Hover/focus trigger pixel animation</p>
  </div>
</PixelCard>`,
            render: () => (<PixelCard variant="default" className="h-48 w-64">
          <CardBody title="Hulian component library" subtitle="Hover/focus trigger pixel animation"/>
        </PixelCard>),
        },
        {
            title: "Default variant",
            description: "variant One-click switch gap / speed / Color combination: blue / pink / amber.",
            code: `<PixelCard variant="blue" className="h-48 w-64">
  \u2026
</PixelCard>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <PixelCard variant="blue" className="h-40 w-52">
            <CardBody title="blue" subtitle="chart-2 Blues"/>
          </PixelCard>
          <PixelCard variant="amber" className="h-40 w-52">
            <CardBody title="amber" subtitle="gap=3 Denser and more delicate"/>
          </PixelCard>
        </div>),
        },
        {
            title: "Customized color matching and speed",
            description: "colors / gap / speed Pass the value individually to override the variant default, feed token with --color- prefix.",
            code: `<PixelCard
  colors={[
    "var(--color-chart-5)",
    "var(--color-chart-4)",
    "var(--color-chart-1)",
  ]}
  gap={5}
  speed={18}
  className="h-48 w-64"
>
  \u2026
</PixelCard>`,
            render: () => (<PixelCard colors={[
                    "var(--color-chart-5)",
                    "var(--color-chart-4)",
                    "var(--color-chart-1)",
                ]} gap={5} speed={18} className="h-48 w-64">
          <CardBody title="Custom" subtitle="colors / gap / speed can be covered"/>
        </PixelCard>),
        },
        {
            title: "Disable focus triggering",
            description: "noFocus Only mouse hover triggers the animation, and the root container cannot be keyboard focused.",
            code: `<PixelCard variant="default" noFocus className="h-48 w-64">
  \u2026
</PixelCard>`,
            render: () => (<PixelCard variant="default" noFocus className="h-48 w-64">
          <CardBody title="Hover trigger only" subtitle="noFocus = true"/>
        </PixelCard>),
        },
    ],
    controls: [
        {
            prop: "variant",
            type: "select",
            options: [...variantOptions],
            defaultValue: "blue",
            label: "Variants",
        },
        { prop: "gap", type: "number", defaultValue: 6, label: "Pixel pitch px" },
        { prop: "speed", type: "number", defaultValue: 35, label: "Speed 0\u2013100" },
        { prop: "noFocus", type: "boolean", defaultValue: false, label: "Disable focus triggering" },
    ],
    states: [
        {
            name: "default (hover to see pixel growth)",
            render: () => (<PixelCard variant="default" className="h-48 w-64">
          <CardBody title="Hulian component library" subtitle="Hover/focus trigger pixel animation"/>
        </PixelCard>),
        },
        {
            name: "blue (chart-2 Blues)",
            render: () => (<PixelCard variant="blue" className="h-48 w-64">
          <CardBody title="Pixel Card" subtitle="Blues Pixel Ripple"/>
        </PixelCard>),
        },
        {
            name: "amber (dense warm orange)",
            render: () => (<PixelCard variant="amber" className="h-48 w-64">
          <CardBody title="Amber" subtitle="gap=3 Denser and more delicate"/>
        </PixelCard>),
        },
        {
            name: "Custom color + slow speed",
            render: () => (<PixelCard colors={[
                    "var(--color-chart-5)",
                    "var(--color-chart-4)",
                    "var(--color-chart-1)",
                ]} gap={5} speed={18} className="h-48 w-64">
          <CardBody title="Custom" subtitle="colors / gap / speed can be covered"/>
        </PixelCard>),
        },
    ],
    renderWithProps: (p) => (<PixelCard variant={p.variant as "default" | "blue" | "pink" | "amber"} gap={p.gap as number} speed={p.speed as number} noFocus={p.noFocus as boolean} className="h-48 w-64">
      <CardBody title="Pixel Card" subtitle="Hover to see the effect"/>
    </PixelCard>),
    toCode: (p) => [
        `<PixelCard`,
        `  variant="${p.variant}"`,
        `  gap={${p.gap}}`,
        `  speed={${p.speed}}`,
        `  noFocus={${p.noFocus}}`,
        `  className="h-48 w-64"`,
        `>`,
        `  <div className="text-center">\u2026</div>`,
        `</PixelCard>`,
    ].join("\n"),
};
