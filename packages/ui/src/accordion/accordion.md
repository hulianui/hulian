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
| `Accordion.value` / `onValueChange` | `string[]` / `(v) => void` | — | 受控展开态 |
| `Accordion.className` | `string` | — | 容器类名 |
| `AccordionItem.value` * | `string` | — | 该项唯一标识，与 `value`/`defaultValue` 对应 |
| `AccordionItem.disabled` | `boolean` | `false` | 禁用该项（不可展开/收起） |
| `AccordionTrigger.children` | `ReactNode` | — | 标题行内容 |
| `AccordionPanel.children` | `ReactNode` | — | 折叠区内容 |

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

## 禁忌 / 坑

- 高度展开/收起过渡走 Base UI 暴露的 `--accordion-panel-height` CSS 变量做纯 CSS transition，**不要**自己 `useLayoutEffect` 测 `scrollHeight`、也别上 framer-motion；padding 要放 Panel 内层 div 否则收起塌不到 0。详见 [[base-ui-accordion-panel-height-css-var-pure-css-transition]]。
- 受控与非受控二选一：传了 `value` 就别再传 `defaultValue`。

## 相关
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
