---
slug: select
name: Select
category: forms
group: basic
tags: []
exports: [Select, SelectTrigger, SelectContent, SelectItem]
status: enriched
---

# Select

> 下拉选择 · Base UI overlay 单选/多选（multiple）+ items 自动 label · forms/basic

## 何时用

从一组固定选项里选一项或多项（选项较多、需要收纳成下拉）。多选传 `multiple`，受控值变 `string[]`，Trigger 平铺已选 label、超出折叠 +N。选项少且需全部可见用 [Radio](../radio/radio.md) 或 [CheckboxGroup](../checkbox-group/checkbox-group.md)（多选平铺）；带搜索/自动补全用 [Combobox](../combobox/combobox.md)；自由文本用 [Input](../input/input.md)。给 `items`（`{value,label}` 数组）让 Trigger 显示选中项 label 而非 raw value。

## 导入
```ts
import { Select, SelectTrigger, SelectContent, SelectItem } from "@hulianui/ui"
```

## Props

`Select` 继承 Base UI `Select.Root` 属性（除 `items` 被下方覆盖外，如 `value`/`defaultValue`/`onValueChange`/`disabled`…）。

### Select
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `ReadonlyArray<{ value: string ｜ null; label: ReactNode }>` | — | 选项数据；Base UI 据此让 Trigger 显示选中项 label |
| placeholder | `ReactNode` | — | 无选中值时的占位文本（单选注入 value:null 项实现；多选由 Trigger 函数式 Value 渲染） |
| multiple | `boolean` | `false` | 多选模式：value/defaultValue/onValueChange 均为 `string[]`；选中后浮层保持打开 |

### SelectTrigger
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸 |
| invalid | `boolean` | `false` | 独立使用（非 Field 内）时手动置无效态皮肤 |
| maxDisplay | `number` | `2` | 多选模式下最多平铺几个已选 label，超出折叠为 +N 计数 |
| className | `string` | — | 透传类名 |

### SelectContent
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| side | `"top" ｜ "bottom"` | `"bottom"` | 弹出方向 |
| align | `"start" ｜ "center" ｜ "end"` | — | 对齐 |
| sideOffset | `number` | — | 偏移量 |

### SelectItem
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `string` | — | 选项值（本批仅 string 值） |
| disabled | `boolean` | `false` | 禁用此项 |

## Events

`Select` 透传 Base UI `Select.Root` 的常用事件。

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string ｜ null, eventDetails) => void`（多选时 `(value: string[], …)`） | 选中值变化回调（透传 Base UI `Select.Root`） |
| onOpenChange | `(open: boolean, eventDetails) => void` | 下拉开合变化回调（透传 Base UI `Select.Root`） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| SelectContent.children* | `ReactNode` | 一组 `SelectItem` |
| SelectItem.children* | `ReactNode` | 选项展示内容 |

## 示例
```tsx
const FONTS = [
  { value: "sans", label: "无衬线 Sans" },
  { value: "serif", label: "衬线 Serif" },
  { value: "mono", label: "等宽 Mono" },
];

<Select items={FONTS} placeholder="请选择字体" defaultValue="serif">
  <SelectTrigger />
  <SelectContent>
    {FONTS.map((f) => (
      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// 多选：考点覆盖 / 报表维度等中后台多选筛选
const [points, setPoints] = useState<string[]>([]);

<Select items={KNOWLEDGE_POINTS} placeholder="选择考点" multiple value={points} onValueChange={setPoints}>
  <SelectTrigger maxDisplay={2} />
  <SelectContent>
    {KNOWLEDGE_POINTS.map((p) => (
      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

## 禁忌 / 坑

- 占位文本通过 `Select` 的 `placeholder` prop 传，**不要**给 `Select.Value` 传 placeholder——见 [[base-ui-select-rc0-no-value-placeholder-prop-inject-null-item]]：本项目锁 Base UI rc.0，其 `Select.Value` 没有 placeholder prop（那是 v1.2+），瑚琏靠注入一个 `value:null` 的 items 项实现占位 label。`items` 与 `SelectItem` 的 value 要对应，否则 Trigger 显示 raw value 而非 label。
- `multiple` 下 value 必须是数组：给 `defaultValue="a"`（字符串）会被当成无选中处理。多选模式不注入 null 占位项（数组值命不中 null 项），占位由 Trigger 内函数式 Value 渲染，因此**多选的 placeholder/label 解析依赖 `items` prop**——不传 items 时 Trigger 只能显示 raw value。
- 多选 Trigger 的平铺条数由 `SelectTrigger` 的 `maxDisplay` 控制（默认 2），不在 `Select` 上。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
