"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AnimatedList } from "../../../../packages/ui/src/animated-list/animated-list";
const Row = ({ t, d }: {
    t: string;
    d: string;
}) => (<div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3">
    <span className="size-9 shrink-0 rounded-full bg-primary/15"/>
    <span className="flex flex-col">
      <span className="text-sm font-medium text-foreground">{t}</span>
      <span className="text-xs text-muted">{d}</span>
    </span>
  </div>);
function Demo() {
    return (<AnimatedList className="w-72">
      <Row t="New Order" d="¥128 · Just now"/>
      <Row t="Payment successful" d="¥99 · 1 minute ago"/>
      <Row t="New review" d="★★★★★ · 3 minutes ago"/>
      <Row t="New Follower" d="@hulian · 5 minutes ago"/>
    </AnimatedList>);
}
export const animatedListShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The sub-items fade in and move up into the field one by one, and are triggered when entering the viewport (once).",
            code: `<AnimatedList>
  <Row t="New Order" d="\u00A5128 \u00B7 Just" />
  <Row t="Payment successful" d="\u00A599 \u00B7 1 minute ago" />
  <Row t="New review" d="\u2605\u2605\u2605\u2605\u2605 \u00B7 3 minutes ago" />
  <Row t="New Fan" d="@hulian \u00B7 5 minutes ago" />
</AnimatedList>`,
            render: () => <Demo />,
        },
        {
            title: "Adjust the entry interval (stagger)",
            description: "stagger Controls the delay (seconds) for adjacent sub-items to enter. The larger the delay, the more \"staggered\" it is.",
            code: `<AnimatedList stagger={0.4}>
  <Row t="New Order" d="\u00A5128 \u00B7 Just" />
  <Row t="Payment successful" d="\u00A599 \u00B7 1 minute ago" />
  <Row t="New review" d="\u2605\u2605\u2605\u2605\u2605 \u00B7 3 minutes ago" />
</AnimatedList>`,
            render: () => (<AnimatedList className="w-72" stagger={0.4}>
          <Row t="New Order" d="¥128 · Just now"/>
          <Row t="Payment successful" d="¥99 · 1 minute ago"/>
          <Row t="New review" d="★★★★★ · 3 minutes ago"/>
        </AnimatedList>),
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<AnimatedList>
  <Item /><Item /><Item />
</AnimatedList>`,
};
