---
slug: calendar
name: Calendar
category: forms
group: datetime
tags: []
exports: [Calendar]
status: enriched
---

# Calendar

> 日历 · MUI X 桥(DateCalendar) + 对外 ISO 字符串受控 + 瑚琏 token · forms/datetime · MUI 桥

## 何时用

需要在页面内**常驻铺开**一个月历面板让用户挑日期时用（如日程、筛选侧栏）。若想要点击触发、弹层选日期且带输入框，用 [DatePicker](../date-picker.md)；要选一段区间用 [DateRangePicker](../date-range-picker/date-range-picker.md)；要连时间一起选用 [DateTimePicker](../date-time-picker.md)。

## 导入
```ts
import { Calendar } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| null` | — | ISO 字符串受控值；传入即受控 |
| defaultValue | `string` | — | ISO 字符串非受控默认值 |
| onValueChange | `(iso: string \| null) => void` | — | 受控回调，回传 ISO 或 null（替代 MUI 的 onChange） |
| minDate | `string` | — | 可选最早日期（ISO），早于此禁选 |
| maxDate | `string` | — | 可选最晚日期（ISO），晚于此禁选 |
| disabled | `boolean` | `false` | 整体禁用 |
| readOnly | `boolean` | `false` | 只读：可查看不可改 |
| className | `string` | — | 容器类名 |

## 示例
```tsx
function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03");
  return <Calendar value={v} onValueChange={setV} />;
}
```
```tsx
<Calendar defaultValue="2026-06-15" />
```

## 禁忌 / 坑

- 受控/非受控二选一：给了 `value` 就走受控、必须配 `onValueChange` 才能改动；只想要初值用 `defaultValue`，别同时给。
- 对外值恒为 ISO 字符串（非 Date 对象），回调 `onValueChange` 也回传 ISO 或 null，跨组件传值直接用字符串即可。

## 相关
[DatePicker](../_mui/date-picker.md) · [DateTimePicker](../_mui/date-time-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [TimeField](../_mui/time-field.md) · [Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md)
