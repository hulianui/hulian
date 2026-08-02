"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AspectRatio } from "../../../../packages/ui/src/aspect-ratio/aspect-ratio";
const Fill = ({ label }: {
    label: string;
}) => (<div className="flex h-full w-full items-center justify-center bg-surface-hover text-xs text-muted">
    {label}
  </div>);
export const aspectRatioShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "16 / 9 widescreen",
            description: "Use ratio to lock the aspect ratio, and the height will adapt proportionally when the container width changes (commonly used for videos/covers).",
            code: `<div className="w-64">
  <AspectRatio ratio={16 / 9}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>`,
            render: () => (<div className="w-64">
          <AspectRatio ratio={16 / 9} className="rounded-[var(--radius)] border border-border">
            <Fill label="16 / 9"/>
          </AspectRatio>
        </div>),
        },
        {
            title: "1 / 1 square",
            description: "ratio={1} Lock square, suitable for avatars, thumbnails, and icon placeholders.",
            code: `<div className="w-40">
  <AspectRatio ratio={1}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>`,
            render: () => (<div className="w-40">
          <AspectRatio ratio={1} className="rounded-[var(--radius)] border border-border">
            <Fill label="1 / 1"/>
          </AspectRatio>
        </div>),
        },
        {
            title: "Vertical 3 / 4",
            description: "ratio is less than 1, which is the vertical ratio, suitable for portrait cards/posters.",
            code: `<div className="w-40">
  <AspectRatio ratio={3 / 4}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>`,
            render: () => (<div className="w-40">
          <AspectRatio ratio={3 / 4} className="rounded-[var(--radius)] border border-border">
            <Fill label="3 / 4"/>
          </AspectRatio>
        </div>),
        },
    ],
    controls: [{ prop: "ratio", type: "select", options: ["1", "1.7778", "1.3333", "0.75"], defaultValue: "1.7778" }],
    states: [
        {
            name: "16 / 9",
            render: () => (<div className="w-64">
          <AspectRatio ratio={16 / 9} className="rounded-[var(--radius)] border border-border">
            <Fill label="16 / 9"/>
          </AspectRatio>
        </div>),
        },
        {
            name: "1 / 1",
            render: () => (<div className="w-40">
          <AspectRatio ratio={1} className="rounded-[var(--radius)] border border-border">
            <Fill label="1 / 1"/>
          </AspectRatio>
        </div>),
        },
        {
            name: "4 / 3",
            render: () => (<div className="w-56">
          <AspectRatio ratio={4 / 3} className="rounded-[var(--radius)] border border-border">
            <Fill label="4 / 3"/>
          </AspectRatio>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-64">
      <AspectRatio ratio={Number(p.ratio ?? 1.7778)} className="rounded-[var(--radius)] border border-border">
        <Fill label={`ratio ${Number(p.ratio ?? 1.7778).toFixed(2)}`}/>
      </AspectRatio>
    </div>),
    toCode: (p) => `<AspectRatio ratio={${Number(p.ratio ?? 1.7778).toFixed(4)}}>
  <img src="..." alt="..." />
</AspectRatio>`,
};
