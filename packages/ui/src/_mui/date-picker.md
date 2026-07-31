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

> 日期选择 · MUI X 桥(输入+弹层日历) + ISO 受控 + min/max · forms/datetime · MUI 桥

## 何时用

表单里选**单个日期**、要带输入框 + 弹层日历时用。需要月历常驻铺开（无输入框）用 [Calendar](../calendar.md)；选一段区间用 [DateRangePicker](../date-range-picker/date-range-picker.md)；连时间一起选用 [DateTimePicker](../date-time-picker.md)。

## 导入
```ts
import { DatePicker } from "@hulianui/ui/date-pickers"
```

> 日期族自 0.15.0 起**不在根 barrel** 里，必须走 `date-pickers` 子路径；同时自行安装四个 optional peer
> （不用日期族的项目一个都不用装，这正是移出根 barrel 的目的）：
>
> ```bash
> pnpm add @mui/material @mui/x-date-pickers @emotion/react @emotion/styled
> ```

> ⚠️ **前置条件：本组件属 `_mui` 桥接族，必须置于 `MuiBridgeProvider` 之内。**
> 桥主题把 `theme.alpha` 重写成 `color-mix`，不挂 Provider 时 MUI 核心件（如日期族头部的
> IconButton）会对 `var(--color-*)` 调 `alpha()` 并直接抛 `Unsupported color` —— 真实浏览器同样触发，
> 不是只在测试里出现。整个应用挂一次即可（通常在根 layout）。
>
> ```tsx
> import { MuiBridgeProvider } from "@hulianui/ui/date-pickers"
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
| minDate | `string` | — | 可选最早日期（ISO） |
| maxDate | `string` | — | 可选最晚日期（ISO） |
| disabledDate | `(isoDate: string) => boolean` | — | 逐日禁用判定，入参是 `"YYYY-MM-DD"`；与 min/max 是「或」关系 |
| views | `("year" \| "month" \| "day")[]` | `["year","day"]` | 面板视图层级。只选年传 `["year"]`、只选年月传 `["year","month"]`（对上 el-date-picker 的 `type="year"`/`"month"`） |
| openTo | `"year" \| "month" \| "day"` | — | 打开时停在哪一层视图（须是 `views` 的成员） |
| format | `string` | — | 输入框显示格式（dayjs format 串）。**只影响显示**，回调仍回传完整 ISO 时间戳 |
| label | `string` | `"选择日期"` | 输入框 label |
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
  const [v, setV] = useState<string | null>("2026-06-03");
  return <DatePicker label="选择日期" value={v} onValueChange={setV} />;
}
```
```tsx
<DatePicker label="到期日" defaultValue="2026-06-15" />
```

## 禁忌 / 坑

- 受控/非受控二选一：给 `value` 走受控须配 `onValueChange`；只想要初值用 `defaultValue`，别同时给。
- 对外值恒为 ISO 字符串（非 Date），回调也回传 ISO 或 null。

## 相关
[Calendar](../_mui/calendar.md) · [DateTimePicker](../_mui/date-time-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [TimeField](../_mui/time-field.md) · [Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md)
