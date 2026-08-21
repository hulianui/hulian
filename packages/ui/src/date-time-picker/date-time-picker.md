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

> 在一个浮层里同时选好日期和时间 · forms/datetime

## 何时用

一个字段要同时定下「哪天」和「几点」时用：会议预约、任务截止、排班起止。
弹层里左边是 [Calendar](../calendar/calendar.md) 面板、右边是时间列，两边各选各的互不干扰。

只要日期用 [DatePicker](../date-picker/date-picker.md)；只要时间用
[TimePicker](../time-picker/time-picker.md)（列选）或 [TimeField](../time-field/time-field.md)（键盘录入）。
把日期和时间拆成两个字段通常比这个组件更好填 —— 先想清楚是不是真需要一体化。

> 本组件在 0.15.0 之前是 MUI X `DateTimePicker` 的桥接件，要装四个 optional peer 并挂
> `MuiBridgeProvider`。现在是零依赖自研，装库即用。

## 导入
```ts
import { DateTimePicker } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| null` | - | 受控值，`"YYYY-MM-DD HH:mm"`（`withSeconds` 时带秒），中间一个空格 |
| defaultValue | `string \| null` | - | 非受控初始值，形状同上 |
| withSeconds | `boolean` | `false` | 显示秒列，值形状随之带秒 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 触发器尺寸档，刻度与 [Input](../input/input.md) 一致（32 / 40 / 48px），同一行表单里高度天然对齐 |
| minuteStep | `number` | `1` | 分钟列步进（常用 5 / 15 / 30） |
| secondStep | `number` | `1` | 秒列步进 |
| minDateTime | `string` | - | 最早可选时刻（含），形状同 `value`。日期部分限制日历，时间部分只在边界那天生效 |
| maxDateTime | `string` | - | 最晚可选时刻（含） |
| disabledDate | `(isoDate: string) => boolean` | - | 逐日禁用判定，入参恒为 `"YYYY-MM-DD"`，**只筛日期不筛时刻** |
| placeholder | `string` | `"选择日期时间"` | 触发器占位文本 |
| displayFormat | `string` | 原样显示 | 触发器显示格式（dayjs format 串）。**只影响显示**，对外值形状不变 |
| clearable | `boolean` | `true` | 有值且非 disabled/readOnly 时显示清除按钮 |
| showNow | `boolean` | `true` | 面板底部「此刻」快捷（按步进向下取整对齐） |
| disabled | `boolean` | `false` | 整体置灰，面板打不开 |
| readOnly | `boolean` | `false` | 面板可看，但选不动 |
| aria-label | `string` | - | 触发器无障碍名（无可见 label 时给） |
| className | `string` | - | 落在触发器外层容器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string \| null) => void` | 选中/清空回调；清空回传 `null` |

## 国际化

占位文本、清除按钮、时/分/秒列、此刻和确定文案跟随最近的 `ConfigProvider locale`。
显式 `placeholder` 优先于 Locale。旧自定义 Locale 若没有
`components.dateTimePicker`，仍使用原有中文兼容默认值。

## 示例
```tsx
// 基础
<DateTimePicker defaultValue="2026-06-08 09:30" />

// 受控
const [dt, setDt] = useState<string | null>(null);
<DateTimePicker value={dt} onValueChange={setDt} />

// 带秒 + 15 分步进
<DateTimePicker withSeconds minuteStep={15} defaultValue="2026-06-08 09:30:00" />

// 限定区间：日期部分限制日历，时间部分只在压着边界的那天生效
<DateTimePicker
  defaultValue="2026-06-10 12:00"
  minDateTime="2026-06-08 09:30"
  maxDateTime="2026-06-20 18:00"
/>
```

## 禁忌 / 坑

- **值是定宽文本，不是 `Date` 也不是 ISO 时间戳**：`"YYYY-MM-DD HH:mm"`，中间一个空格。
  定宽 → 字典序即时间序，范围比较直接比字符串，也不会被时区搅进来。
  从 0.15.0 之前的 MUI 版迁过来要改存量数据（那份对外是完整 ISO 时间戳）。
- **`minDateTime`/`maxDateTime` 的时间部分只在压着边界的那一天生效**。选到区间内部的日子时，
  一天 24 小时全开 —— 这是对的：「6 月 8 日 09:30 起可选」不该把 6 月 9 日的 00:00 也禁掉。
  这条最容易实现错，也最容易被误报成 bug。
- **选日期不关面板**：时间还没选完就关掉等于逼用户重开。要收起面板点「确定」，或点面板外。
- 只选了日期没碰时间列时，时间按 `00:00` 补（若被 `minDateTime` 顶着，则补成那天的最早可选时刻）。
- 反过来，没选日期就先点了时间列，日期会落到**今天** —— 否则这一下点了等于没点。
- `disabledDate` 只筛日期。想按「星期几的某个时段」这种粒度禁选，本组件做不到，
  需要在提交时自行校验。
- `minuteStep` 只影响**列里能点到的候选**，不校验外部传入的 `value`：
  传 `"2026-06-08 09:07"` 配 `minuteStep={15}` 时，07 分不在列里，分钟列会显示为无选中。
- 触发器是 `role="combobox"` 的按钮：未在 Props 里列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**它**身上，不是外层容器 —— 读屏念的、能聚焦的都是它（#293）。
- 放进 [Field](../field/field.md) 时，`label` 的 `htmlFor`、`aria-describedby`、`invalid` 与 `disabled` 会自动串到触发器上；`<Field required>` 注入的 `aria-required` 同理。**0.54.0 之前这条链是断的**（label 指向一个不存在的 id，读屏念不出字段名），升级后无需改调用代码。
- 测试里按角色取触发器要用 `getByRole("combobox")`，不再是 `"button"`。

## 相关
[DatePicker](../date-picker/date-picker.md) · [Calendar](../calendar/calendar.md) · [TimePicker](../time-picker/time-picker.md) · [TimeField](../time-field/time-field.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [Scheduler](../scheduler/scheduler.md)
