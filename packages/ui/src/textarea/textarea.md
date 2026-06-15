---
slug: textarea
name: Textarea
category: forms
group: basic
tags: []
exports: [Textarea, textareaVariants]
status: enriched
---

# Textarea

> 多行输入 · 自适应高度 · forms/basic

## 何时用

多行文本输入（备注、描述、留言）。单行输入用 [Input](../input/input.md)；从固定选项选一项用 [Select](../select/select.md)。开 `autoResize` 让高度随内容增长，`rows` 作为下限。放进 hulian Field 内会自动接管 label/error/aria 关联。

## 导入
```ts
import { Textarea, textareaVariants } from "@hulianui/ui"
```

## Props

继承原生 `<textarea>` 属性（除 `size` 被覆盖外，如 `value`/`onChange`/`rows`/`placeholder`/`disabled`…）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸（CVA 变体，覆盖原生 size） |
| invalid | `boolean` | `false` | 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动 |
| autoResize | `boolean` | `false` | 随内容自适应高度（JS scrollHeight，`rows` 为下限） |
| rows | `number` | `3` | 初始/最小行高 |
| disabled | `boolean` | `false` | 禁用 |

## 示例
```tsx
<Textarea placeholder="写点什么…" className="w-64" />
```
```tsx
{/* 自适应高度 */}
<Textarea autoResize defaultValue={"随内容长高\n第二行\n第三行"} className="w-64" />
```

## 禁忌 / 坑

- 实现/扩展 field-aware Textarea 时见 [[base-ui-field-control-render-textarea-type-safe]]：Base UI Field 无 Textarea 原语，textarea 专属 props（ref/rows/onInput）要放在 `render` 元素上而非 `Field.Control`，否则 TS 报 ref 类型错或静默丢 Field a11y 接线。
- 在 hulian Field 内不要重复传 `invalid`，由 Field.Root 自动驱动。

## 相关
[Input](../input/input.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
