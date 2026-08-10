"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ScrollFloat } from "../../../../packages/ui/src/scroll-float/scroll-float";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative max-h-72 w-full max-w-xl overflow-auto rounded-xl border border-border bg-surface p-6">
      <p className="flex h-40 items-end justify-center pb-6 text-sm text-muted-foreground">
        ↓ Scroll this area and the title will pop up character by character
      </p>
      {children}
      <div className="h-56"/>
    </div>);
}
export const scrollFloatShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The component is automatically bound to the nearest scrollable ancestor, and the title is pulled up character by character with progress when scrolling.",
            code: `<div className="max-h-72 overflow-auto p-6">
  <div className="h-40" />
  <ScrollFloat>Hulian component library</ScrollFloat>
  <div className="h-56" />
</div>`,
            render: () => (<Stage>
          <ScrollFloat>Hulian component library</ScrollFloat>
        </Stage>),
        },
        {
            title: "Custom font size",
            description: "textClassName Controls the font size/weight/alignment of the text layer to adapt to long titles.",
            code: `<ScrollFloat textClassName="text-3xl md:text-5xl">
  Scroll Float
</ScrollFloat>`,
            render: () => (<Stage>
          <ScrollFloat textClassName="text-3xl md:text-5xl">Scroll Float</ScrollFloat>
        </Stage>),
        },
        {
            title: "Strong peak offset + main color text",
            description: "stagger The larger the characters are, the more obvious the peaks will be when they are pulled up one by one. text-primary can be superimposed for coloring.",
            code: `<ScrollFloat stagger={0.7} textClassName="text-primary text-3xl md:text-5xl">
  HULIAN
</ScrollFloat>`,
            render: () => (<Stage>
          <ScrollFloat stagger={0.7} textClassName="text-primary text-3xl md:text-5xl">
            HULIAN
          </ScrollFloat>
        </Stage>),
        },
    ],
    controls: [
        { prop: "stagger", type: "number", defaultValue: 0.4, label: "Character peak shifting 0~1" },
        { prop: "yPercent", type: "number", defaultValue: 120, label: "Initial sinking %" },
        { prop: "scaleY", type: "number", defaultValue: 2.3, label: "Initial longitudinal stretch" },
        { prop: "scaleX", type: "number", defaultValue: 0.7, label: "Initial lateral flattening" },
    ],
    states: [
        {
            name: "default (Scroll up character by character)",
            render: () => (<Stage>
          <ScrollFloat>Hulian component library</ScrollFloat>
        </Stage>),
        },
        {
            name: "English long title",
            render: () => (<Stage>
          <ScrollFloat textClassName="text-3xl md:text-5xl">Scroll Float</ScrollFloat>
        </Stage>),
        },
        {
            name: "Strong peak offset + main color text",
            render: () => (<Stage>
          <ScrollFloat stagger={0.7} textClassName="text-primary text-3xl md:text-5xl">
            HULIAN
          </ScrollFloat>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ScrollFloat stagger={p.stagger as number} yPercent={p.yPercent as number} scaleY={p.scaleY as number} scaleX={p.scaleX as number}>
        Hulian component library
      </ScrollFloat>
    </Stage>),
    toCode: (p) => [
        `{/* The component is automatically bound to the nearest scrollable ancestor; when there is no scrolling context, it is downgraded to automatically emerge when entering the viewport */}`,
        `<div className="max-h-72 overflow-auto p-6">`,
        `  <div className="h-40" />`,
        `  <ScrollFloat`,
        `    stagger={${p.stagger}}`,
        `    yPercent={${p.yPercent}}`,
        `    scaleY={${p.scaleY}}`,
        `    scaleX={${p.scaleX}}`,
        `  >`,
        `    Hulian component library`,
        `  </ScrollFloat>`,
        `  <div className="h-56" />`,
        `</div>`,
    ].join("\n"),
};
