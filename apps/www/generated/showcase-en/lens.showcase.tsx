"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Lens } from "../../../../packages/ui/src/lens/lens";
import { demoAsset } from "../../../../packages/ui/src/lib/demo-asset";
const IMG = demoAsset("/demo/photo-lens.jpg");
function Demo({ zoom = 1.8 }: {
    zoom?: number;
}) {
    return (<Lens zoom={zoom} className="w-80 rounded-[var(--radius)] border border-border">
      <img src={IMG} alt="Forest" className="block aspect-[4/3] w-full object-cover"/>
    </Lens>);
}
export const lensShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Package image, displays a circular magnifying glass at the cursor when hovering.",
            code: `<Lens className="w-80 rounded-[var(--radius)] border border-border">
  <img src="/photo.jpg" alt="Forest" className="block aspect-[4/3] w-full object-cover" />
</Lens>`,
            render: () => <Demo />,
        },
        {
            title: "Magnification",
            description: "zoom Controls the zoom ratio under the magnifying glass. The larger the magnification, the more prominent the details.",
            code: `<Lens zoom={2.6} className="w-80 rounded-[var(--radius)] border border-border">
  <img src="/photo.jpg" alt="Forest" className="block aspect-[4/3] w-full object-cover" />
</Lens>`,
            render: () => <Demo zoom={2.6}/>,
        },
        {
            title: "Lens size",
            description: "size Set the diameter of the magnifying glass (px), and use zoom to adjust the appropriate observation window.",
            code: `<Lens zoom={2} size={200} className="w-80 rounded-[var(--radius)] border border-border">
  <img src="/photo.jpg" alt="Forest" className="block aspect-[4/3] w-full object-cover" />
</Lens>`,
            render: () => (<Lens zoom={2} size={200} className="w-80 rounded-[var(--radius)] border border-border">
          <img src={IMG} alt="Forest" className="block aspect-[4/3] w-full object-cover"/>
        </Lens>),
        },
    ],
    controls: [{ prop: "zoom", type: "number", defaultValue: 1.8 }],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: (p) => <Demo zoom={(p.zoom as number) ?? 1.8}/>,
    toCode: (p) => `<Lens zoom={${(p.zoom as number) ?? 1.8}}>
  <img src="/photo.jpg" />
</Lens>`,
};
