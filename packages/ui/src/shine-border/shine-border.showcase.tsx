import type { ShowcaseSpec } from "../showcase/types";
import { ShineBorder } from "./shine-border";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-40 w-72 overflow-hidden rounded-xl bg-surface">
      {children}
    </div>
  );
}

export const shineBorderShowcase: ShowcaseSpec = {
  controls: [
    { prop: "borderWidth", type: "number", defaultValue: 1 },
    { prop: "duration", type: "number", defaultValue: 14 },
  ],
  states: [
    {
      name: "default（chart 流光边）",
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Shine Border</div>
          <ShineBorder />
        </Card>
      ),
    },
    {
      name: "粗边 · primary 单色",
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Single</div>
          <ShineBorder borderWidth={2} shineColor="var(--color-primary)" />
        </Card>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Card>
      <div className="grid h-full place-items-center text-sm text-muted">Shine Border</div>
      <ShineBorder borderWidth={p.borderWidth as number} duration={p.duration as number} />
    </Card>
  ),
  toCode: (p) =>
    `<div className="relative">\n  ...content\n  <ShineBorder borderWidth={${p.borderWidth}} duration={${p.duration}} />\n</div>`,
};
