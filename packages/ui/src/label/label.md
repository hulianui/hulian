---
slug: label
name: Label
category: forms
group: framework
tags: []
exports: [Label, labelClass]
status: enriched
---

# Label

> 表单标签原语 · `<label>` + 与 Field 同源皮肤 + htmlFor · forms/framework

## 何时用

页面已经有自己的排版、进不去 [Field](../field/field.md) 时，用 Label 出一个标签。典型是设置页「一行一个设置项」：左边标签 + 说明，右边控件。

需要 label / help / error 三段并自动串好 `aria-describedby`、`aria-invalid` 时用 [Field](../field/field.md)——横排版式它也有（`orientation="horizontal"`），那是更完整的答案。Label 只负责「一个标签」。

不要用多态 `Text as="label"` 顶替：那只是长得像标签，字号字重要自己对齐，库里一改就分叉，`htmlFor`/`id` 的关联也得自己维护。

## 导入
```ts
import { Label } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| htmlFor | `string` | — | 关联控件的 id，渲染为原生 `for`；点标签即聚焦控件，读屏也据此念标签 |
| className | `string` | — | 追加到 `<label>`（默认 `text-sm font-medium text-foreground`）；走 twMerge，传 `text-xs` 会顶掉默认字号 |
| children | `ReactNode` | — | 标签文字 |

其余 `<label>` 原生属性（`id` / `title` / `data-*` / `aria-*` / `onClick` …）原样透传到根节点。

## 导出

| 名称 | 类型 | 说明 |
|------|------|------|
| labelClass | `string` | 标签皮肤的唯一真源，Label 与 Field 的 label 段共用；要把同款皮肤贴到别的元素（如 `<legend>`）上时用它，别抄字面量 |

## 示例
```tsx
// 基础：htmlFor 指向控件 id
<Label htmlFor="email">邮箱</Label>
<Input id="email" placeholder="you@work.com" />

// 设置行：左标签右控件
<div className="flex items-center justify-between">
  <Label htmlFor="sidebar">保持侧边栏展开</Label>
  <Switch id="sidebar" defaultChecked />
</div>

// 改字号：className 走 twMerge，顶掉默认的 text-sm
<Label htmlFor="theme" className="text-xs">主题</Label>
```

## 禁忌 / 坑

- `htmlFor` 不传就只是一段长得像标签的文字：点它不聚焦，读屏也不会把它念成控件的名字。传了就要保证与控件 `id` 一致。在 [Field](../field/field.md) 里这层关联是白送的（Base UI 自动生成 id 并串好），独立用 Label 时得自己维护。
- 标签与控件同时要 help 文案、错误提示、`invalid` 联动时，别用 `Label` + 手写 `<p>` 拼——那样会丢掉自动的 `aria-describedby` 串联。改用 [Field](../field/field.md)。
- 皮肤不要复制成字面量。要改标签外观就改 `labelClass`（或用 `className` 局部顶掉），复制一份的话 Field 出的标签与手写标签会在同一页面里分叉。

## 相关
[Field](../field/field.md) · [Form](../form/form.md) · [Input](../input/input.md) · [Switch](../switch/switch.md) · [Text](../text/text.md)
