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
  examples: [
    {
      title: "基础用法",
      description: "传入 items（id/title/meta），active 标记当前会话。",
      code: `<ThreadList
  items={[
    { id: "a", title: "云栖科技 · 总裁私人秘书", meta: "3 分钟前", active: true },
    { id: "b", title: "晨星集团 · 行政主管", meta: "昨天" },
    { id: "c", title: "新的简历对话", meta: "上周" },
  ]}
  onSelect={(id) => console.log(id)}
/>`,
      render: () => (
        <div className="w-full max-w-60">
          <ThreadList
            items={[
              { id: "a", title: "云栖科技 · 总裁私人秘书", meta: "3 分钟前", active: true },
              { id: "b", title: "晨星集团 · 行政主管", meta: "昨天" },
              { id: "c", title: "新的简历对话", meta: "上周" },
            ]}
          />
        </div>
      ),
    },
    {
      title: "可删除",
      description: "提供 onDelete 后每项右侧渲染删除按钮（点击不触发 onSelect）。",
      code: `<ThreadList
  items={[
    { id: "a", title: "云栖科技 · 总裁私人秘书", meta: "3 分钟前", active: true },
    { id: "b", title: "晨星集团 · 行政主管", meta: "昨天" },
  ]}
  onSelect={(id) => open(id)}
  onDelete={(id) => remove(id)}
/>`,
      render: () => (
        <div className="w-full max-w-60">
          <ThreadList
            items={[
              { id: "a", title: "云栖科技 · 总裁私人秘书", meta: "3 分钟前", active: true },
              { id: "b", title: "晨星集团 · 行政主管", meta: "昨天" },
            ]}
            onDelete={() => {}}
          />
        </div>
      ),
    },
    {
      title: "头部动作槽",
      description: "title 自定义 + action 槽放「新对话」按钮。",
      code: `<ThreadList
  title="最近会话"
  items={items}
  action={
    <Button size="sm" variant="ghost">
      <Plus className="size-3.5" aria-hidden />
      新对话
    </Button>
  }
/>`,
      render: () => (
        <div className="w-full max-w-60">
          <ThreadList
            title="最近会话"
            items={[
              { id: "a", title: "云栖科技 · 总裁私人秘书", meta: "3 分钟前", active: true },
              { id: "b", title: "晨星集团 · 行政主管", meta: "昨天" },
            ]}
            action={
              <Button size="sm" variant="ghost">
                <Plus className="size-3.5" aria-hidden />
                新对话
              </Button>
            }
          />
        </div>
      ),
    },
    {
      title: "空态",
      description: "items 为空时显示占位，可用 empty 自定义文案。",
      code: `<ThreadList items={[]} empty="还没有历史会话" />`,
      render: () => (
        <div className="w-full max-w-60">
          <ThreadList items={[]} empty="还没有历史会话" />
        </div>
      ),
    },
    {
      title: "内嵌（无边框）",
      description: "bare 去掉容器边框背景，嵌进侧栏等已有容器。",
      code: `<ThreadList bare items={items} />`,
      render: () => (
        <div className="w-full max-w-60">
          <ThreadList
            bare
            items={[
              { id: "a", title: "云栖科技 · 总裁私人秘书", meta: "3 分钟前", active: true },
              { id: "b", title: "晨星集团 · 行政主管", meta: "昨天" },
            ]}
          />
        </div>
      ),
    },
  ],
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
