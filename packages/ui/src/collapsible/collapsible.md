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

> 折叠或展开一块内容，带高度过渡 · navigation/action

## 何时用

单块「标题 + 可折叠内容」需要展开/收起时用（详情展开、查看更多、可选高级配置）。多组并列、需要互斥单开用 [Accordion](../accordion/accordion.md)；纯导航跳转用 [Command](../command/command.md)。

## 导入
```ts
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `Collapsible.open` | `boolean` | - | 受控展开态 |
| `Collapsible.defaultOpen` | `boolean` | `false` | 非受控初始展开态 |
| `Collapsible.disabled` | `boolean` | `false` | 禁用，不可展开 |
| `Collapsible.className` | `string` | - | 容器类名 |
| `CollapsibleTrigger.disabled` | `boolean` | `false` | 单独禁用触发器 |
| `CollapsiblePanel.plain` | `boolean` | `false` | 不画皮：不渲染内层那层内边距 + 次要文字色的皮肤 div，children 直接进 Panel |

### plain：面板装的是一整块功能区

`CollapsiblePanel` 默认在 Base UI 的 Panel 里再套一层 `px-3 pb-3 pt-1 text-sm text-muted-foreground` 的皮肤 div——它是按「折叠区里放一段短说明」设计的。折叠区里装的是**整块功能区**（集成配置表单、权限编辑器、带 `border-t` 与逐行内边距的列表）时加 `plain`：

```tsx
<CollapsiblePanel plain>
  <div className="divide-y divide-border border-t border-border">{/* 整块功能区 */}</div>
</CollapsiblePanel>
```

不加会撞两件事：`text-muted-foreground` 沿继承链把面板里所有没显式指定颜色的文字染成次要色（整块内容看起来像被禁用），内层的 `px-3` 又与内容自带的内边距叠加成双份。`className` 落在**外层** Panel 上，够不着内层——再包一层能把颜色抢回来，内边距抢不回来。

同名的 `plain` 在 [Accordion](../accordion/accordion.md) 的 Panel 与 [Card](../card/card.md) 的 `variant="plain"` 上语义一致：**内容自带外观时，要的不是改皮肤而是没有皮肤**。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `Collapsible.onOpenChange` | `(open: boolean) => void` | 展开态变化回调（瑚琏收敛签名，丢 Base UI eventDetails，同 Switch/Toggle 风格） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `Collapsible.children` | `ReactNode` | 包含 Trigger + Panel |
| `CollapsibleTrigger.children` | `ReactNode` | 标题行内容 |
| `CollapsiblePanel.children` | `ReactNode` | 折叠区内容 |

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
- 面板内容自带内边距/边框/正文色时加 `plain`，别再包一层去抢颜色——内边距抢不回来。

## 相关
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
