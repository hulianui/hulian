"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Tag } from "../tag";
import { ComponentPicker, ComponentPickerCommand } from "./component-picker";
import { parseComponentCatalog } from "./component-picker-catalog";
import type { ComponentPickerItem } from "./component-picker.types";

const DEMO_ITEMS: ComponentPickerItem[] = [
  {
    slug: "button",
    name: "Button",
    description: "按钮 · 变体与尺寸",
    category: "forms",
    group: "basic",
    props: [
      { name: "variant", type: '"solid" | "ghost"', default: '"solid"', description: "视觉变体" },
      { name: "loading", type: "boolean", default: "false", description: "加载态" },
    ],
    examples: [{ title: "基础用法", lang: "tsx", code: "<Button>确定</Button>" }],
  },
  {
    slug: "input",
    name: "Input",
    description: "输入框 · 前后缀插槽",
    category: "forms",
    group: "basic",
    props: [{ name: "prefix", type: "ReactNode", description: "前缀插槽" }],
  },
  {
    slug: "table",
    name: "Table",
    description: "表格 · 排序与固定列",
    category: "data-display",
    group: "collection",
    props: [{ name: "enableSorting", type: "boolean", default: "true", description: "是否可排序" }],
    examples: [{ title: "基础用法", lang: "tsx", code: "<Table columns={columns} data={rows} />" }],
  },
  {
    slug: "tree",
    name: "Tree",
    description: "递归树 · 键盘可达",
    category: "data-display",
    group: "collection",
  },
  {
    slug: "empty",
    name: "Empty",
    description: "空状态 · 图标与描述",
    category: "data-display",
    group: "placeholder",
    props: [{ name: "title", type: "ReactNode", description: "主标题" }],
  },
  {
    slug: "command",
    name: "Command",
    description: "命令面板 · 模糊搜索",
    category: "navigation",
    group: "action",
    tags: ["overlay"],
  },
];

/** 逐字照 llms-full.txt 的结构写的一小段，用来演示解析器。 */
const CATALOG_TEXT = [
  "<!-- ════ -->",
  "# Spinner",
  "",
  "> 加载指示 · 三档尺寸 · feedback/status",
  "",
  "## Props",
  "",
  "| 名称 | 类型 | 默认 | 说明 |",
  "|------|------|------|------|",
  '| size | `"sm" \\| "md"` | `"md"` | 尺寸 |',
  "",
  "<!-- ════ -->",
  "# Skeleton",
  "",
  "> 骨架屏 · 占位动画 · feedback/status",
  "",
  "## Props",
  "",
  "| 名称 | 类型 | 默认 | 说明 |",
  "|------|------|------|------|",
  "| lines | `number` | `3` | 行数 |",
].join("\n");

const PARSED = parseComponentCatalog(CATALOG_TEXT);

const Basic = () => <ComponentPicker items={DEMO_ITEMS} className="h-[420px]" />;

const WithPreview = () => (
  <ComponentPicker
    items={DEMO_ITEMS}
    className="h-[420px]"
    defaultActiveSlug="button"
    showPreview
    showExamples={false}
    renderPreview={(item) =>
      item.slug === "button" ? <Button size="sm">确定</Button> : <Tag>{item.name}</Tag>
    }
  />
);

const CommandDemo = () => {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button size="sm" onClick={() => setOpen(true)}>
        打开命令面板
      </Button>
      {picked && <Tag tone="brand">{picked}</Tag>}
      <ComponentPickerCommand
        items={DEMO_ITEMS}
        open={open}
        onOpenChange={setOpen}
        onSelect={(slug) => setPicked(slug)}
      />
    </div>
  );
};

const FromCatalog = () => (
  <ComponentPicker items={PARSED} className="h-[320px]" showTree={false} defaultActiveSlug="spinner" />
);

export const componentPickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "左侧分类树 + 顶部搜索 + 结果网格。目录由消费方喂进来，组件自己不取数。",
      code: `<ComponentPicker items={items} className="h-[420px]" />`,
      render: () => <Basic />,
    },
    {
      title: "注入 live 预览",
      description: "组件库渲染不了任意 slug 的实例，所以预览走 renderPreview 注入；不传则显示占位。",
      code: `<ComponentPicker
  items={items}
  className="h-[420px]"
  defaultActiveSlug="button"
  showPreview
  showExamples={false}
  renderPreview={(item) => (item.slug === "button" ? <Button size="sm">确定</Button> : <Tag>{item.name}</Tag>)}
/>`,
      render: () => <WithPreview />,
    },
    {
      title: "从 llms-full.txt 解析目录",
      description: "解析是纯函数，在消费方那层调用；组件不发网络请求也不假设文件存在。",
      code: `import { ComponentPicker, parseComponentCatalog } from "@hulianui/ui";

const items = parseComponentCatalog(await fetch("/llms-full.txt").then((r) => r.text()));

<ComponentPicker items={items} className="h-[320px]" showTree={false} />`,
      render: () => <FromCatalog />,
    },
    {
      title: "命令面板形态",
      description: "已经知道要哪个组件时用它；分类树与属性表放不进一条命令行，所以它只是薄封装。",
      code: `const [open, setOpen] = useState(false);

<ComponentPickerCommand items={items} open={open} onOpenChange={setOpen} onSelect={(slug) => insert(slug)} />`,
      render: () => <CommandDemo />,
    },
  ],
  controls: [
    { prop: "showTree", type: "boolean", defaultValue: true, label: "分类树" },
    { prop: "showPreview", type: "boolean", defaultValue: false, label: "预览区" },
    { prop: "showProps", type: "boolean", defaultValue: true, label: "属性表" },
    { prop: "showExamples", type: "boolean", defaultValue: true, label: "示例代码" },
  ],
  states: [
    { name: "浏览目录", render: () => <Basic /> },
    {
      name: "已选中组件",
      render: () => (
        <ComponentPicker items={DEMO_ITEMS} className="h-[420px]" defaultActiveSlug="table" />
      ),
    },
    {
      name: "无结果",
      render: () => (
        <ComponentPicker items={DEMO_ITEMS} className="h-[320px]" defaultFilter={{ search: "zzzz" }} />
      ),
    },
  ],
  renderWithProps: (props) => (
    <ComponentPicker items={DEMO_ITEMS} className="h-[420px]" defaultActiveSlug="button" {...props} />
  ),
  toCode: (props) =>
    `<ComponentPicker items={items} className="h-[420px]"${
      props.showTree === false ? " showTree={false}" : ""
    }${props.showPreview ? " showPreview" : ""}${props.showProps === false ? " showProps={false}" : ""}${
      props.showExamples === false ? " showExamples={false}" : ""
    } />`,
};
