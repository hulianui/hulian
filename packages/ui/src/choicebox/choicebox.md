---
slug: choicebox
name: Choicebox
category: forms
group: advanced
tags: []
exports: [ChoiceboxGroup, Choicebox]
status: enriched
---

# Choicebox

> 用带标题和描述的卡片做单选或多选 · forms/advanced

## 何时用

每个选项需要标题+描述+图标的卡片化呈现时用（订阅套餐、支付方式、主题档位）。若选项只是一行文字用普通 Radio/Checkbox；若是色块用 [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md)。

## 导入
```ts
import { ChoiceboxGroup, Choicebox } from "@hulianui/ui"
```

## Props

### ChoiceboxGroup

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| string[]` | - | 受控值。单选为 string，多选为 string[] |
| defaultValue | `string \| string[]` | - | 非受控初值 |
| multiple | `boolean` | `false` | true=多选(checkbox 语义) / false=单选(radio 语义) |
| name | `string` | 自动生成 | radio 分组 name（单选用） |
| columns | `number` | `1` | 网格列数 |
| disabled | `boolean` | `false` | 整组禁用 |
| className | `string` | - | 透传到容器 |
| aria-label | `string` | - | 无障碍标签 |

### Choicebox

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `string` | - | 选项值（组内唯一） |
| disabled | `boolean` | `false` | 单项禁用 |
| className | `string` | - | 透传到卡片 |

## Events

### ChoiceboxGroup

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string \| string[]) => void` | 变更回调；单选回传 string，多选回传 string[] |

## Slots

### ChoiceboxGroup

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 一组 Choicebox |

### Choicebox

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 主标题 |
| description | `ReactNode` | 副描述 |
| icon | `ReactNode` | 左侧图标 |
| children | `ReactNode` | 标题/描述外的附加内容（价格、标签等） |

## 示例
```tsx
// 单选套餐卡（受控）
const [v, setV] = useState<string | string[]>("pro");
<ChoiceboxGroup value={v} onValueChange={setV} aria-label="订阅套餐">
  <Choicebox value="free" icon={<Zap />} title="基础版" description="个人项目 · 永久免费">
    <div className="mt-1 font-semibold">¥0</div>
  </Choicebox>
  <Choicebox value="pro" icon={<Rocket />} title="专业版" description="小团队 · 含全部组件" />
</ChoiceboxGroup>

// 多选 + 两列网格
<ChoiceboxGroup multiple columns={2} defaultValue={["a"]}>
  <Choicebox value="a" title="选项 A" description="…" />
  <Choicebox value="b" title="选项 B" description="…" />
</ChoiceboxGroup>
```

## 禁忌 / 坑

- `value`/`defaultValue` 类型随 `multiple`：单选传 `string`，多选传 `string[]`，搞反会导致选中态错乱。
- 在 Choicebox 的 `children` 里放删除/操作钮等交互元素时，会与卡片整体的选中点击冲突，需对子元素阻断冒泡（或用绝对定位让它脱离单选环的点击区）。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
