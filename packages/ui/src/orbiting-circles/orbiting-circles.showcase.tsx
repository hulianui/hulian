"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { OrbitingCircles } from "./orbiting-circles";

const Chip = ({ c }: { c: string }) => (
  <span className="flex size-full items-center justify-center rounded-full bg-surface-hover text-xs text-foreground shadow-sm">
    {c}
  </span>
);

function Demo({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="relative flex h-[340px] w-[340px] items-center justify-center">
      <span className="text-sm font-medium text-muted">瑚琏</span>
      <OrbitingCircles radius={140} duration={20} reverse={reverse}>
        <Chip c="A" />
        <Chip c="B" />
        <Chip c="C" />
        <Chip c="D" />
      </OrbitingCircles>
      <OrbitingCircles radius={80} duration={14} reverse={!reverse} iconSize={32}>
        <Chip c="1" />
        <Chip c="2" />
      </OrbitingCircles>
    </div>
  );
}

export const orbitingCirclesShowcase: ShowcaseSpec = {
  controls: [{ prop: "reverse", type: "boolean", defaultValue: false }],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "reverse", render: () => <Demo reverse /> },
  ],
  renderWithProps: (p) => <Demo reverse={Boolean(p.reverse)} />,
  toCode: () =>
    `<div className="relative flex size-[340px] items-center justify-center">\n  <OrbitingCircles radius={140} duration={20}>\n    <Icon /><Icon /><Icon />\n  </OrbitingCircles>\n</div>`,
};
