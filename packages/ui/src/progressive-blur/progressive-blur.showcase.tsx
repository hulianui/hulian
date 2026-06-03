"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ProgressiveBlur } from "./progressive-blur";

type Side = "top" | "bottom" | "left" | "right";

function Demo({ side = "bottom" }: { side?: Side }) {
  return (
    <div className="relative h-56 w-80 overflow-hidden rounded-[var(--radius)] border border-border">
      <div className="grid h-full grid-cols-6 gap-1 p-2">
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} className="rounded-sm bg-gradient-to-br from-primary/40 to-chart-2/40" />
        ))}
      </div>
      <ProgressiveBlur side={side} />
      <span className="absolute bottom-3 left-3 text-sm font-medium text-foreground">渐进模糊 · {side}</span>
    </div>
  );
}

export const progressiveBlurShowcase: ShowcaseSpec = {
  controls: [
    { prop: "side", type: "select", options: ["top", "bottom", "left", "right"], defaultValue: "bottom" },
  ],
  states: [
    { name: "bottom", render: () => <Demo side="bottom" /> },
    { name: "top", render: () => <Demo side="top" /> },
  ],
  renderWithProps: (p) => <Demo side={(p.side as Side) ?? "bottom"} />,
  toCode: (p) =>
    `<div className="relative overflow-hidden">\n  {/* content */}\n  <ProgressiveBlur side="${(p.side as string) ?? "bottom"}" />\n</div>`,
};
