---
slug: collapsible
name: Collapsible
category: navigation
group: action
tags: []
exports: [Collapsible, CollapsibleTrigger, CollapsiblePanel]
status: enriched
---

# Collapsible

> 折叠区 · Base UI collapsible 薄包 + 高度过渡(复用 Accordion --collapsible-panel-height) · navigation/action

## 何时用

单块「标题 + 可折叠内容」需要展开/收起时用（详情展开、查看更多、可选高级配置）。多组并列、需要互斥单开用 [Accordion](../accordion/accordion.md)；纯导航跳转用 [Command](../command/command.md)。

## 导入
```ts
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `Collapsible.open` | `boolean` | — | 受控展开态 |
| `Collapsible.defaultOpen` | `boolean` | `false` | 非受控初始展开态 |
| `Collapsible.onOpenChange` | `(open: boolean) => void` | — | 展开态变化回调（瑚琏收敛签名，丢 Base UI eventDetails，同 Switch/Toggle 风格） |
| `Collapsible.disabled` | `boolean` | `false` | 禁用，不可展开 |
| `Collapsible.className` | `string` | — | 容器类名 |
| `Collapsible.children` | `ReactNode` | — | 包含 Trigger + Panel |
| `CollapsibleTrigger.disabled` | `boolean` | `false` | 单独禁用触发器 |
| `CollapsibleTrigger.children` | `ReactNode` | — | 标题行内容 |
| `CollapsiblePanel.children` | `ReactNode` | — | 折叠区内容 |

## 示例
```tsx
<Collapsible className="w-80">
  <CollapsibleTrigger>展开查看详情</CollapsibleTrigger>
  <CollapsiblePanel>这里是默认折叠起来的补充内容，点击标题即可展开。</CollapsiblePanel>
</Collapsible>
```

默认展开：

```tsx
<Collapsible defaultOpen className="w-80">
  <CollapsibleTrigger>收起详情</CollapsibleTrigger>
  <CollapsiblePanel>这里是默认展开的补充内容。</CollapsiblePanel>
</Collapsible>
```

## 禁忌 / 坑

- 高度过渡复用 Base UI 暴露的 `--collapsible-panel-height` CSS 变量做纯 CSS transition，padding 放 Panel 内层 div 否则收起塌不到 0；别手测 `scrollHeight` 或上动画库。详见 [[base-ui-accordion-panel-height-css-var-pure-css-transition]]。
- 受控用 `open` + `onOpenChange`，非受控用 `defaultOpen`，二者不要混用。

## 相关
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
