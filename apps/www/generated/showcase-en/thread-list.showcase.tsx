"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Plus } from "../../../../packages/ui/src/_icons";
import { ThreadList } from "../../../../packages/ui/src/thread-list/thread-list";
const seed = [
    { id: "a", title: "Yunqi Technology \u00B7 President's Personal Secretary", meta: "3 minutes ago" },
    { id: "b", title: "Morningstar Group \u00B7 Executive Director", meta: "Yesterday" },
    { id: "c", title: "New Resume Dialogue", meta: "Last week" },
];
function InteractiveDemo() {
    const [items, setItems] = useState(seed);
    const [activeId, setActiveId] = useState("a");
    return (<div className="w-full max-w-60">
      <ThreadList items={items.map((it) => ({ ...it, active: it.id === activeId }))} onSelect={setActiveId} onDelete={(id) => setItems((cur) => cur.filter((it) => it.id !== id))} action={<Button size="sm" variant="ghost">
            <Plus className="size-3.5" aria-hidden/>
            New conversation
          </Button>}/>
    </div>);
}
export const threadListShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Passing in items (id/title/meta), active marks the current session.",
            code: `<ThreadList
  items={[
    { id: "a", title: "Yunqi Technology\u00B7President's Personal Secretary", meta: "3 minutes ago", active: true },
    { id: "b", title: "Morning Star Group\u00B7Administrative Director", meta: "Yesterday" },
    { id: "c", title: "New resume conversation", meta: "Last week" },
  ]}
  onSelect={(id) => console.log(id)}
/>`,
            render: () => (<div className="w-full max-w-60">
          <ThreadList items={[
                    { id: "a", title: "Yunqi Technology \u00B7 President's Personal Secretary", meta: "3 minutes ago", active: true },
                    { id: "b", title: "Morningstar Group \u00B7 Executive Director", meta: "Yesterday" },
                    { id: "c", title: "New Resume Dialogue", meta: "Last week" },
                ]}/>
        </div>),
        },
        {
            title: "Can be deleted",
            description: "Provides a delete button to be rendered on the right side of each item after onDelete (clicking does not trigger onSelect).",
            code: `<ThreadList
  items={[
    { id: "a", title: "Yunqi Technology\u00B7President's Personal Secretary", meta: "3 minutes ago", active: true },
    { id: "b", title: "Morning Star Group\u00B7Administrative Director", meta: "Yesterday" },
  ]}
  onSelect={(id) => open(id)}
  onDelete={(id) => remove(id)}
/>`,
            render: () => (<div className="w-full max-w-60">
          <ThreadList items={[
                    { id: "a", title: "Yunqi Technology \u00B7 President's Personal Secretary", meta: "3 minutes ago", active: true },
                    { id: "b", title: "Morningstar Group \u00B7 Executive Director", meta: "Yesterday" },
                ]} onDelete={() => { }}/>
        </div>),
        },
        {
            title: "Head action slot",
            description: "title Custom + action slot for the \"New Conversation\" button.",
            code: `<ThreadList
  title="Recent Conversations"
  items={items}
  action={
    <Button size="sm" variant="ghost">
      <Plus className="size-3.5" aria-hidden />
      New conversation
    </Button>
  }
/>`,
            render: () => (<div className="w-full max-w-60">
          <ThreadList title="Recent conversations" items={[
                    { id: "a", title: "Yunqi Technology \u00B7 President's Personal Secretary", meta: "3 minutes ago", active: true },
                    { id: "b", title: "Morningstar Group \u00B7 Executive Director", meta: "Yesterday" },
                ]} action={<Button size="sm" variant="ghost">
                <Plus className="size-3.5" aria-hidden/>
                New conversation
              </Button>}/>
        </div>),
        },
        {
            title: "Empty",
            description: "When items is empty, the placeholder is displayed, and empty can be used to customize the copy.",
            code: `<ThreadList items={[]} empty="No historical sessions yet" />`,
            render: () => (<div className="w-full max-w-60">
          <ThreadList items={[]} empty="There are no historical sessions yet"/>
        </div>),
        },
        {
            title: "Inline (no border)",
            description: "bare Remove the container border background and embed existing containers such as sidebars.",
            code: `<ThreadList bare items={items} />`,
            render: () => (<div className="w-full max-w-60">
          <ThreadList bare items={[
                    { id: "a", title: "Yunqi Technology \u00B7 President's Personal Secretary", meta: "3 minutes ago", active: true },
                    { id: "b", title: "Morningstar Group \u00B7 Executive Director", meta: "Yesterday" },
                ]}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Session list (switchable/deletable)", render: () => <InteractiveDemo /> },
        {
            name: "Empty",
            render: () => (<div className="w-full max-w-60">
          <ThreadList items={[]}/>
        </div>),
        },
    ],
    renderWithProps: () => <InteractiveDemo />,
    toCode: () => `<ThreadList items={[{ id, title, meta, active }]} onSelect={\u2026} onDelete={\u2026} />`,
};
