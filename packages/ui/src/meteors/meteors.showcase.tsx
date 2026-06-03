"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Meteors } from "./meteors";

function Sky({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const meteorsShowcase: ShowcaseSpec = {
  controls: [{ prop: "number", type: "number", defaultValue: 20 }],
  states: [
    {
      name: "default（20 颗流星）",
      render: () => (
        <Sky>
          <Meteors />
          <div className="grid h-full place-items-center text-sm text-muted">Meteors</div>
        </Sky>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Sky>
      <Meteors number={p.number as number} />
      <div className="grid h-full place-items-center text-sm text-muted">Meteors</div>
    </Sky>
  ),
  toCode: (p) =>
    `<div className="relative overflow-hidden">\n  <Meteors number={${p.number}} />\n</div>`,
};
