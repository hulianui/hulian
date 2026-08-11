---
slug: kbd
name: Kbd
category: typography
group: code
tags: []
exports: [Kbd, KbdGroup]
status: enriched
---

# Kbd

> 按键 · <kbd> 等宽皮肤 + KbdGroup 组合键容器 + RSC · typography/code

## 何时用

标注单个键位/快捷键（`Esc`、`⌘`、`K`），等宽键帽皮肤。组合键（`⌘ + K`）用同目录的 `KbdGroup` 包起来，它统一 gap、画分隔符、并给整组一个读屏名。两者都是 RSC，可在服务端组件直接用。展示代码片段用 [CodeBlock](../code-block/code-block.md)/[Snippet](../snippet/snippet.md)。

## 导入
```ts
import { Kbd, KbdGroup } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| ...HTMLAttributes | `HTMLAttributes<HTMLElement>` | — | 透传 `<kbd>` 原生属性（className、style 等） |

### KbdGroup Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| keys | `ReactNode[]` | — | 键名数组，逐个包成 Kbd。组合键的常规写法 |
| separator | `ReactNode` | `"+"` | 键之间的分隔符，装饰性（带 `aria-hidden`，不进无障碍树）。传 `null` 只留间距不画符号 |
| label | `string` | — | 整组的无障碍名，如「打开命令面板」。给了才会加 `role="group"` |
| ...HTMLAttributes | `HTMLAttributes<HTMLSpanElement>` | — | 透传外层 `<span>` 原生属性。rest 展开在最前，组件自己算出的 `role` / `aria-label` 赢（见「禁忌 / 坑」） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | Kbd 的键位内容；KbdGroup 上表示自己摆键帽（给了就忽略 `keys`） |

## 示例
```tsx
<Kbd>Esc</Kbd>

// 组合键：keys 数组是常规写法
<KbdGroup keys={["⌘", "K"]} label="打开命令面板" />

// 换分隔符 / 不要分隔符
<KbdGroup keys={["⌘", "⇧", "P"]} separator="·" />
<KbdGroup keys={["G", "T"]} separator={null} />

// 需要给某个键单独加样式或换内容时，改用 children，分隔符照插
<KbdGroup label="保存">
  <Kbd className="min-w-8">⌘</Kbd>
  <Kbd>S</Kbd>
</KbdGroup>
```

## 禁忌 / 坑

- 单个 Kbd 只渲染一个键帽，不内置 `+` 分隔；组合键请用 `KbdGroup`，别在调用处手搓 `inline-flex + gap + 分隔符` —— 那样每处的间距和分隔符样式都会各写一套。
- 如果不传 `label`，`KbdGroup` 不会加 `role="group"`，读屏把几个键帽念成互不相干的碎片。视觉上完全看不出差别，所以这一步最容易漏：只要这组键代表一个具体动作，就把动作名写进 `label`。
- `children` 与 `keys` 同时给时只用 `children`，`keys` 被忽略（两者同时生效没有合理语义）。
- **传 `role` 顶不掉组件自己的 `role="group"`**（`rest` 展开在根节点属性最前，见 [consuming.md §7](https://github.com/hulianui/hulian/blob/master/docs/consuming.md)）。没传 `label` 时组件不占 `role`，此时传什么就是什么。
- 不做符号映射（`Meta → ⌘`、`Ctrl → ⌃` 之类）。键名显示成什么取决于消费方的平台探测与文案口径，库内置一张表在跨平台产品里必然猜错。

## 相关
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
