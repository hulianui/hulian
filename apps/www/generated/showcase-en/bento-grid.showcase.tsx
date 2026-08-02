"use client";
import { Zap, Shield, Globe, Sparkles } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BentoGrid, BentoCard } from "../../../../packages/ui/src/bento-grid/bento-grid";
function Demo() {
    return (<BentoGrid className="w-full max-w-2xl">
      <BentoCard className="sm:col-span-2" icon={<Zap />} title="Extreme speed" description="Pure CSS first, zero runtime overhead"/>
      <BentoCard icon={<Shield />} title="Reliable" description="WAI-ARIA + test coverage"/>
      <BentoCard icon={<Globe />} title="Theme" description="OKLCH Light and dark double layer token"/>
      <BentoCard className="sm:col-span-2" icon={<Sparkles />} title="Composable building blocks" description="Learn from the strengths of others and unify them into one set of Hulian API"/>
    </BentoGrid>);
}
export const bentoGridShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "BentoGrid defines the staggered grid, and BentoCard carries the icon/title/description.",
            code: `<BentoGrid>
  <BentoCard icon={<Zap />} title="Extremely fast" description="Pure CSS first, zero runtime overhead" />
  <BentoCard icon={<Shield />} title="Reliable" description="WAI-ARIA + Test Coverage" />
  <BentoCard icon={<Globe />} title="Theme" description="OKLCH Double layer of light and dark token" />
</BentoGrid>`,
            render: () => (<BentoGrid className="w-full max-w-2xl">
          <BentoCard icon={<Zap />} title="Extreme speed" description="Pure CSS first, zero runtime overhead"/>
          <BentoCard icon={<Shield />} title="Reliable" description="WAI-ARIA + test coverage"/>
          <BentoCard icon={<Globe />} title="Theme" description="OKLCH Light and dark double layer token"/>
        </BentoGrid>),
        },
        {
            title: "Cross columns and rows",
            description: "Use className (col-span / row-span) on BentoCard to control single card occupancy and spell out the error layout.",
            code: `<BentoGrid>
  <BentoCard className="sm:col-span-2" icon={<Zap />} title="Extreme speed" description="Pure CSS Priority" />
  <BentoCard icon={<Shield />} title="Reliable" description="WAI-ARIA" />
  <BentoCard icon={<Globe />} title="Theme" description="OKLCH Double Layer token" />
  <BentoCard className="sm:col-span-2" icon={<Sparkles />} title="Composable building blocks" description="Unified into a set of Hulian API" />
</BentoGrid>`,
            render: () => <Demo />,
        },
        {
            title: "With action area (cta)",
            description: "cta is hidden by default, and hover slides up and fades in to guide secondary operations.",
            code: `<BentoGrid>
  <BentoCard
    className="sm:col-span-2"
    icon={<Sparkles />}
    title="Get started"
    description="hover Card View Action Area"
    cta={<span className="text-sm font-medium text-primary">Learn more \u2192</span>}
  />
  <BentoCard icon={<Shield />} title="Reliable" description="Test coverage" />
</BentoGrid>`,
            render: () => (<BentoGrid className="w-full max-w-2xl">
          <BentoCard className="sm:col-span-2" icon={<Sparkles />} title="Get started" description="hover Card View Action Area" cta={<span className="text-sm font-medium text-primary">Learn more →</span>}/>
          <BentoCard icon={<Shield />} title="Reliable" description="Test Coverage"/>
        </BentoGrid>),
        },
        {
            title: "Custom content (children)",
            description: "When title/description is not used, you can directly plug in children for free typesetting.",
            code: `<BentoGrid>
  <BentoCard className="sm:col-span-3">
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <Sparkles className="size-8 text-primary" />
      <span className="text-base font-semibold text-foreground">Full customization</span>
    </div>
  </BentoCard>
</BentoGrid>`,
            render: () => (<BentoGrid className="w-full max-w-2xl">
          <BentoCard className="sm:col-span-3">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Sparkles className="size-8 text-primary"/>
              <span className="text-base font-semibold text-foreground">Fully Customizable</span>
            </div>
          </BentoCard>
        </BentoGrid>),
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<BentoGrid>
  <BentoCard className="sm:col-span-2" title="Extreme speed" description="..." icon={<Zap />} />
  <BentoCard title="Reliable" description="..." />
</BentoGrid>`,
};
