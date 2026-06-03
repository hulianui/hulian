import type { ShowcaseSpec } from "../showcase/types";
import { AnimatedShinyText } from "./animated-shiny-text";

export const animatedShinyTextShowcase: ShowcaseSpec = {
  controls: [{ prop: "shimmerWidth", type: "number", defaultValue: 100 }],
  states: [
    {
      name: "default（徽标气质高光）",
      render: () => (
        <div className="rounded-full border border-border bg-surface px-4 py-1.5">
          <AnimatedShinyText className="text-sm">✨ Introducing 瑚琏 Hulian</AnimatedShinyText>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="rounded-full border border-border bg-surface px-4 py-1.5">
      <AnimatedShinyText className="text-sm" shimmerWidth={p.shimmerWidth as number}>
        ✨ Introducing 瑚琏 Hulian
      </AnimatedShinyText>
    </div>
  ),
  toCode: (p) =>
    `<AnimatedShinyText shimmerWidth={${p.shimmerWidth}}>✨ Introducing</AnimatedShinyText>`,
};
