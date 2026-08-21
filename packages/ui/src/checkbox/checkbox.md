---
slug: checkbox
name: Checkbox
category: forms
group: basic
tags: []
exports: [Checkbox]
status: enriched
---

# Checkbox

> 切换一个独立的布尔值，支持半选态 · forms/basic

## 何时用

单个布尔勾选（同意条款、记住我），或带半选（`indeterminate`）的「全选」父框。多个互相协调的复选项用 [CheckboxGroup](../checkbox-group/checkbox-group.md) 包裹（值数组统一管理）；二选一的开关用 [Switch](../switch/switch.md)；互斥单选用 [Radio](../radio/radio.md)。

## 导入
```ts
import { Checkbox } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| checked | `boolean` | - | 受控勾选态 |
| defaultChecked | `boolean` | - | 非受控初始勾选态 |
| indeterminate | `boolean` | `false` | 第三态：半选（Base UI 原生 indeterminate） |
| disabled | `boolean` | `false` | 禁用 |
| required | `boolean` | `false` | 必填 |
| name | `string` | - | 表单字段名 |
| value | `string` | - | 表单值；放进 CheckboxGroup 时按此 value 匹配成员 |
| id | `string` | - | 关联 label 的 id |
| size | `"sm" \| "md"` | `"md"` | 尺寸档，方盒与内置勾号一起缩放。`md` = 20px/14px/`text-sm`，`sm` = 16px/12px/`text-xs`（对齐 Input、SelectTrigger 的 `size="sm"`） |
| className | `string` | - | 落在 Checkbox.Root（方盒），够不到文字 |
| labelClassName | `string` | - | 落在文字 `<span>`，用来改字号 / 颜色 |
| tabIndex | `number` | - | 透传到 Checkbox.Root（树场景置 -1 退出 Tab 序，焦点由容器 roving 接管） |
| aria-label | `string` | - | 无 label 时的无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCheckedChange | `(checked: boolean) => void` | 勾选变化回调（瑚琏收敛签名，丢 eventDetails） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 盒右 inline label（`<label>` 原生关联） |
| children | `ReactNode` | 与 `label` 等价的写法：`<Checkbox>同意条款</Checkbox>`。两者同时给时 `label` 优先 |

## 示例
```tsx
<Checkbox defaultChecked label="记住我" />
```
```tsx
{/* 受控半选消解 */}
<Checkbox
  checked={checked}
  indeterminate={indeterminate}
  onCheckedChange={(c) => { setChecked(c); setIndeterminate(false); }}
/>
```

## 禁忌 / 坑

- 放进 [CheckboxGroup](../checkbox-group/checkbox-group.md) 时必须给每个 Checkbox 传 `value`（不是 `name`）——见 [[base-ui-checkbox-group-matches-members-by-value-not-name]]：Base UI rc.0 按 `value` 匹配组成员，传 `name` 会让 defaultValue/value/onValueChange 全部静默失效（框照常渲染但勾选/回调全空）。
- `indeterminate` 是独立第三态，点击后通常应手动消解为确定态（`setIndeterminate(false)`）。
- 自己写 `<label>` 把 Checkbox 包起来是**成立的**，不用手写 `onClick` 转发：Root 渲染出来是 `<span role="checkbox">`（不是可被 label 关联的元素），看 DOM 容易以为隐式关联不生效，但 Base UI 在里面留了一个视觉隐藏的原生 input 承载激活，点文字照样切换。排版特殊到 `size` + `labelClassName` 也收不住时，就这么用。
- 但别在包裹的同时再给 `<label htmlFor>` 指向 Root 的 `id`：显式 `htmlFor` 会**压过**上面那条隐式关联，两者并存的结果是点文字彻底没反应。要么只包裹，要么只 `htmlFor`。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
