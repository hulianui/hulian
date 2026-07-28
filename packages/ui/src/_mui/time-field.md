---
slug: time-field
name: TimeField
category: forms
group: datetime
tags: []
exports: [TimeField]
status: enriched
---

# TimeField

> 时间输入 · MUI X 桥(分段编辑 HH:mm 24h) + ISO 受控 · forms/datetime · MUI 桥

## 何时用

只选**时间**（HH:mm 24 小时制分段输入、无弹层）时用。要日期 + 时间一体弹层用 [DateTimePicker](../date-time-picker.md)；只选日期用 [DatePicker](../date-picker.md)。

## 导入
```ts
import { TimeField } from "@hulianui/ui"
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
| value | `string \| null` | — | ISO 字符串受控值；传入即受控 |
| defaultValue | `string` | — | ISO 字符串非受控默认值 |
| label | `string` | `"选择时间"` | 输入框 label |
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
  const [v, setV] = useState<string | null>("2026-06-03T09:30:00");
  return <TimeField label="选择时间" value={v} onValueChange={setV} />;
}
```
```tsx
<TimeField label="起始时间" defaultValue="2026-06-03T08:00:00" />
```

## 禁忌 / 坑

- 受控/非受控二选一：给 `value` 走受控须配 `onValueChange`；只想要初值用 `defaultValue`，别同时给。
- 对外值仍是完整 ISO 字符串（带日期部分，只是时间可编辑），不是裸 `HH:mm`；回调回传 ISO 或 null。

## 相关
[Calendar](../_mui/calendar.md) · [DatePicker](../_mui/date-picker.md) · [DateTimePicker](../_mui/date-time-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md)
