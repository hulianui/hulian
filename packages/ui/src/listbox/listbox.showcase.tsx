"use client";
import { useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Listbox } from "./listbox";
import type { ListboxItemData } from "./listbox.types";

const items: ListboxItemData[] = [
  { key: "profile", label: "个人资料", description: "查看与编辑账户", startContent: <User className="size-4" /> },
  { key: "settings", label: "设置", description: "偏好与通知", startContent: <Settings className="size-4" /> },
  { key: "shortcut", label: "快捷键", endContent: <kbd className="font-mono text-xs">⌘K</kbd> },
  { key: "disabled", label: "停用项", disabled: true },
  { key: "logout", label: "退出登录", startContent: <LogOut className="size-4" /> },
];

function Demo({ mode }: { mode: "single" | "multiple" }) {
  const [keys, setKeys] = useState<string[]>(mode === "single" ? ["profile"] : ["profile", "settings"]);
  return <Listbox items={items} selectionMode={mode} selectedKeys={keys} onSelectionChange={setKeys} />;
}

export const listboxShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "单选",
      description: "selectionMode=\"single\"，点选/方向键漫游，选中项打勾。",
      code: `<Listbox
  items={items}
  selectionMode="single"
  defaultSelectedKeys={["profile"]}
  onSelectionChange={setKeys}
/>`,
      render: () => (
        <Listbox items={items} selectionMode="single" defaultSelectedKeys={["profile"]} />
      ),
    },
    {
      title: "多选",
      description: "selectionMode=\"multiple\"，可多选，aria-multiselectable 自动开启。",
      code: `<Listbox
  items={items}
  selectionMode="multiple"
  defaultSelectedKeys={["profile", "settings"]}
  onSelectionChange={setKeys}
/>`,
      render: () => (
        <Listbox
          items={items}
          selectionMode="multiple"
          defaultSelectedKeys={["profile", "settings"]}
        />
      ),
    },
    {
      title: "纯动作列表",
      description: "selectionMode=\"none\" 不持有选中态，仅靠 onAction 触发命令。",
      code: `<Listbox
  items={items}
  selectionMode="none"
  onAction={(key) => console.log(key)}
  aria-label="动作列表"
/>`,
      render: () => (
        <Listbox items={items} selectionMode="none" onAction={() => {}} aria-label="动作列表" />
      ),
    },
    {
      title: "插槽与描述",
      description: "startContent 图标、description 次级文案、endContent 快捷键、disabled 停用。",
      code: `const items = [
  { key: "profile", label: "个人资料", description: "查看与编辑账户", startContent: <User className="size-4" /> },
  { key: "shortcut", label: "快捷键", endContent: <kbd className="font-mono text-xs">⌘K</kbd> },
  { key: "disabled", label: "停用项", disabled: true },
];

<Listbox items={items} selectionMode="single" />`,
      render: () => <Listbox items={items} selectionMode="single" />,
    },
  ],
  controls: [
    { prop: "selectionMode", type: "select", options: ["single", "multiple", "none"], defaultValue: "single" },
  ],
  states: [
    { name: "single", render: () => <Demo mode="single" /> },
    { name: "multiple", render: () => <Demo mode="multiple" /> },
    {
      name: "action-only",
      render: () => <Listbox items={items} selectionMode="none" onAction={() => {}} aria-label="动作列表" />,
    },
  ],
  renderWithProps: (p) => {
    const mode = (p.selectionMode as "single" | "multiple" | "none") ?? "single";
    return mode === "none" ? (
      <Listbox items={items} selectionMode="none" aria-label="动作列表" />
    ) : (
      <Demo mode={mode} />
    );
  },
  toCode: (p) =>
    `<Listbox\n  items={items}\n  selectionMode="${(p.selectionMode as string) ?? "single"}"\n  selectedKeys={keys}\n  onSelectionChange={setKeys}\n/>`,
};
