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

> 常驻的日历面板，可在日、月、年三层之间下钻 · forms/datetime

## 何时用

需要一块**常驻铺开**的月历时用：仪表盘侧栏的日期导航、预约页的选日区、任何「面板本身就是界面一部分」
的场景。它不带触发器也不带浮层。

要「输入框 + 点开才出日历」用 [DatePicker](../date-picker/date-picker.md) —— 它的弹层里就是本组件，
两者共用同一套下钻与禁用逻辑，行为完全一致。选一段区间用
[DateRangePicker](../date-range-picker/date-range-picker.md)；连时间一起选用
[DateTimePicker](../date-time-picker/date-time-picker.md)。

> 本组件在 0.15.0 之前是 MUI X `DateCalendar` 的桥接件，要装四个 optional peer 并挂
> `MuiBridgeProvider`。现在是零依赖自研，装库即用。

## 导入
```ts
import { Calendar } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| null` | - | 受控值。形状随 `picker`：`"YYYY-MM-DD"` / `"YYYY-MM"` / `"YYYY"` |
| defaultValue | `string \| null` | - | 非受控初始值，形状同上 |
| picker | `"date" \| "month" \| "year"` | `"date"` | 选择粒度，同时决定值形状与面板起始层 |
| defaultMonth | `string` | 随 `value` | 面板初始停留的月份（任意可解析日期串），与选中值无关。之后由内部导航接管 |
| minDate | `string` | - | 最早可选日期（任意可解析日期串，内部规范化） |
| maxDate | `string` | - | 最晚可选日期 |
| disabledDate | `(isoDate: string) => boolean` | - | 逐日禁用判定，入参恒为 `"YYYY-MM-DD"`（月/年粒度传该月/该年首日） |
| showToday | `boolean` | `true` | 底部跟随 locale 的「今天 / 本月 / 今年」快捷 |
| disabled | `boolean` | `false` | 整块置灰，连翻页都停掉 |
| readOnly | `boolean` | `false` | 可翻页浏览，但选不动 |
| aria-label | `string` | 来自 `ConfigProvider` | 面板无障碍名；显式值优先 |
| className | `string` | - | 落在面板外层容器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string) => void` | 选中回调。面板内的**下钻不会触发**，只有真正选到 `picker` 那一层才回调；面板没有清空入口，所以不回传 `null` |

## 示例
```tsx
// 基础：值是 ISO 日期串
<Calendar defaultValue="2026-06-08" />

// 受控
const [date, setDate] = useState<string | null>(null);
<Calendar value={date} onValueChange={setDate} />

// 选月份 / 选年份（值形状随之变成 YYYY-MM / YYYY）
<Calendar picker="month" defaultValue="2026-06" />
<Calendar picker="year" defaultValue="2026" />

// 没有值，但想从九月开始看
<Calendar defaultMonth="2026-09-01" />

// 限定范围 + 禁用周末
<Calendar
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(`${iso}T00:00:00`).getDay();
    return day === 0 || day === 6;
  }}
/>
```

## 禁忌 / 坑

- 月份标题、星期与月份名称、翻页标签和快捷文案跟随最近的 `ConfigProvider` locale；未提供 Provider 时默认中文。ISO 值与选择规则不受 locale 影响。
- **值是定宽文本，不是 `Date`**：`"YYYY-MM-DD"` 定宽 → 字典序即时间序，区间比较可以直接比字符串，
  也避开了 `new Date("2026-06-08").toISOString()` 在东八区少算 8 小时那类日界坑。要 `Date` 对象请自己转。
- `onValueChange` 的参数类型是 `string` 而非 `string | null`：面板没有清空入口。
  需要「可清空」用 [DatePicker](../date-picker/date-picker.md)，它的触发器上带清除按钮。
- **下钻不回调**：`picker="date"` 时点标题上卷到月视图、再点某个月，只是把光标挪过去，不算选中，
  只有点到日格才提交。写测试时别把「点了 9 月」当成一次选值。
- `disabledDate` 在 `date` 粒度下逐日调用（一屏 42 次），请保持它是纯计算 —— 别在里面发请求或建对象。
  月/年粒度下只对该月/该年首日调一次，**判据也随之变粗**：想精确到天就别用粗粒度 picker。
- `disabled` 与 `readOnly` 不是一回事：`readOnly` 还能翻页浏览，`disabled` 连翻页按钮都禁掉。
- 面板宽度固定 `15.75rem`（7 列 × 2.25rem），不做响应式收窄 —— 日历一挤压就点不准。
  要塞进更窄的容器请自行缩放。

## 相关
[DatePicker](../date-picker/date-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [TimePicker](../time-picker/time-picker.md) · [TimeField](../time-field/time-field.md) · [Scheduler](../scheduler/scheduler.md)
