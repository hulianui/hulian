---
slug: input
name: Input
category: forms
group: basic
tags: []
exports: [Input, inputShellVariants]
status: enriched
---

# Input

> 输入框 · Base UI Field + 前后缀 + invalid · forms/basic

## 何时用

单行文本输入。多行文本用 [Textarea](../textarea/textarea.md)；从固定选项里选一项用 [Select](../select/select.md)；布尔/多选/单选分别用 [Switch](../switch/switch.md) / [Checkbox](../checkbox/checkbox.md) / [Radio](../radio/radio.md)。放进 hulian Field 内会自动接管 label/error/aria 关联。

## 导入
```ts
import { Input, inputShellVariants } from "@hulianui/ui"
```

## Props

继承原生 `<input>` 属性（除 `size`/`prefix` 被下方覆盖外，如 `value`/`onChange`/`type`/`placeholder`/`disabled`…）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸（CVA 变体，覆盖原生 size） |
| invalid | `boolean` | `false` | 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动，无需重复传 |
| prefix | `ReactNode` | — | 前缀内容（如 `¥`） |
| suffix | `ReactNode` | — | 后缀内容（如 `.00`） |
| disabled | `boolean` | `false` | 禁用 |

## 示例
```tsx
<Input placeholder="请输入…" className="w-64" />
```
```tsx
{/* 前后缀 */}
<Input prefix="¥" suffix=".00" placeholder="0" className="w-64" />
```

## 禁忌 / 坑

在 hulian Field 内时不要重复传 `invalid`——Field.Root 的 invalid 会自动驱动标红，手动再传会冲突。`invalid` 只在脱离 Field 独立使用时手动传。

## 相关
[Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
