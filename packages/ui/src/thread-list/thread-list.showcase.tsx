"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Plus } from "../_icons";
import { ThreadList } from "./thread-list";

const seed = [
  { id: "a", title: "云栖科技 · 总裁私人秘书", meta: "3 分钟前" },
  { id: "b", title: "晨星集团 · 行政主管", meta: "昨天" },
  { id: "c", title: "新的简历对话", meta: "上周" },
];

function InteractiveDemo() {
  const [items, setItems] = useState(seed);
  const [activeId, setActiveId] = useState("a");
  return (
    <div className="w-full max-w-60">
      <ThreadList
        items={items.map((it) => ({ ...it, active: it.id === activeId }))}
        onSelect={setActiveId}
        onDelete={(id) => setItems((cur) => cur.filter((it) => it.id !== id))}
        action={
          <Button size="sm" variant="ghost">
            <Plus className="size-3.5" aria-hidden />
            新对话
          </Button>
        }
      />
    </div>
  );
}

export const threadListShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "会话列表（可切换/删除）", render: () => <InteractiveDemo /> },
    {
      name: "空态",
      render: () => (
        <div className="w-full max-w-60">
          <ThreadList items={[]} />
        </div>
      ),
    },
  ],
  renderWithProps: () => <InteractiveDemo />,
  toCode: () => `<ThreadList items={[{ id, title, meta, active }]} onSelect={…} onDelete={…} />`,
};
