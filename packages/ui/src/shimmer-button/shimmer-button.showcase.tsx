import type { ShowcaseSpec } from "../showcase/types";
import { ShimmerButton } from "./shimmer-button";

export const shimmerButtonShowcase: ShowcaseSpec = {
  controls: [{ prop: "shimmerDuration", type: "select", options: ["2s", "3s", "5s"], defaultValue: "3s" }],
  states: [
    {
      name: "default（primary 底 + 火花游走）",
      render: () => <ShimmerButton>开始使用 瑚琏</ShimmerButton>,
    },
    {
      name: "danger 底",
      render: () => <ShimmerButton background="var(--color-danger)">删除</ShimmerButton>,
    },
  ],
  renderWithProps: (p) => (
    <ShimmerButton shimmerDuration={p.shimmerDuration as string}>开始使用 瑚琏</ShimmerButton>
  ),
  toCode: (p) => `<ShimmerButton shimmerDuration="${p.shimmerDuration}">开始使用</ShimmerButton>`,
};
