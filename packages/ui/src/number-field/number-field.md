---
slug: number-field
name: NumberField
category: forms
group: basic
tags: []
exports: [NumberField]
status: enriched
---

# NumberField

> 编辑数字，带上下限、步进按钮和键盘步进 · forms/basic

## 何时用

需精确录入数字并带 ± 步进按钮、min/max 边界（数量、份数、阈值）时用。只需大致量级、拖动选值用 [Slider](../slider/slider.md)；非数字的任意文本录入用 [Input](../input/input.md)。

## 导入
```ts
import { NumberField } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `number｜null` | - | 受控值（null=空） |
| defaultValue | `number｜null` | - | 非受控初始值（null=初始为空，与 `value` 同口径） |
| min | `number` | - | 最小值 |
| max | `number` | - | 最大值 |
| step | `number` | `1` | 步进量 |
| disabled | `boolean` | `false` | 禁用 |
| readOnly | `boolean` | `false` | 只读 |
| required | `boolean` | - | 表单必填 |
| name | `string` | - | 原生表单 name |
| id | `string` | - | - |
| className | `string` | - | - |
| aria-label | `string` | - | 无可见标题时提供 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: number｜null) => void` | 变化回调（瑚琏收敛签名，丢 Base UI eventDetails） |

## 示例
```tsx
<NumberField aria-label="数量" defaultValue={3} min={0} max={5} />
```

受控（值可为空）：
```tsx
const [v, setV] = useState<number | null>(2);
<NumberField aria-label="数量" value={v} onValueChange={setV} min={0} max={10} />
```

## 禁忌 / 坑

- 受控值类型是 `number | null`——清空时回调拿到 `null`，state 须用 `useState<number | null>`，别假设永远是 number。**反方向同样成立**：把 `null` 传进 `value`（或 `defaultValue`）时输入框显示空串、占位符可见，不会渲染成 `0`，`min={0}` 也不会把它夹成 0。所以「留空 = 沿用默认 / 继承上级」与「0 = 显式为零」这样的三态字段（`null` / `0` / 正整数）可以直接用这个组件表达，两档在界面上分得开。
- 用 `value`/`onValueChange` 即受控，须自管 state；非受控只给 `defaultValue`。
- **签名外的值按「空」处理，不再落成 `0`**（#220）。`value` 只收 `number | null`，但受控值常常来自类型擦除的路径（`useForm` 的 `register().value` 是 `unknown`、接口回填是 `any`），空串这类值会漏进来——底层会把它渲染成 `0`，而在三态字段里 `0` 恰是最坏的落点（「留空」与「显式为零」是两个相反的业务结论，界面上分不出来）。现在这类值一律当空，并在开发期打一条 `warnOnce` 点名来源。`undefined` 不在其列：那是「非受控」，原样保留。
- 无可见标题时给 `aria-label`，否则读屏无名。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
