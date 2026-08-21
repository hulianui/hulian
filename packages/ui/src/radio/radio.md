---
slug: radio
name: Radio
category: forms
group: basic
tags: []
exports: [RadioGroup, Radio]
status: enriched
---

# Radio

> 从一组互斥选项里选一个，支持方向键操作 · forms/basic

## 何时用

一组互斥选项里选且只选一个、且选项数少（约 2-6 个）需全部直接可见时用。选项多需收起或搜索改用 [Select](../select/select.md)；多选共存改用 [CheckboxGroup](../checkbox-group/checkbox-group.md)；横向二三段且要滑块视觉用 [Segmented](../segmented/segmented.md)。

## 导入
```ts
import { RadioGroup, Radio } from "@hulianui/ui"
```

## Props

`RadioGroup`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | - | 受控选中值 |
| defaultValue | `string` | - | 非受控初始选中值 |
| disabled | `boolean` | `false` | 整组禁用 |
| required | `boolean` | - | 表单必选 |
| name | `string` | - | 原生表单 name |
| orientation | `"vertical"｜"horizontal"` | `"vertical"` | 仅控布局 |
| className | `string` | - | - |
| aria-label | `string` | - | 无可见标题时提供 |

`Radio`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value * | `string` | - | 必填，标识该选项 |
| disabled | `boolean` | `false` | 单项禁用 |
| id | `string` | - | - |
| size | `"sm" \| "md"` | `"md"` | 尺寸档，圈与内点一起缩放。`md` = 20px/10px/`text-sm`，`sm` = 16px/8px/`text-xs` |
| className | `string` | - | 落在 Radio.Root（圈），够不到文字 |
| labelClassName | `string` | - | 落在文字 `<span>`，用来改字号 / 颜色 |
| aria-label | `string` | - | 无障碍名。**不给 `label`、或 `label` 是图标/纯视觉内容时必须给** |
| aria-labelledby | `string` | - | 用页面上已有元素充当名字（填其 id），与 `aria-label` 二选一 |
| aria-describedby | `string` | - | 补充描述（填元素 id），如该选项的说明文字 |

## Events

`RadioGroup`

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string) => void` | 选中变化回调 |

## Slots

`RadioGroup`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内放 `Radio` 项 |

`Radio`

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 可选 inline label（点右，原生 `<label>` 关联） |
| children | `ReactNode` | 与 `label` 等价的写法：`<Radio value="1">审核通过</Radio>`。两者同时给时 `label` 优先 |

## 示例
```tsx
<RadioGroup defaultValue="b" aria-label="选项">
  <Radio value="a" label="选项一" />
  <Radio value="b" label="选项二" />
  <Radio value="c" label="选项三(禁用)" disabled />
</RadioGroup>
```

横向 + 受控：
```tsx
const [value, setValue] = useState("standard");
<RadioGroup value={value} onValueChange={setValue} orientation="horizontal" aria-label="套餐">
  <Radio value="standard" label="标准" />
  <Radio value="pro" label="专业" />
</RadioGroup>
```

## 禁忌 / 坑

- 选中值统一由 `RadioGroup` 管，`Radio` 不自带选中态——别在 `Radio` 上找 `checked`。
- 用 `value`/`onValueChange` 即受控，须自管 state；只给初值用 `defaultValue`，二者不要混用。
- 无可见标题的单选组要给 `aria-label`，否则无障碍读屏无名。
- **不给 `label` 的 `Radio`（图标卡片、自定义排版）必须自带 `aria-label` 或 `aria-labelledby`**，否则读屏只报「单选按钮」，用户不知道自己在选哪一项——这不只是测试不好写，是真实的可访问性缺陷。`label` 传的是图标之类的非文本 `ReactNode` 时同理。
- 自己写 `<label>` 把 Radio 包起来是**成立的**，不用手写 `onClick` 转发：Root 渲染出来是 `<span role="radio">`（不是可被 label 关联的元素），看 DOM 容易以为隐式关联不生效，但 Base UI 在里面留了一个视觉隐藏的原生 input 承载激活。排版特殊到 `size` + `labelClassName` 也收不住时就这么用。
- 但别在包裹的同时再给 `<label htmlFor>` 指向 Root 的 `id`：显式 `htmlFor` 会**压过**隐式关联，两者并存的结果是点文字彻底没反应。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Switch](../switch/switch.md)
