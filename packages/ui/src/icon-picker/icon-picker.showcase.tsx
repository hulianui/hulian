"use client";
import { useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Eye,
  File,
  Folder,
  Gauge,
  Info,
  Link,
  List,
  Menu,
  Play,
  Plus,
  RefreshCw,
  Search,
  Wrench,
  X,
} from "../_icons";
import type { ShowcaseSpec } from "../showcase/types";
import { IconPicker } from "./icon-picker";
import type { IconPickerSource } from "./icon-picker.types";

// 演示用来源：故意只用瑚琏 _icons 里已有的几个，说明「图标集由消费方给」这件事。
const REGISTRY: Record<string, React.ReactNode> = {
  gauge: <Gauge />,
  menu: <Menu />,
  wrench: <Wrench />,
  eye: <Eye />,
  search: <Search />,
  link: <Link />,
  list: <List />,
  info: <Info />,
  plus: <Plus />,
  copy: <Copy />,
  refresh: <RefreshCw />,
  check: <Check />,
  close: <X />,
  play: <Play />,
  calendar: <Calendar />,
  clock: <Clock />,
  file: <File />,
  folder: <Folder />,
};

const renderIcon = (name: string) => REGISTRY[name] ?? null;

const SOURCES: IconPickerSource[] = [
  {
    key: "common",
    label: "常用",
    icons: [
      { name: "gauge", keywords: ["仪表盘", "首页"] },
      { name: "menu", keywords: ["菜单", "导航"] },
      { name: "wrench", keywords: ["设置", "配置", "工具"] },
      { name: "eye", keywords: ["查看", "预览"] },
      { name: "search", keywords: ["搜索", "查找"] },
      { name: "link", keywords: ["链接"] },
      { name: "list", keywords: ["列表"] },
      { name: "info", keywords: ["信息", "说明"] },
    ],
    renderIcon,
  },
  {
    key: "action",
    label: "操作",
    icons: [
      { name: "plus", keywords: ["新增", "添加"] },
      { name: "copy", keywords: ["复制"] },
      { name: "refresh", keywords: ["刷新", "重载"] },
      { name: "check", keywords: ["确认", "完成"] },
      { name: "close", keywords: ["关闭", "取消"] },
      { name: "play", keywords: ["运行", "执行"] },
      { name: "calendar", keywords: ["日期", "日历"] },
      { name: "clock", keywords: ["时间"] },
    ],
    renderIcon,
  },
];

function Demo({ columns = 8, searchable = true, clearable = true }: { columns?: number; searchable?: boolean; clearable?: boolean }) {
  const [v, setV] = useState<string | null>("gauge");
  return (
    <IconPicker
      sources={SOURCES}
      value={v}
      onValueChange={setV}
      columns={columns}
      searchable={searchable}
      clearable={clearable}
    />
  );
}

export const iconPickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "sources 由你给：每个分类带一组图标名 + 一个 renderIcon。选中后对外值就是图标名（后端一般也存名字）。",
      code: `const SOURCES = [
  {
    key: "common",
    label: "常用",
    icons: [{ name: "gauge", keywords: ["仪表盘"] }, { name: "menu" }],
    renderIcon: (name) => REGISTRY[name],
  },
]

<IconPicker sources={SOURCES} defaultValue="gauge" onValueChange={setIcon} />`,
      render: () => <IconPicker sources={SOURCES} defaultValue="gauge" />,
    },
    {
      title: "搜索跨全部分类",
      description:
        "按名字或 keywords 别名搜。搜索时分类页签隐藏——用户找图标时心里没有「它属于哪一类」这个概念。",
      code: `<IconPicker sources={SOURCES} searchPlaceholder="搜索图标（支持中文别名）" />`,
      render: () => <IconPicker sources={SOURCES} searchPlaceholder="搜索图标（支持中文别名）" />,
    },
    {
      title: "列数",
      description: "columns 控制网格列数，配合 className 调宽度。",
      code: `<IconPicker sources={SOURCES} columns={6} className="w-60" />`,
      render: () => <IconPicker sources={SOURCES} columns={6} className="w-60" />,
    },
    {
      title: "不可清除",
      description: "clearable={false} 去掉顶部的当前值与清除按钮（值必填的场景）。",
      code: `<IconPicker sources={SOURCES} defaultValue="play" clearable={false} />`,
      render: () => <IconPicker sources={SOURCES} defaultValue="play" clearable={false} />,
    },
  ],
  controls: [
    { prop: "columns", type: "select", options: ["6", "8", "10"], defaultValue: "8", label: "列数" },
    { prop: "searchable", type: "boolean", defaultValue: true, label: "可搜索" },
    { prop: "clearable", type: "boolean", defaultValue: true, label: "可清除" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "6 列", render: () => <Demo columns={6} /> },
    { name: "无搜索", render: () => <Demo searchable={false} /> },
    { name: "不可清除", render: () => <Demo clearable={false} /> },
  ],
  renderWithProps: (p) => (
    <Demo
      columns={Number(p.columns ?? 8) || 8}
      searchable={p.searchable !== false}
      clearable={p.clearable !== false}
    />
  ),
  toCode: (p) =>
    `<IconPicker\n  sources={SOURCES}\n  value={icon}\n  onValueChange={setIcon}${
      p.columns && Number(p.columns) !== 8 ? `\n  columns={${p.columns}}` : ""
    }${p.searchable === false ? "\n  searchable={false}" : ""}${p.clearable === false ? "\n  clearable={false}" : ""}\n/>`,
};
