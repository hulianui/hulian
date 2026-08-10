"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { OrbitingCircles } from "../../../../packages/ui/src/orbiting-circles/orbiting-circles";
const Chip = ({ c }: {
    c: string;
}) => (<span className="flex size-full items-center justify-center rounded-full bg-surface-hover text-xs text-foreground shadow-sm">
    {c}
  </span>);
function Demo({ reverse = false }: {
    reverse?: boolean;
}) {
    return (<div className="relative flex h-[340px] w-[340px] items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">Hulian</span>
      <OrbitingCircles radius={140} duration={20} reverse={reverse}>
        <Chip c="A"/>
        <Chip c="B"/>
        <Chip c="C"/>
        <Chip c="D"/>
      </OrbitingCircles>
      <OrbitingCircles radius={80} duration={14} reverse={!reverse} iconSize={32}>
        <Chip c="1"/>
        <Chip c="2"/>
      </OrbitingCircles>
    </div>);
}
export const orbitingCirclesShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Child elements orbit at a constant speed, with a mark or logo in the center.",
            code: `<div className="relative flex size-[340px] items-center justify-center">
  <span className="text-sm font-medium text-muted-foreground">Hulian</span>
  <OrbitingCircles radius={140} duration={20}>
    <Chip c="A" />
    <Chip c="B" />
    <Chip c="C" />
    <Chip c="D" />
  </OrbitingCircles>
</div>`,
            render: () => <Demo />,
        },
        {
            title: "Reverse rotation",
            description: "reverse allows the track to rotate in reverse direction, often used for internal and external double ring hedging enhancement levels.",
            code: `<OrbitingCircles radius={140} duration={20} reverse>
  <Chip c="A" />
  <Chip c="B" />
</OrbitingCircles>`,
            render: () => <Demo reverse/>,
        },
        {
            title: "Single loop \u00B7 Hidden track",
            description: "showPath=false Remove the dotted track and match the iconSize tone element box size.",
            code: `<div className="relative flex size-[340px] items-center justify-center">
  <OrbitingCircles radius={120} duration={16} showPath={false} iconSize={48}>
    <Chip c="React" />
    <Chip c="TS" />
    <Chip c="CSS" />
  </OrbitingCircles>
</div>`,
            render: () => (<div className="relative flex h-[340px] w-[340px] items-center justify-center">
          <OrbitingCircles radius={120} duration={16} showPath={false} iconSize={48}>
            <Chip c="React"/>
            <Chip c="TS"/>
            <Chip c="CSS"/>
          </OrbitingCircles>
        </div>),
        },
    ],
    controls: [{ prop: "reverse", type: "boolean", defaultValue: false }],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "reverse", render: () => <Demo reverse/> },
    ],
    renderWithProps: (p) => <Demo reverse={Boolean(p.reverse)}/>,
    toCode: () => `<div className="relative flex size-[340px] items-center justify-center">
  <OrbitingCircles radius={140} duration={20}>
    <Icon /><Icon /><Icon />
  </OrbitingCircles>
</div>`,
};
