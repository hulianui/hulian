---
slug: accordion
name: Accordion
category: navigation
group: action
tags: []
exports: [Accordion, AccordionItem, AccordionTrigger, AccordionPanel]
status: enriched
---

# Accordion

> 手风琴 · Base UI 单/多开 + 高度过渡 · navigation/action

## 何时用

多组「标题 + 可折叠内容」并列（FAQ、设置分组、文档目录）时用，默认单开互斥、可切多开。只有单块内容要折叠用 [Collapsible](../collapsible/collapsible.md)；不需要折叠、只是导航跳转用 [Command](../command/command.md)。

## 导入
```ts
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@hulianui/ui"
```

## Props

`Accordion` / `AccordionItem` / `AccordionTrigger` / `AccordionPanel` 均为 Base UI 对应原语的薄包，透传其全部 props。常用如下：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `Accordion.multiple` | `boolean` | `false` | 是否允许同时展开多项；`false` 时为单开互斥 |
| `Accordion.defaultValue` | `string[]` | — | 非受控初始展开的 item value 数组 |
| `Accordion.value` | `string[]` | — | 受控展开态 |
| `Accordion.className` | `string` | — | 容器类名 |
| `AccordionItem.value` * | `string` | — | 该项唯一标识，与 `value`/`defaultValue` 对应 |
| `AccordionItem.disabled` | `boolean` | `false` | 禁用该项（不可展开/收起） |
| `AccordionPanel.plain` | `boolean` | `false` | 不画皮：不渲染内层那层内边距 + 次要文字色的皮肤 div，children 直接进 Panel |

`Accordion` 是泛型组件，`value` / `defaultValue` / `onValueChange` 的元素类型默认为 `string`。展开项的标识不是字符串（枚举、字面量联合）时显式写 `<Accordion<"a" | "b"> …>`。

### plain：面板装的是一整块功能区

`AccordionPanel` 默认在 Base UI 的 Panel 里再套一层 `px-4 pb-4 pt-1 text-sm text-muted-foreground` 的皮肤 div——它是按「面板里放一段短说明」设计的。面板里装的是**整块功能区**（权限编辑器、配置表单、带 `border-t` 与逐行内边距的列表）时加 `plain`：

```tsx
<AccordionPanel plain>
  <div className="divide-y divide-border border-t border-border">{/* 整块功能区 */}</div>
</AccordionPanel>
```

不加会撞两件事：`text-muted-foreground` 沿继承链把面板里所有没显式指定颜色的文字染成次要色（整块内容看起来像被禁用），内层的 `px-4` 又与内容自带的内边距叠加成双份、分隔线缩不到面板边缘。`className` 落在**外层** Panel 上，够不着内层——所以别用 `[&>div]:p-0` 这类任意变体选择器压库内结构，那等于把「内层是一个 div」写成外部契约，库里一改就断。

同名的 `plain` 在 [Collapsible](../collapsible/collapsible.md) 的 Panel 与 [Card](../card/card.md) 的 `variant="plain"` 上语义一致：**内容自带外观时，要的不是改皮肤而是没有皮肤**。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `Accordion.onValueChange` | `(value: string[]) => void` | 展开态变化回调（透传 Base UI Root），受控时配合 `value` 使用 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `AccordionTrigger.children` | `ReactNode` | 标题行内容 |
| `AccordionPanel.children` | `ReactNode` | 折叠区内容 |

## 示例
```tsx
<Accordion defaultValue={["ship"]}>
  <AccordionItem value="ship">
    <AccordionTrigger>瑚琏怎么发版？</AccordionTrigger>
    <AccordionPanel>本地 master 直接 commit，trunk-based，三道门全绿即可。</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="token">
    <AccordionTrigger>颜色怎么适配明暗？</AccordionTrigger>
    <AccordionPanel>只消费语义 token，Tailwind v4 dark variant 自动换肤。</AccordionPanel>
  </AccordionItem>
</Accordion>
```

多开：

```tsx
<Accordion multiple defaultValue={["ship", "token"]}>{/* …items */}</Accordion>
```

受控（展开项跟外部状态走）：

```tsx
const [open, setOpen] = useState<string[]>([]);

<Accordion multiple value={open} onValueChange={(v) => setOpen(v)}>{/* …items */}</Accordion>
```

## 禁忌 / 坑

- 高度展开/收起过渡走 Base UI 暴露的 `--accordion-panel-height` CSS 变量做纯 CSS transition，**不要**自己 `useLayoutEffect` 测 `scrollHeight`、也别上 framer-motion；padding 要放 Panel 内层 div 否则收起塌不到 0。详见 [[base-ui-accordion-panel-height-css-var-pure-css-transition]]。
- 受控与非受控二选一：传了 `value` 就别再传 `defaultValue`。
- 面板内容自带内边距/边框/正文色时加 `plain`，别用 `[&>div]:p-0` 之类的任意变体选择器去压库内那层皮肤 div。

## 相关
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
