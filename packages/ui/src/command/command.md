---
slug: command
name: Command
category: navigation
group: action
tags: []
exports: [Command, useCommandShortcut]
status: enriched
---

# Command

> 命令面板 · ⌘K 模态(复用 Dialog 引擎) + 实时过滤 + 分组 + 键盘漫游(零依赖) · navigation/action

## 何时用

⌘K 召唤的命令面板：跨页跳转、操作触发、主题切换汇于一处，带实时过滤、分组与键盘漫游。需要常驻可见的一排按钮用 [Toolbar](../toolbar/toolbar.md)；需要右键弹出的上下文动作用 [ContextMenu](../context-menu/context-menu.md)；Command 是搜索式、模态、数据驱动的全局命令入口。

## 导入
```ts
import { Command, useCommandShortcut } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| open* | `boolean` | — | 受控开合。 |
| onOpenChange* | `(open: boolean) => void` | — | 开合变化回调。 |
| groups* | `CommandGroupData[]` | — | 命令分组（每组可带 heading）。 |
| placeholder | `string` | — | 搜索框占位符。 |
| filter | `(item: CommandItemData, query: string) => boolean` | 默认子串匹配 | 自定义过滤，返回 true 保留。默认大小写不敏感匹配 `keywords` + 字符串型 `label` + `value`。 |
| onSelectItem | `(value: string) => void` | — | 任意项执行后回调（在 `item.onSelect` 之后触发）。 |
| closeOnSelect | `boolean` | `true` | 执行项后是否自动关闭面板。 |
| emptyMessage | `ReactNode` | — | 无匹配项时的空态文案。 |
| shortcut | `boolean` | `false` | 内置 ⌘K / Ctrl+K 全局快捷键切换开合。 |
| className | `string` | — | — |
| aria-label | `string` | — | — |

**CommandGroupData**：`heading?: ReactNode` / `items: CommandItemData[]`。

**CommandItemData**

| 字段 | 类型 | 说明 |
|------|------|------|
| value* | `string` | 唯一值（回调入参 + key + 过滤兜底文本）。 |
| label* | `ReactNode` | 显示标题。 |
| keywords | `string` | 参与过滤的关键词（label 非字符串时建议补）。 |
| description | `ReactNode` | label 下方 muted 小字。 |
| icon | `ReactNode` | 行首图标插槽。 |
| shortcut | `ReactNode` | 行尾快捷键/标记插槽。 |
| disabled | `boolean` | — |
| onSelect | `(value: string) => void` | 该项被执行（Enter / 点击）时回调。 |

## 示例
```tsx
const groups = [
  {
    heading: "快速跳转",
    items: [
      { value: "go-orders", label: "订单管理", keywords: "order 订单 dd", icon: <ShoppingCart />, onSelect: () => router.push("/orders") },
      { value: "new-order", label: "新建订单", icon: <Plus />, shortcut: "⌘N" },
    ],
  },
];

const [open, setOpen] = useState(false);
<Command open={open} onOpenChange={setOpen} groups={groups} shortcut placeholder="输入命令或搜索…" />
```

## 禁忌 / 坑

- 始终受控：必须同时提供 `open` + `onOpenChange`。
- `label` 不是字符串时默认过滤匹配不到它，需为该项补 `keywords`（否则只能靠 `value` 命中）。
- 内置快捷键用 `shortcut` 一键开启；若想在面板外自绑触发逻辑，改用 `useCommandShortcut`，别同时开 `shortcut`。

## 相关
[ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
