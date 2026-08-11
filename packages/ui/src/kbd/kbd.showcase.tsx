"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Kbd, KbdGroup } from "./kbd";

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
      description: "KbdGroup 收口 gap 与分隔符，默认用 + 连接。",
      code: `<KbdGroup keys={["⌘", "K"]} />`,
      render: () => <KbdGroup keys={["⌘", "K"]} />,
    },
    {
      title: "换分隔符 / 不要分隔符",
      description: "separator 可换成任意节点；传 null 只留间距。",
      code: `<KbdGroup keys={["⌘", "⇧", "P"]} separator="·" />
<KbdGroup keys={["G", "T"]} separator={null} />`,
      render: () => (
        <div className="flex items-center gap-4">
          <KbdGroup keys={["⌘", "⇧", "P"]} separator="·" />
          <KbdGroup keys={["G", "T"]} separator={null} />
        </div>
      ),
    },
    {
      title: "读屏名",
      description: "label 给整组一个无障碍名，分隔符本身不进无障碍树。",
      code: `<KbdGroup keys={["⌘", "K"]} label="打开命令面板" />`,
      render: () => <KbdGroup keys={["⌘", "K"]} label="打开命令面板" />,
    },
    {
      title: "自己摆键帽",
      description: "需要给某个键单独加样式或换内容时改用 children，分隔符照插。",
      code: `<KbdGroup label="保存">
  <Kbd className="min-w-8">⌘</Kbd>
  <Kbd>S</Kbd>
</KbdGroup>`,
      render: () => (
        <KbdGroup label="保存">
          <Kbd className="min-w-8">⌘</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
      ),
    },
    {
      title: "嵌入正文",
      description: "随文展示快捷键，键帽与文字基线对齐。",
      code: `<span className="text-sm text-muted-foreground">
  按 <KbdGroup keys={["⌘", "S"]} label="保存" /> 即可保存
</span>`,
      render: () => (
        <span className="text-sm text-muted-foreground">
          按 <KbdGroup keys={["⌘", "S"]} label="保存" /> 即可保存
        </span>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "single", render: () => <Kbd>Esc</Kbd> },
    { name: "group", render: () => <KbdGroup keys={["⌘", "K"]} /> },
    { name: "group-dot", render: () => <KbdGroup keys={["⌘", "⇧", "P"]} separator="·" /> },
    { name: "group-bare", render: () => <KbdGroup keys={["G", "T"]} separator={null} /> },
    {
      name: "group-labeled",
      render: () => <KbdGroup keys={["⌘", "K"]} label="打开命令面板" />,
    },
    {
      name: "in-text",
      render: () => (
        <span className="text-sm text-muted-foreground">
          按 <KbdGroup keys={["⌘", "S"]} label="保存" /> 即可保存
        </span>
      ),
    },
  ],
  renderWithProps: () => <KbdGroup keys={["⌘", "K"]} label="打开命令面板" />,
  toCode: () => `<KbdGroup keys={["⌘", "K"]} label="打开命令面板" />`,
};
