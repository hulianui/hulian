---
slug: date-picker
name: DatePicker
category: forms
group: datetime
tags: []
exports: [DatePicker]
status: enriched
---

# DatePicker

> 单日期选择 · 自研零依赖(触发器 + Popover 罩 Calendar 面板·日/月/年三粒度) + min-max/disabledDate/清除 · forms/datetime

## 何时用

表单里选**一个**日期、月份或年份时用。触发器 + 弹层，弹层里就是 [Calendar](../calendar/calendar.md)
面板本身 —— 两者共用同一套下钻与禁用逻辑，所以行为完全一致。

要面板常驻铺开、不带触发器和浮层，直接用 [Calendar](../calendar/calendar.md)；
选一段区间用 [DateRangePicker](../date-range-picker/date-range-picker.md)；
连时间一起选用 [DateTimePicker](../date-time-picker/date-time-picker.md)。

> 本组件在 0.15.0 之前叫 `DateField`，同期还存在一个基于 MUI X 的 `DatePicker`。
> 那份桥接件已随整个 `_mui` 目录移除，这个名字现在只指向这个自研零依赖实现。

## 导入
```ts
import { DatePicker } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| null` | — | 受控值。形状随 `picker`：`"YYYY-MM-DD"` / `"YYYY-MM"` / `"YYYY"` |
| defaultValue | `string \| null` | — | 非受控初始值，形状同上 |
| picker | `"date" \| "month" \| "year"` | `"date"` | 选择粒度，同时决定值形状与面板起始层 |
| minDate | `string` | — | 最早可选日期（任意可解析日期串，内部规范化） |
| maxDate | `string` | — | 最晚可选日期 |
| disabledDate | `(isoDate: string) => boolean` | — | 逐日禁用判定，入参恒为 `"YYYY-MM-DD"`（月/年粒度传该月/该年首日） |
| placeholder | `string` | 随 picker | 触发器占位文本 |
| displayFormat | `string` | 随 picker | 触发器显示格式（dayjs format 串）。**只影响显示**，对外值形状不变 |
| clearable | `boolean` | `true` | 有值且非 disabled/readOnly 时显示清除按钮 |
| showToday | `boolean` | `true` | 面板底部「今天 / 本月 / 今年」快捷 |
| disabled | `boolean` | `false` | 整体置灰，面板打不开 |
| readOnly | `boolean` | `false` | 面板可看，但选不动 |
| aria-label | `string` | — | 触发器无障碍名（无可见 label 时给） |
| className | `string` | — | 落在触发器外层容器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string \| null) => void` | 选中/清空回调；清空回传 `null` |

## 示例
```tsx
// 基础：值是 ISO 日期串
<DatePicker defaultValue="2026-06-08" />

// 受控
const [date, setDate] = useState<string | null>(null);
<DatePicker value={date} onValueChange={setDate} />

// 选月份 / 选年份（值形状随之变成 YYYY-MM / YYYY）
<DatePicker picker="month" defaultValue="2026-06" />
<DatePicker picker="year" defaultValue="2026" />

// 限定范围 + 禁用周末
<DatePicker
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(`${iso}T00:00:00`).getDay();
    return day === 0 || day === 6;
  }}
/>
```

## 禁忌 / 坑

- **值是定宽文本，不是 `Date`**：`"YYYY-MM-DD"` 定宽 → 字典序即时间序，区间比较可以直接比字符串，
  也避开了 `new Date("2026-06-08").toISOString()` 在东八区少算 8 小时那类日界坑。要 `Date` 对象请自己转。
- **`picker` 改了值形状**：从 `date` 切到 `month` 时旧值 `"2026-06-08"` 解析后会按月粒度提交成 `"2026-06"`。
  切粒度时请一并处理存量值，别指望组件替你迁移。
- `displayFormat` 只管显示。想改**对外**值形状只能通过 `picker`。
- `disabledDate` 在 `date` 粒度下逐日调用（一屏 42 次），请保持它是纯计算 —— 别在里面发请求或建对象。
  月/年粒度下只对该月/该年首日调一次，**判据也随之变粗**：想精确到天就别用粗粒度 picker。
- 面板标题可点，逐层上卷 date → month → year；`picker` 决定「点到哪一层就提交」，
  所以 `picker="date"` 时点月份只是下钻，不会提交。
- 从 0.15.0 之前的 MUI 版 `DatePicker` 迁过来时注意**值格式变了**：那份对外是完整 ISO 时间戳，
  这份是定宽日期串。另外 `views` / `openTo` 合并成了 `picker`，`label` 换成 `placeholder` + `aria-label`。

## 相关
[Calendar](../calendar/calendar.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [TimePicker](../time-picker/time-picker.md) · [TimeField](../time-field/time-field.md) · [ColorField](../color-field/color-field.md)
