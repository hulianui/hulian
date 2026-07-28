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
| disabled | `boolean` | `false` | 禁用 |
| id | `string` | — | — |
| className | `string` | — | — |
| aria-label | `string` | — | 无可见标题时提供 |
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 视觉尺寸（轨道 36×20 / 40×24 / 48×28）。`md` 与加这个 prop 之前逐像素一致 |
| touchTarget | `boolean` | `false` | 扩出一块不可见的 ≥44px 命中区（只影响命中，不占布局、不改视觉）。移动端建议开 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCheckedChange | `(checked: boolean) => void` | 开关变化回调 |

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
- **移动端记得开 `touchTarget`**：默认 `md` 轨道只有 24px 高，低于触控目标推荐值（≥44px），手指点不准。此前库里没有这个开关，消费方只能在外面自己包一层 ≥44px 的可点区。
- `touchTarget` 的命中区会向上下各溢出约 10px。桌面端紧密排布的表单里若相邻控件挨得很近，可能压到邻居，所以它默认关、按场景开。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
