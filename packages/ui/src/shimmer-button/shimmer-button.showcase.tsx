import type { ShowcaseSpec } from "../showcase/types";
import { ShimmerButton } from "./shimmer-button";

export const shimmerButtonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认 primary 底色，边缘有一圈游走的高光火花，适合首屏主 CTA。",
      code: `<ShimmerButton>开始使用 瑚琏</ShimmerButton>`,
      render: () => <ShimmerButton>开始使用 瑚琏</ShimmerButton>,
    },
    {
      title: "自定义底色",
      description: "background 换成任意颜色（含 token），火花色默认随 primary-foreground。",
      code: `<ShimmerButton background="var(--color-danger)">删除账户</ShimmerButton>`,
      render: () => <ShimmerButton background="var(--color-danger)">删除账户</ShimmerButton>,
    },
    {
      title: "火花速度",
      description: "shimmerDuration 控制一轮火花游走的时长，越小越快。",
      code: `<ShimmerButton shimmerDuration="2s">急速</ShimmerButton>
<ShimmerButton shimmerDuration="5s">舒缓</ShimmerButton>`,
      render: () => (
        <>
          <ShimmerButton shimmerDuration="2s">急速</ShimmerButton>
          <ShimmerButton shimmerDuration="5s">舒缓</ShimmerButton>
        </>
      ),
    },
  ],
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
