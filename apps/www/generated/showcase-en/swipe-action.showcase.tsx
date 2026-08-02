"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SwipeAction } from "../../../../packages/ui/src/swipe-action/swipe-action";
function Row() {
    return (<div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
      <SwipeAction left={[{ key: "read", label: "Mark as read", tone: "primary" }]} right={[
            { key: "top", label: "Pin to top", tone: "warning" },
            { key: "del", label: "Delete", tone: "danger" },
        ]}>
        <div className="flex items-center justify-between bg-surface px-4 py-3">
          <span className="text-sm text-foreground">Conversation items · Try sliding left and right</span>
          <span className="text-xs text-muted">14:32</span>
        </div>
      </SwipeAction>
    </div>);
}
export const swipeActionShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Swipe right to delete",
            description: "The right array defines the action on the right (the content is moved to the left and exposed), and tone determines the background color.",
            code: `<SwipeAction right={[{ key: "del", label: "Delete", tone: "danger" }]}>
  <div className="bg-surface px-4 py-3">Conversation item \u00B7 Try sliding left</div>
</SwipeAction>`,
            render: () => (<div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
          <SwipeAction right={[{ key: "del", label: "Delete", tone: "danger" }]}>
            <div className="bg-surface px-4 py-3 text-sm text-foreground">Conversation items · Try sliding left</div>
          </SwipeAction>
        </div>),
        },
        {
            title: "Left and right two-way action",
            description: "left / right can be configured at the same time; multiple buttons can be arranged on each side, arranged in sequence.",
            code: `<SwipeAction
  left={[{ key: "read", label: "Mark as read", tone: "primary" }]}
  right={[
    { key: "top", label: "Top", tone: "warning" },
    { key: "del", label: "Delete", tone: "danger" },
  ]}
>
  <Row />
</SwipeAction>`,
            render: () => <Row />,
        },
        {
            title: "Shade Variants",
            description: "tone supports default / primary / success / warning / danger.",
            code: `<SwipeAction
  right={[
    { key: "ok", label: "Complete", tone: "success" },
    { key: "more", label: "More", tone: "default" },
  ]}
>
  <div className="bg-surface px-4 py-3">Multi-color action</div>
</SwipeAction>`,
            render: () => (<div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
          <SwipeAction right={[
                    { key: "ok", label: "Complete", tone: "success" },
                    { key: "more", label: "More", tone: "default" },
                ]}>
            <div className="bg-surface px-4 py-3 text-sm text-foreground">Multi-color action · Swipe left</div>
          </SwipeAction>
        </div>),
        },
    ],
    controls: [],
    states: [{ name: "Left/right two-way action", render: () => <Row /> }],
    renderWithProps: () => <Row />,
    toCode: () => `<SwipeAction
  left={[{ key: "read", label: "Read", tone: "primary" }]}
  right={[{ key: "del", label: "Delete", tone: "danger" }]}
>
  <Row />
</SwipeAction>`,
};
