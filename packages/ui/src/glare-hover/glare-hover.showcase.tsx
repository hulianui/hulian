import type { ShowcaseSpec } from "../showcase/types";
import { GlareHover } from "./glare-hover";

export const glareHoverShowcase: ShowcaseSpec = {
  controls: [{ prop: "duration", type: "select", options: ["450ms", "650ms", "1000ms"], defaultValue: "650ms" }],
  states: [
    {
      name: "default（hover 反光斜扫）",
      render: () => (
        <GlareHover className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
          <span className="text-lg font-semibold text-foreground">悬停看反光</span>
        </GlareHover>
      ),
    },
  ],
  renderWithProps: (p) => (
    <GlareHover
      duration={p.duration as string}
      className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface"
    >
      <span className="text-lg font-semibold text-foreground">悬停看反光</span>
    </GlareHover>
  ),
  toCode: (p) => `<GlareHover duration="${p.duration}">...</GlareHover>`,
};
