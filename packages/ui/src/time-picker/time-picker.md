---
slug: time-picker
name: TimePicker
category: forms
group: datetime
tags: []
exports: [TimePicker]
status: enriched
---

# TimePicker

> 时间选择 · 自研零依赖(时/分/秒三列浮层) + 步进/minTime-maxTime 逐列禁用 · 定宽 HH:mm[:ss] 受控 · 不经 MUI 桥 · forms/datetime

## 何时用

要「点开面板挑时刻」时用（排班、预约、营业时间）。零依赖自研，不牵扯 MUI / emotion，
也**不需要挂 `MuiBridgeProvider`**。

只想要键盘分段输入、不要浮层，用 [TimeField](../_mui/time-field.md)（MUI 桥）。
连日期一起选用 [DateTimePicker](../_mui/date-time-picker.md)；只选日期用 [DateField](../date-field/date-field.md)。

## 导入
```ts
import { TimePicker } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| null` | — | 受控值，`"HH:mm"` 或 `"HH:mm:ss"`（随 `withSeconds`），24 小时制定宽补零 |
| defaultValue | `string \| null` | — | 非受控初始值，形状同上 |
| withSeconds | `boolean` | `false` | 显示秒列，值形状随之变成 `"HH:mm:ss"` |
| minuteStep | `number` | `1` | 分钟列步进（5 / 15 / 30 常用） |
| secondStep | `number` | `1` | 秒列步进 |
| minTime | `string` | — | 最早可选时刻（含），形状同 `value` |
| maxTime | `string` | — | 最晚可选时刻（含） |
| placeholder | `string` | `"选择时间"` | 触发器占位文本 |
| clearable | `boolean` | `true` | 有值且非 disabled/readOnly 时显示清除按钮 |
| showNow | `boolean` | `true` | 面板底部「此刻」快捷（按步进向下取整对齐） |
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
<TimePicker defaultValue="09:30" />

// 带秒
<TimePicker withSeconds defaultValue="09:30:15" />

// 15 分步进（排班场景不必让用户从 60 个里挑）
<TimePicker minuteStep={15} defaultValue="09:30" />

// 营业时间窗
<TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" />
```

另导出一组纯函数供表单校验直接复用（不必再解析一遍时间串）：

```ts
import { parseTime, formatTimeParts, clampTime, snapToStep } from "@hulianui/ui"

parseTime("9:5")                       // { h: 9, m: 5, s: 0 }；非法/越界返回 null
formatTimeParts({h:9,m:5,s:0}, false)  // "09:05"
clampTime({h:8,m:0,s:0}, false, "09:30")  // { h: 9, m: 30, s: 0 }
snapToStep({h:9,m:37,s:0}, 15)            // { h: 9, m: 30, s: 0 }
```

> 名字里的 `Parts` 是为了避开 [Video](../video/video.md) 已占用的 `formatTime`（那份是「秒数 → mm:ss」）。

## 禁忌 / 坑

- **值是定宽文本，不是 `Date`**：`"HH:mm[:ss]"` 定宽 → 字典序即时间序，`minTime`/`maxTime`
  的比较可以直接比字符串，也不会被时区搅进来。要 `Date` 请自己拼日期部分。
- **逐列禁用的判据是「整段与范围有无交集」，不是「端点是否越界」**：`minTime="09:30"` 时
  9 点这一格**仍可选**（9:30~9:59 是可达的），被禁的是 9 点内 30 分之前的分钟。
  照「端点越界即禁」写会把整个 9 点误禁。
- **尚未选值时存在一个隐含基准**：`clamp(00:00:00, [min,max])`。不这么做的话 `minTime="09:30"`
  下基准小时恒为 0，分钟列会被整列判死，面板看着像坏了。所以「先点分钟再点小时」也能工作。
- `minuteStep` 只影响**候选列表**，不校验外部传进来的值。`value="09:37"` 配 `minuteStep={15}`
  时面板里没有对应项、分钟列不会有高亮 —— 需要对齐请自己先过一遍 `snapToStep`。
- `withSeconds` 切换会改变对外值形状（`"09:30"` ↔ `"09:30:15"`）。切换时请一并处理存量值。
- 与 `_mui` 的 [TimeField](../_mui/time-field.md) **不共享值格式**（那份对外是完整 ISO 时间戳，
  本组件是时刻串）。同一个表单里别混用。

## 相关
[DateField](../date-field/date-field.md) · [TimeField](../_mui/time-field.md) · [DateTimePicker](../_mui/date-time-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [Calendar](../_mui/calendar.md) · [Scheduler](../scheduler/scheduler.md)
