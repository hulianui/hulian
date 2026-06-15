"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Kbd } from "./kbd";

export const kbdShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "单键",
      description: "包裹单个按键名，渲染为带边框的键帽样式。",
      code: `<Kbd>Esc</Kbd>`,
      render: () => <Kbd>Esc</Kbd>,
    },
    {
      title: "组合键",
      description: "组合键靠并排多个 Kbd 拼出，中间用分隔符连接。",
      code: `<span className="inline-flex items-center gap-1">
  <Kbd>⌘</Kbd>
  <span className="text-muted">+</span>
  <Kbd>K</Kbd>
</span>`,
      render: () => (
        <span className="inline-flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <span className="text-muted">+</span>
          <Kbd>K</Kbd>
        </span>
      ),
    },
    {
      title: "嵌入正文",
      description: "随文展示快捷键，键帽与文字基线对齐。",
      code: `<span className="text-sm text-muted">
  按 <Kbd>⌘</Kbd> <Kbd>S</Kbd> 保存
</span>`,
      render: () => (
        <span className="text-sm text-muted">
          按 <Kbd>⌘</Kbd> <Kbd>S</Kbd> 保存
        </span>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "single", render: () => <Kbd>Esc</Kbd> },
    {
      name: "combo",
      render: () => (
        <span className="inline-flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <span className="text-muted">+</span>
          <Kbd>K</Kbd>
        </span>
      ),
    },
    {
      name: "in-text",
      render: () => (
        <span className="text-sm text-muted">
          按 <Kbd>⌘</Kbd> <Kbd>S</Kbd> 保存
        </span>
      ),
    },
  ],
  renderWithProps: () => (
    <span className="inline-flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </span>
  ),
  toCode: () => `<Kbd>⌘</Kbd> <Kbd>K</Kbd>`,
};
