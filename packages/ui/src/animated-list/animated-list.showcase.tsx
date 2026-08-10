"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AnimatedList } from "./animated-list";

const Row = ({ t, d }: { t: string; d: string }) => (
  <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3">
    <span className="size-9 shrink-0 rounded-full bg-primary/15" />
    <span className="flex flex-col">
      <span className="text-sm font-medium text-foreground">{t}</span>
      <span className="text-xs text-muted-foreground">{d}</span>
    </span>
  </div>
);

function Demo() {
  return (
    <AnimatedList className="w-72">
      <Row t="新订单" d="¥128 · 刚刚" />
      <Row t="付款成功" d="¥99 · 1 分钟前" />
      <Row t="新评价" d="★★★★★ · 3 分钟前" />
      <Row t="新粉丝" d="@hulian · 5 分钟前" />
    </AnimatedList>
  );
}

export const animatedListShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "子项逐个淡入上移入场，进入视口时触发（once）。",
      code: `<AnimatedList>
  <Row t="新订单" d="¥128 · 刚刚" />
  <Row t="付款成功" d="¥99 · 1 分钟前" />
  <Row t="新评价" d="★★★★★ · 3 分钟前" />
  <Row t="新粉丝" d="@hulian · 5 分钟前" />
</AnimatedList>`,
      render: () => <Demo />,
    },
    {
      title: "调整入场间隔（stagger）",
      description: "stagger 控制相邻子项入场的延迟（秒），越大越「错落」。",
      code: `<AnimatedList stagger={0.4}>
  <Row t="新订单" d="¥128 · 刚刚" />
  <Row t="付款成功" d="¥99 · 1 分钟前" />
  <Row t="新评价" d="★★★★★ · 3 分钟前" />
</AnimatedList>`,
      render: () => (
        <AnimatedList className="w-72" stagger={0.4}>
          <Row t="新订单" d="¥128 · 刚刚" />
          <Row t="付款成功" d="¥99 · 1 分钟前" />
          <Row t="新评价" d="★★★★★ · 3 分钟前" />
        </AnimatedList>
      ),
    },
  ],
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () => `<AnimatedList>\n  <Item /><Item /><Item />\n</AnimatedList>`,
};
