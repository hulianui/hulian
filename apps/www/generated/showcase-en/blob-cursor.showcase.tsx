"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BlobCursor } from "../../../../packages/ui/src/blob-cursor/blob-cursor";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.16 0.02 265)" }}>
      {children}
    </div>);
}
export const blobCursorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wrap any content, and jelly water droplets will appear as you move the mouse into it; children is layered on top of the water droplets.",
            code: `<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.16 0.02 265)" }}
>
  <BlobCursor>
    <div className="pointer-events-none flex h-full items-center justify-center text-sm font-medium text-white/70">
      Move mouse \u2192
    </div>
  </BlobCursor>
</div>`,
            render: () => (<Stage>
          <BlobCursor>
            <div className="pointer-events-none flex h-full items-center justify-center text-sm font-medium text-white/70">
              Move mouse →
            </div>
          </BlobCursor>
        </Stage>),
        },
        {
            title: "Square liquid block",
            description: "square can be combined with the larger gooeyStrength to obtain a liquid block that fuses like mercury.",
            code: `<BlobCursor square gooeyStrength={20} />`,
            render: () => (<Stage>
          <BlobCursor square gooeyStrength={20}/>
        </Stage>),
        },
        {
            title: "Long tail",
            description: "Increase trailCount, decrease trailStiffness, and the tail will be longer and sticky.",
            code: `<BlobCursor trailCount={5} trailStiffness={70} />`,
            render: () => (<Stage>
          <BlobCursor trailCount={5} trailStiffness={70}/>
        </Stage>),
        },
        {
            title: "Close gooey",
            description: "When gooey={false}, each water droplet is independent of each other and no longer merges at the edges.",
            code: `<BlobCursor gooey={false} />`,
            render: () => (<Stage>
          <BlobCursor gooey={false}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "trailCount", type: "number", defaultValue: 3, label: "Trailing quantity" },
        { prop: "gooey", type: "boolean", defaultValue: true, label: "gooey Fusion" },
        { prop: "gooeyStrength", type: "number", defaultValue: 16, label: "Fusion Strength" },
        { prop: "square", type: "boolean", defaultValue: false, label: "Square Water Drop" },
    ],
    states: [
        {
            name: "default (Move to the stage and try)",
            render: () => (<Stage>
          <BlobCursor>
            <div className="pointer-events-none flex h-full items-center justify-center text-sm font-medium text-white/70">
              Move mouse →
            </div>
          </BlobCursor>
        </Stage>),
        },
        {
            name: "Square liquid block",
            render: () => (<Stage>
          <BlobCursor square gooeyStrength={20}/>
        </Stage>),
        },
        {
            name: "Long tail (5 drops \u00B7 low stiffness)",
            render: () => (<Stage>
          <BlobCursor trailCount={5} trailStiffness={70}/>
        </Stage>),
        },
        {
            name: "None gooey (independent water bead)",
            render: () => (<Stage>
          <BlobCursor gooey={false}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <BlobCursor trailCount={p.trailCount as number} gooey={p.gooey as boolean} gooeyStrength={p.gooeyStrength as number} square={p.square as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 265)" }}>`,
        `  <BlobCursor`,
        `    trailCount={${p.trailCount}}`,
        `    gooey={${p.gooey}}`,
        `    gooeyStrength={${p.gooeyStrength}}`,
        `    square={${p.square}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
