"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Lens } from "./lens";

const IMG = "/demo/photo-lens.jpg";

function Demo({ zoom = 1.8 }: { zoom?: number }) {
  return (
    <Lens zoom={zoom} className="w-80 rounded-[var(--radius)] border border-border">
      <img src={IMG} alt="森林" className="block aspect-[4/3] w-full object-cover" />
    </Lens>
  );
}

export const lensShowcase: ShowcaseSpec = {
  controls: [{ prop: "zoom", type: "number", defaultValue: 1.8 }],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: (p) => <Demo zoom={(p.zoom as number) ?? 1.8} />,
  toCode: (p) => `<Lens zoom={${(p.zoom as number) ?? 1.8}}>\n  <img src="/photo.jpg" />\n</Lens>`,
};
