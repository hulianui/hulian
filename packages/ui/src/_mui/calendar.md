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
import { Calendar } from "@hulianui/ui/date-pickers"
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
| minDate | `string` | — | 可选最早日期（ISO），早于此禁选 |
| maxDate | `string` | — | 可选最晚日期（ISO），晚于此禁选 |
| disabled | `boolean` | `false` | 整体禁用 |
| readOnly | `boolean` | `false` | 只读：可查看不可改 |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(iso: string \| null) => void` | 受控回调，回传 ISO 或 null（替代 MUI 的 onChange） |

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
