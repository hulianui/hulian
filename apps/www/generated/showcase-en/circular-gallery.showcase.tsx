"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CircularGallery } from "../../../../packages/ui/src/circular-gallery/circular-gallery";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
const SAMPLE = [
    { text: "Hanshu" },
    { text: "Han Duo" },
    { text: "Hanjian" },
    { text: "Hanfu" },
    { text: "Hanbo" },
    { text: "Hanyun" },
    { text: "Hanku" },
    { text: "Han Shen" },
];
export const circularGalleryShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Just pass in items, scroll wheel/drag to pan, and seamlessly cycle from beginning to end; use the built-in placeholder card if you don't pass in items.",
            code: `<div
  className="relative h-72 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 255)" }}
>
  <CircularGallery
    items={[
      { text: "Hanshu" },
      { text: "HanDuo" },
      { text: "Hanship" },
      { text: "Hanfu" },
    ]}
  />
</div>`,
            render: () => (<Stage>
          <CircularGallery items={SAMPLE}/>
        </Stage>),
        },
        {
            title: "Arc strength bend",
            description: "bend Control bending: 0 straight in a row, positive values are concave downwards, negative values are convex upwards; the larger the absolute value, the deeper the arc.",
            code: `<CircularGallery bend={0} items={items} /> {/* Straight */}
<CircularGallery bend={-4} items={items} /> {/* upward convex arc */}`,
            render: () => (<Stage>
          <CircularGallery bend={-4} borderRadius={0.18} items={SAMPLE}/>
        </Stage>),
        },
        {
            title: "Card rounded corners",
            description: "borderRadius Normalized to half the length of the card (0\u20130.5), 0 is a right angle, and the larger it is, the rounder it is.",
            code: `<CircularGallery borderRadius={0.2} items={items} />`,
            render: () => (<Stage>
          <CircularGallery borderRadius={0.2} bend={3} items={SAMPLE}/>
        </Stage>),
        },
        {
            title: "Customize title color",
            description: "textColor accepts any CSS color, and also accepts var(--color-*) token (runtime parsing feeds canvas).",
            code: `<CircularGallery
  textColor="var(--color-chart-2)"
  items={items}
/>`,
            render: () => (<Stage>
          <CircularGallery textColor="var(--color-chart-2)" items={SAMPLE} bend={4}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "bend", type: "number", defaultValue: 3, label: "Arc strength" },
        { prop: "borderRadius", type: "number", defaultValue: 0.05, label: "Card rounded corners" },
        { prop: "scrollSpeed", type: "number", defaultValue: 2, label: "Scroll sensitivity" },
        { prop: "scrollEase", type: "number", defaultValue: 0.05, label: "Inertial easing" },
    ],
    states: [
        {
            name: "default (built-in placeholder card\u00B7concave downward arc)",
            render: () => (<Stage>
          <CircularGallery />
        </Stage>),
        },
        {
            name: "Straight arrangement (bend=0)",
            render: () => (<Stage>
          <CircularGallery bend={0} items={SAMPLE}/>
        </Stage>),
        },
        {
            name: "Upward convex arc (bend=-4) + rounded corner card",
            render: () => (<Stage>
          <CircularGallery bend={-4} borderRadius={0.18} items={SAMPLE}/>
        </Stage>),
        },
        {
            name: "Custom title color (chart-2)",
            render: () => (<Stage>
          <CircularGallery textColor="var(--color-chart-2)" items={SAMPLE} bend={4}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <CircularGallery bend={p.bend as number} borderRadius={p.borderRadius as number} scrollSpeed={p.scrollSpeed as number} scrollEase={p.scrollEase as number} items={SAMPLE}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-72 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <CircularGallery`,
        `    bend={${p.bend}}`,
        `    borderRadius={${p.borderRadius}}`,
        `    scrollSpeed={${p.scrollSpeed}}`,
        `    scrollEase={${p.scrollEase}}`,
        `    items={[{ text: "Hanshu" }, { text: "Hanruo" }]}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
