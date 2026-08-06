---
slug: date-range-picker
name: DateRangePicker
category: forms
group: datetime
tags: []
exports: [DateRangePicker]
status: enriched
---

# DateRangePicker

> 日期区间 · 自研零依赖双月范围日历 + Popover 引擎 + 快捷预设/min-max/disabledDate · ISO 数组受控 · forms/datetime

## 何时用

选一段**日期区间**（起止两端）时用，自带双月并排 + 快捷预设（今天/最近7天/30天/本月）。选单个日期用 [DatePicker](../date-picker/date-picker.md)；连时间一起选用 [DateTimePicker](../date-time-picker/date-time-picker.md)；月历常驻铺开用 [Calendar](../calendar/calendar.md)。全库日期族都是零依赖自研，值一律是定宽字符串。

## 导入
```ts
import { DateRangePicker } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `[string, string] \| null` | — | 受控值 `[start, end]`（ISO `YYYY-MM-DD`）；`null` = 已清空；传入即受控 |
| defaultValue | `[string, string] \| null` | — | 非受控初始值 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 触发器尺寸档，刻度与 [Input](../input/input.md) 一致（32 / 40 / 48px）；面板里日期格的几何不随之变化 |
| minDate | `string` | — | 最早可选日（ISO），早于此禁选 |
| maxDate | `string` | — | 最晚可选日（ISO），晚于此禁选 |
| disabledDate | `(isoDate: string) => boolean` | — | 自定义禁用某天，入参为 ISO `YYYY-MM-DD` |
| presets | `boolean \| DateRangePreset[]` | `true` | 快捷预设：`true`/省略 = 默认四项；数组 = 自定义；`false` = 隐藏 |
| placeholder | `[string, string]` | `["开始日期","结束日期"]` | 占位文案 [开始, 结束] |
| displayFormat | `string` | `"YYYY-MM-DD"` | 展示格式（dayjs format）；对外受控值始终为 ISO `YYYY-MM-DD` |
| disabled | `boolean` | `false` | 禁用 |
| readOnly | `boolean` | `false` | 只读：可打开查看，无端点选择/无预设/无清除 |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(range: [string, string] \| null) => void` | 区间变化（含清空 → null） |

`DateRangePreset`：`{ label: string; getValue: () => [string, string] }`，点击时调用、可基于"今天"动态计算。

## 示例
```tsx
function Demo() {
  const [v, setV] = useState<[string, string] | null>(null);
  return <DateRangePicker value={v} onValueChange={setV} />;
}
```
```tsx
<DateRangePicker
  defaultValue={["2026-06-10", "2026-06-12"]}
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6; // 禁用周末
  }}
/>
```

## 禁忌 / 坑

- 受控/非受控二选一：给 `value` 走受控须配 `onValueChange`；只想要初值用 `defaultValue`，别同时给。
- 对外受控值恒为 ISO `YYYY-MM-DD` 数组（不是 Date）；`displayFormat` 只改输入框展示，回传值不变。
- `disabledDate` 入参是 ISO 字符串，自己拼 `new Date(iso + "T00:00:00")` 算 getDay 时注意时区，别直接 `new Date(iso)`（会按 UTC 解析偏一天）。

## 相关
[Calendar](../calendar/calendar.md) · [DatePicker](../date-picker/date-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [TimeField](../time-field/time-field.md) · [Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md)
