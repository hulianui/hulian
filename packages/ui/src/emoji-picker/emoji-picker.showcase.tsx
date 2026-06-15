"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { EmojiPicker } from "./emoji-picker";

function WithOutput() {
  const [text, setText] = useState("点表情追加到这里 👉 ");
  return (
    <div className="flex flex-col gap-3">
      <div className="min-h-10 w-72 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-lg">
        {text}
      </div>
      <EmojiPicker onSelect={(e) => setText((t) => t + e)} />
    </div>
  );
}

export const emojiPickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "分类页签 + 关键词搜索，onSelect 拿到选中的 emoji 字符。",
      code: `<EmojiPicker onSelect={(e) => insert(e)} />`,
      render: () => <EmojiPicker onSelect={() => {}} />,
    },
    {
      title: "预置最近使用 + 隐藏搜索",
      description: "受控传 recent 置顶常用表情；searchable=false 去掉搜索框。",
      code: `<EmojiPicker
  searchable={false}
  recent={["🔥", "💯", "👍", "🎉", "❤️"]}
  onSelect={(e) => insert(e)}
/>`,
      render: () => (
        <EmojiPicker searchable={false} recent={["🔥", "💯", "👍", "🎉", "❤️"]} onSelect={() => {}} />
      ),
    },
    {
      title: "更紧凑（6 列）",
      description: "columns 调整每行个数，配 className 收窄整体宽度。",
      code: `<EmojiPicker columns={6} className="w-60" onSelect={(e) => insert(e)} />`,
      render: () => <EmojiPicker columns={6} className="w-60" onSelect={() => {}} />,
    },
  ],
  controls: [
    { prop: "columns", type: "number", defaultValue: 8 },
    { prop: "searchable", type: "boolean", defaultValue: true },
  ],
  states: [
    { name: "默认", render: () => <EmojiPicker onSelect={() => {}} /> },
    { name: "追加到输入", render: () => <WithOutput /> },
    {
      name: "预置最近使用 + 隐藏搜索",
      render: () => <EmojiPicker searchable={false} recent={["🔥", "💯", "👍", "🎉", "❤️"]} onSelect={() => {}} />,
    },
    {
      name: "更紧凑（6 列）",
      render: () => <EmojiPicker columns={6} className="w-60" onSelect={() => {}} />,
    },
  ],
  renderWithProps: (p) => (
    <EmojiPicker
      columns={Number(p.columns) || 8}
      searchable={p.searchable as boolean}
      onSelect={() => {}}
    />
  ),
  toCode: (p) =>
    `<EmojiPicker${Number(p.columns) !== 8 ? ` columns={${p.columns}}` : ""}${p.searchable === false ? " searchable={false}" : ""} onSelect={(e) => insert(e)} />`,
};
