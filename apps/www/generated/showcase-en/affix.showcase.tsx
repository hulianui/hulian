"use client";
import { useRef, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Affix } from "../../../../packages/ui/src/affix/affix";
const ROWS = Array.from({ length: 18 }, (_, i) => i + 1);
function AffixDemo({ offsetTop, offsetBottom, affixedClassName, }: {
    offsetTop?: number;
    offsetBottom?: number;
    affixedClassName?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [affixed, setAffixed] = useState(false);
    const toBottom = offsetBottom != null;
    const bar = (<Affix target={() => ref.current} offsetTop={toBottom ? undefined : (offsetTop ?? 8)} offsetBottom={offsetBottom} onChange={setAffixed} affixedClassName={affixedClassName}>
      <div className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-primary px-4 py-2 text-bg">
        <span className="text-sm font-medium">Action bar</span>
        <span className="text-xs opacity-80">{affixed ? "Adsorbed" : "Not adsorbed"}</span>
      </div>
    </Affix>);
    return (<div ref={ref} className="h-64 w-80 overflow-auto rounded-[var(--radius)] border border-border bg-surface p-4">
      <p className="mb-3 text-sm text-muted">
        {toBottom ? "Scroll up \u2191 Let the action bar suck to the bottom" : "Scroll down \u2193 Let the action bar snap to the top"}
      </p>
      {!toBottom && bar}
      <div className="mt-3 space-y-2">
        {ROWS.map((n) => (<p key={n} className="text-sm text-muted">
            Content line {n}
          </p>))}
      </div>
      {toBottom && <div className="mt-3">{bar}</div>}
    </div>);
}
export const affixShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Ceiling",
            description: "offsetTop Set the distance px from the top of the container when it is adsorbed and fixed. The original position is supported by equal-height placeholder elements to prevent the layout from jumping.",
            code: `<Affix offsetTop={8}>
  <div className="rounded border bg-primary px-4 py-2 text-bg">Operation bar</div>
</Affix>`,
            render: () => <AffixDemo offsetTop={8}/>,
        },
        {
            title: "Bottom suction",
            description: "Use offsetBottom instead, and pin content to the bottom when scrolling past the container bottom threshold (only takes effect when offsetTop is not given).",
            code: `<Affix offsetBottom={8}>
  <div className="rounded border bg-primary px-4 py-2 text-bg">Operation bar</div>
</Affix>`,
            render: () => <AffixDemo offsetBottom={8}/>,
        },
        {
            title: "Add shadow when adsorbing",
            description: "affixedClassName adds a class name to the adsorption state, which is often used to raise shadows during adsorption; onChange can synchronize the adsorption state.",
            code: `<Affix offsetTop={8} affixedClassName="shadow-lg" onChange={setAffixed}>
  <div className="rounded border bg-primary px-4 py-2 text-bg">Operation bar</div>
</Affix>`,
            render: () => <AffixDemo offsetTop={8} affixedClassName="shadow-lg"/>,
        },
    ],
    controls: [
        { prop: "offsetTop", type: "number", defaultValue: 8, label: "offsetTop" },
    ],
    states: [
        { name: "Ceiling (offsetTop)", render: () => <AffixDemo offsetTop={8}/> },
        { name: "Bottom suction (offsetBottom)", render: () => <AffixDemo offsetBottom={8}/> },
        {
            name: "Adsorption and shadowing",
            render: () => <AffixDemo offsetTop={8} affixedClassName="shadow-lg"/>,
        },
    ],
    renderWithProps: (p) => (<AffixDemo offsetTop={typeof p.offsetTop === "number" ? p.offsetTop : 8}/>),
    toCode: (p) => `<Affix offsetTop={${typeof p.offsetTop === "number" ? p.offsetTop : 8}}>
  <div>Operation Bar</div>
</Affix>`,
};
