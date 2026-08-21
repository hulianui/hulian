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

> 用快捷键唤起面板，搜索并执行分好组的命令 · navigation/action

## 何时用

⌘K 召唤的命令面板：跨页跳转、操作触发、主题切换汇于一处，带实时过滤、分组与键盘漫游。需要常驻可见的一排按钮用 [Toolbar](../toolbar/toolbar.md)；需要右键弹出的上下文动作用 [ContextMenu](../context-menu/context-menu.md)；Command 是搜索式、模态、数据驱动的全局命令入口。

## 导入
```ts
import { Command, useCommandShortcut } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| open* | `boolean` | - | 受控开合。 |
| groups* | `CommandGroupData[]` | - | 命令分组（每组可带 heading）。 |
| placeholder | `string` | - | 搜索框占位符。 |
| filter | `(item: CommandItemData, query: string) => boolean` | 默认子串匹配 | 自定义过滤，返回 true 保留。默认大小写不敏感匹配 `keywords` + 字符串型 `label` + `value`。 |
| closeOnSelect | `boolean` | `true` | 执行项后是否自动关闭面板。 |
| autoHighlight | `boolean` | `true` | 打开面板与每次过滤后自动高亮首个可用项（跳过禁用项），于是「打字 → 回车」直接命中。关掉则必须先按方向键点亮某项，回车才有动作。 |
| shortcut | `boolean` | `false` | 内置 ⌘K / Ctrl+K 全局快捷键切换开合。 |
| surface | `"solid" \| "glass" \| "none"` | `"solid"` | 外壳表面皮肤（只管填充/描边/阴影，尺寸与定位始终由组件负责）。`glass` = 半透明 + 背景模糊（需身后有底图）；`none` = 一个皮肤类都不画，全交给 `className` |
| className | `string` | - | 追加到面板外壳 |
| backdropClassName | `string` | - | 追加到遮罩层（默认 `bg-black/40 backdrop-blur-sm`），走 twMerge，可调浓度/模糊 |
| aria-label | `string` | - | - |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onOpenChange* | `(open: boolean) => void` | 开合变化回调。 |
| onSelectItem | `(value: string) => void` | 任意项执行后回调（在 `item.onSelect` 之后触发，拿到 value）。 |
| onQueryChange | `(query: string) => void` | 搜索词变化回调（含每次打开面板时的清空）。搜索词是内部状态，默认外部读不到；要**自己排序/分组**时用它同步出去，再配 `filter={() => true}` 由消费方全权决定 `groups`。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| emptyMessage | `ReactNode` | 无匹配项时的空态文案。 |
| footer | `ReactNode` | 列表下方常驻页脚（模式切换 / 提示 / 计数）。在列表之外，不参与列表滚动，也不随过滤结果变化消失。 |

### footer：面板底部那条常驻控件

面板是模态的，页脚里的控件没有别处可放：把「建立关联 / 建立阻塞」这类**决定本次选取语义**的开关前置到触发器，用户就得先决定再开始搜；常驻到页面上，面板关着时它还杵在那儿。放进 `footer` 才能「搜完了再定」：

```tsx
<Command
  open={open}
  onOpenChange={setOpen}
  groups={groups}
  footer={
    <div className="flex items-center justify-between gap-2">
      <Segmented value={mode} onValueChange={setMode} items={[{ value: "related", label: "关联" }, { value: "blocks", label: "阻塞" }]} />
      <span className="text-xs text-muted-foreground">选择任务</span>
    </div>
  }
/>
```

组件内部只给版式（顶部分隔线 + 内边距 + 面板自身的 `text-sm` 字号），页脚内部的布局与配色由内容自己定 —— 与 `ComboboxContent` 的 `footer` 同口径。

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
| disabled | `boolean` | - |
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
- 命令项是删除 / 重置 / 发布这类破坏性操作时，考虑 `autoHighlight={false}`：默认「打开即高亮首项」配上手滑回车就是误触。关掉后高亮要用户自己按方向键点亮，回车才有动作。
- 换皮肤优先用 `surface="none"` + 自己的类，而不是靠 `className` 去「压掉」`solid` 的 `bg-surface / border-hairline / shadow-xl`：压的写法在库升级皮肤时会打架，而且为了换底色要连布局类一起承担 twMerge 的不确定性。
- `surface="glass"` 需要**身后有底图**才是玻璃；纯色页面上它只是个半透明面板。遮罩浓度另有 `backdropClassName`，两者是两个旋钮。
- 高亮跟着**项的 `value`** 走，不跟数组引用走：过滤后原高亮项还在就不动它，所以 `groups` 每次渲染新建也不会让高亮乱跳。反过来说 `value` 必须稳定（别用数组下标当 value），否则每批结果都会被当成新项。

## 相关
[ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
