"use client";
import { useState } from "react";
import { Calculator, Calendar, FileText, Plus, Settings, User } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { Command } from "./command";
import type { CommandGroupData } from "./command.types";

const groups: CommandGroupData[] = [
  {
    heading: "常用",
    items: [
      { value: "new", label: "新建文件", keywords: "create file 文件", icon: <Plus />, shortcut: "⌘N" },
      { value: "search", label: "搜索文档", keywords: "search docs 文档", icon: <FileText /> },
      { value: "calendar", label: "打开日历", keywords: "calendar 日程", icon: <Calendar /> },
    ],
  },
  {
    heading: "设置",
    items: [
      { value: "profile", label: "个人资料", keywords: "profile account 账户", icon: <User /> },
      { value: "settings", label: "偏好设置", keywords: "settings preferences", icon: <Settings />, shortcut: "⌘," },
      { value: "calc", label: "计算器（禁用）", keywords: "calculator", icon: <Calculator />, disabled: true },
    ],
  },
];

function Demo({
  placeholder,
  shortcut,
  closeOnSelect,
}: {
  placeholder?: string;
  shortcut?: boolean;
  closeOnSelect?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        打开命令面板{shortcut ? "（或 ⌘K）" : ""}
      </Button>
      <Command
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        placeholder={placeholder}
        shortcut={shortcut}
        closeOnSelect={closeOnSelect}
      />
    </>
  );
}

export const commandShowcase: ShowcaseSpec = {
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "输入命令或搜索…" },
    { prop: "shortcut", type: "boolean", defaultValue: false, label: "内置 ⌘K" },
    { prop: "closeOnSelect", type: "boolean", defaultValue: true, label: "选后关闭" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "内置 ⌘K 快捷键", render: () => <Demo shortcut /> },
  ],
  renderWithProps: (p) => (
    <Demo
      placeholder={(p.placeholder as string) || undefined}
      shortcut={p.shortcut as boolean}
      closeOnSelect={p.closeOnSelect as boolean}
    />
  ),
  toCode: (p) =>
    `const [open, setOpen] = useState(false);\n\n<Button onClick={() => setOpen(true)}>打开命令面板</Button>\n<Command\n  open={open}\n  onOpenChange={setOpen}\n  placeholder="${(p.placeholder as string) ?? "输入命令或搜索…"}"\n  shortcut={${Boolean(p.shortcut)}}\n  groups={[\n    { heading: "常用", items: [{ value: "new", label: "新建文件", onSelect: (v) => {} }] },\n  ]}\n/>`,
};
