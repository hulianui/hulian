---
slug: date-time-picker
name: DateTimePicker
category: forms
group: datetime
tags: []
exports: [DateTimePicker]
status: enriched
---

# DateTimePicker

> 日期时间选择 · MUI X 桥(年月日+时钟一体弹层) + ISO 受控 + 步进/秒 · forms/datetime · MUI 桥

## 何时用

需要在一个弹层里**同时选日期 + 时间**时用（预约、起止时间戳）。只选日期用 [DatePicker](../date-picker.md)；只选时间（HH:mm）用 [TimeField](../time-field.md)；选日期区间用 [DateRangePicker](../date-range-picker/date-range-picker.md)。

## 导入
```ts
import { DateTimePicker } from "@hulianui/ui"
```

> ⚠️ **前置条件：本组件属 `_mui` 桥接族，必须置于 `MuiBridgeProvider` 之内。**
> 桥主题把 `theme.alpha` 重写成 `color-mix`，不挂 Provider 时 MUI 核心件（如日期族头部的
> IconButton）会对 `var(--color-*)` 调 `alpha()` 并直接抛 `Unsupported color` —— 真实浏览器同样触发，
> 不是只在测试里出现。整个应用挂一次即可（通常在根 layout）。
>
> ```tsx
> import { MuiBridgeProvider } from "@hulianui/ui"
>
> <MuiBridgeProvider>
>   <App />
> </MuiBridgeProvider>
> ```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| null` | — | ISO 字符串受控值（含日期+时间）；传入即受控 |
| defaultValue | `string` | — | ISO 字符串非受控默认值 |
| minDateTime | `string` | — | 可选最早日期时间（ISO） |
| maxDateTime | `string` | — | 可选最晚日期时间（ISO） |
| minutesStep | `number` | — | 时间步进分钟数（如 5、15、30） |
| withSeconds | `boolean` | `false` | 是否启用秒（默认仅到分钟） |
| label | `string` | `"选择日期时间"` | 输入框 label |
| disabled | `boolean` | `false` | 禁用 |
| readOnly | `boolean` | `false` | 只读 |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(iso: string \| null) => void` | 受控回调，回传 ISO 或 null（替代 MUI 的 onChange） |

## 示例
```tsx
function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03T14:30:00");
  return <DateTimePicker label="选择日期时间" value={v} onValueChange={setV} />;
}
```
```tsx
<DateTimePicker label="预约时间" defaultValue="2026-06-15T09:00:00" minutesStep={15} />
```

## 禁忌 / 坑

- 受控/非受控二选一：给 `value` 走受控须配 `onValueChange`；只想要初值用 `defaultValue`，别同时给。
- 对外值恒为 ISO 字符串（含时间，非 Date），回调也回传 ISO 或 null。
- 默认只到分钟，要秒级须显式开 `withSeconds`；`minutesStep` 只约束分钟轮的步进，不会自动对齐 `defaultValue`。

## 相关
[Calendar](../_mui/calendar.md) · [DatePicker](../_mui/date-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [TimeField](../_mui/time-field.md) · [Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md)
