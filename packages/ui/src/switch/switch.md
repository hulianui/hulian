---
slug: switch
name: Switch
category: forms
group: basic
tags: []
exports: [Switch]
status: enriched
---

# Switch

> 开关 · Base UI 受控 + ARIA · forms/basic

## 何时用

切换一个即时生效的布尔开关（如「开启通知」），改动立刻应用、无需提交按钮时用。需在两个互斥选项间二选一且语义对等用 [Radio](../radio/radio.md)；提交表单时勾选的布尔项（如「同意条款」）用 [Checkbox](../checkbox/checkbox.md)。

## 导入
```ts
import { Switch } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| checked | `boolean` | — | 受控开关态 |
| defaultChecked | `boolean` | `false` | 非受控初始态 |
| onCheckedChange | `(checked: boolean) => void` | — | 开关变化回调 |
| disabled | `boolean` | `false` | 禁用 |
| id | `string` | — | — |
| className | `string` | — | — |
| aria-label | `string` | — | 无可见标题时提供 |

## 示例
```tsx
<Switch defaultChecked aria-label="开启通知" />
```

受控：
```tsx
const [on, setOn] = useState(false);
<Switch checked={on} onCheckedChange={setOn} aria-label="开启通知" />
```

## 禁忌 / 坑

- 用 `checked`/`onCheckedChange` 即受控，须自管 state；只给初值用 `defaultChecked`，二者不要混用。
- 无可见标题时务必给 `aria-label`，否则读屏无名。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
