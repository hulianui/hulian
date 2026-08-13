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

> 日期区间 · 自研零依赖双面板范围日历（日 / 月 / 年三档粒度）+ Popover 引擎 + 快捷预设/min-max/disabledDate · 定宽字符串数组受控 · forms/datetime

## 何时用

选一段**区间**（起止两端）时用，自带双面板并排 + 快捷预设。`picker` 决定粒度：日（默认）/ 月 / 年，分别对应 el-date-picker 的 `daterange` / `monthrange` / `yearrange`。选单个日期用 [DatePicker](../date-picker/date-picker.md)；连时间一起选用 [DateTimePicker](../date-time-picker/date-time-picker.md)；月历常驻铺开用 [Calendar](../calendar/calendar.md)。全库日期族都是零依赖自研，值一律是定宽字符串。

## 导入
```ts
import { DateRangePicker } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `[string, string] \| null` | — | 受控值 `[start, end]`，形状随 `picker`（`YYYY-MM-DD` / `YYYY-MM` / `YYYY`）；`null` = 已清空；传入即受控 |
| defaultValue | `[string, string] \| null` | — | 非受控初始值 |
| picker | `"date" \| "month" \| "year"` | `"date"` | 选择粒度，与 [DatePicker](../date-picker/date-picker.md) 的同名 prop 同义。面板形态随之变化：两个月历 / 两个年份页（各 12 个月）/ 两个 12 年段 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 触发器尺寸档，刻度与 [Input](../input/input.md) 一致（32 / 40 / 48px）；面板里日期格的几何不随之变化 |
| minDate | `string` | — | 最早可选日，**恒为 ISO `YYYY-MM-DD`，不随 `picker` 变**；月/年粒度下按「整段都超界才禁」判定 |
| maxDate | `string` | — | 最晚可选日，口径同 `minDate` |
| disabledDate | `(isoDate: string) => boolean` | — | 自定义禁用，入参恒为 ISO `YYYY-MM-DD`；月/年粒度下只按该段**首日**问一次 |
| presets | `boolean \| DateRangePreset[]` | `true` | 快捷预设：`true`/省略 = 该粒度的默认档（日：今天/最近 7 天/最近 30 天/本月；月：本月/最近 3 个月/最近 6 个月/今年；年：今年/最近 3 年/最近 5 年）；数组 = 自定义；`false` = 隐藏 |
| placeholder | `[string, string]` | 随 `picker` | 占位文案 [开始, 结束]，默认「开始日期 / 开始月份 / 开始年份」 |
| displayFormat | `string` | 随 `picker` | 展示格式（dayjs format），默认 `YYYY-MM-DD` / `YYYY-MM` / `YYYY`；对外受控值的形状不受它影响 |
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
```tsx
// 月份区间（对标 el-date-picker 的 type="monthrange"）：值形状变成 ["YYYY-MM", "YYYY-MM"]，
// 预设换成本月 / 最近 3 个月 / 最近 6 个月 / 今年。
<DateRangePicker picker="month" value={months} onValueChange={setMonths} />

// 只让选到当月为止：maxDate 仍写 ISO 日期，月粒度下「整月都超界才禁」，
// 所以当月可选、之后的月份灰掉——这正是「点右面板的 7 月拿到明年 7 月」那个坑的解法。
<DateRangePicker picker="month" maxDate={new Date().toISOString().slice(0, 10)} />

// 年份区间：一页 12 年，两页不重叠
<DateRangePicker picker="year" defaultValue={["2024", "2026"]} />
```

## 禁忌 / 坑

- 受控/非受控二选一：给 `value` 走受控须配 `onValueChange`；只想要初值用 `defaultValue`，别同时给。
- 对外受控值恒为**定宽字符串**数组（不是 Date），形状由 `picker` 决定：`YYYY-MM-DD` / `YYYY-MM` / `YYYY`。`displayFormat` 只改触发器上的展示，回传值不变。
- **`minDate` / `maxDate` / `disabledDate` 恒按 ISO 日期说话**，不随 `picker` 变。月/年粒度下的判定是「整段都超界才禁」：`maxDate="2026-06-15"` 时 `2026-06` 仍可选，`2026-07` 才灰掉。想连当月一起禁就把 `maxDate` 写到上一段的末尾（`2026-05-31`）。
- 月/年粒度下 `disabledDate` 每段只被问一次，入参是该段**首日**（`2026-09-01` 代表整个 9 月）。别在里面写按「日」判断的逻辑（如禁周末），那在这两档没有意义。
- 年份页是 **12 年整段**（不是十年段），因为两页并排时十年段的首尾补位年会让同一个年份在左右两页各出现一次。
- `disabledDate` 入参是 ISO 字符串，自己拼 `new Date(iso + "T00:00:00")` 算 getDay 时注意时区，别直接 `new Date(iso)`（会按 UTC 解析偏一天）。

## 相关
[Calendar](../calendar/calendar.md) · [DatePicker](../date-picker/date-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [TimeField](../time-field/time-field.md) · [Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md)
