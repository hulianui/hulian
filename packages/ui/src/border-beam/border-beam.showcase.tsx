"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BorderBeam } from "./border-beam";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-40 w-72 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const borderBeamShowcase: ShowcaseSpec = {
  controls: [
    { prop: "duration", type: "number", defaultValue: 6 },
    { prop: "size", type: "number", defaultValue: 60 },
  ],
  states: [
    {
      name: "default（primary→chart 光束绕边）",
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
          <BorderBeam />
        </Card>
      ),
    },
    {
      name: "反向 · 慢",
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Reverse</div>
          <BorderBeam reverse duration={10} size={80} />
        </Card>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Card>
      <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
      <BorderBeam duration={p.duration as number} size={p.size as number} />
    </Card>
  ),
  toCode: (p) =>
    `<div className="relative">\n  ...content\n  <BorderBeam duration={${p.duration}} size={${p.size}} />\n</div>`,
};
