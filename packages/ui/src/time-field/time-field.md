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

> 时间分段输入 · 自研零依赖(时/分/秒各一段 spinbutton·↑↓ 调值/←→ 切段/数字键两位覆写) + min-max 钳制 · 定宽 HH:mm[:ss] 受控 · forms/datetime

## 何时用

录入密集的表单里用：手不离键盘，`14` `30` 四下按完就录好了，不用抬手去点浮层。
排班表、考勤、批量改时间这类一屏要填十几个时间的界面尤其合适。

要「点着选」用 [TimePicker](../time-picker/time-picker.md) —— 它是列选式浮层，
带 `minuteStep` 步进和「此刻」，适合偶尔填一个、且希望限定在整点/半点的场景。
连日期一起选用 [DateTimePicker](../date-time-picker/date-time-picker.md)。

> 本组件在 0.15.0 之前是 MUI X `TimeField` 的桥接件，要装四个 optional peer 并挂
> `MuiBridgeProvider`。现在是零依赖自研，装库即用，且补上了 min/max 与秒段。

## 导入
```ts
import { TimeField } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| null` | — | 受控值，`"HH:mm"` 或 `"HH:mm:ss"`（随 `withSeconds`）。24 小时制、定宽补零 |
| defaultValue | `string \| null` | — | 非受控初始值，形状同上 |
| withSeconds | `boolean` | `false` | 显示秒段，值形状随之带秒 |
| minTime | `string` | — | 最早可选时刻（含），形状同 `value` |
| maxTime | `string` | — | 最晚可选时刻（含） |
| clearable | `boolean` | `true` | 有值且非 disabled/readOnly 时显示清除按钮 |
| disabled | `boolean` | `false` | 整体置灰，各段不可聚焦 |
| readOnly | `boolean` | `false` | 改不动值，但还能切段浏览 |
| aria-label | `string` | `"时间"` | 整个输入框的无障碍名（各段自带「小时/分钟/秒」标签） |
| className | `string` | — | 落在外层容器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string \| null) => void` | **只有整段输完才触发**；清空或退格清段回传 `null` |

## 国际化

输入组、时/分/秒段、空值播报和清除按钮的无障碍文案跟随最近的
`ConfigProvider locale`。显式 `aria-label` 优先于 Locale。旧自定义 Locale 若没有
`components.timeField`，仍使用原有中文兼容默认值。

## 键盘

| 按键 | 作用 |
|------|------|
| `↑` / `↓` | 当前段 ±1，段内循环（23 → 0）。空段起步：`↑` 给最小、`↓` 给最大 |
| `←` / `→` | 切换段，两端不越界 |
| `0`–`9` | 两位缓冲覆写：输满两位自动跳下一段；首位补零后已超范围（小时按 `3`）则一位定形 |
| `Backspace` / `Delete` | 清空当前段 |

## 示例
```tsx
// 基础
<TimeField defaultValue="09:30" />

// 受控
const [time, setTime] = useState<string | null>(null);
<TimeField value={time} onValueChange={setTime} />

// 带秒
<TimeField withSeconds defaultValue="09:30:15" />

// 限定区间（整段输完才钳制）
<TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00" />
```

## 禁忌 / 坑

- **半截时间不回调**：只输了小时、分钟还空着时 `onValueChange` 不触发，值仍是上一次的。
  想拿到「正在编辑」的中间态是拿不到的 —— 那是内部编辑态，刻意不外泄。
- **`minTime`/`maxTime` 只在整段输完那一刻钳制，不做段级限制**。这是刻意的：段级判定会让
  「先输 23 点、再输分钟」这类顺序根本没法输（min=09:30 时刚输完 23 点的瞬间还没有分钟，
  会当场被拽回 09）。代价是用户可能看到自己输的 `23:00` 被改成 `18:00`。
- **第二位放不下时按新首位重来，不钳到边界**：小时段先按 `2` 再按 `9`，得到的是 `09` 而不是 `23`。
  29 点不存在，钳成 23 点等于凭空造了个用户没按过的值。
- 边界值的形状会被自动补齐：`maxTime="18:00"` 在 `withSeconds` 下按 `18:00:00` 理解。
  别指望它表示「18:00:59 之前都行」。
- 段是 `<span role="spinbutton">` 而不是三个 `<input>`：三个真 input 会各自吃掉浏览器的
  输入法/自动填充/校验行为，而这里要的恰恰是完全自定义的两位缓冲逻辑。
  因此**它不会参与原生表单提交**，值请自行受控收集。
- `readOnly` 仍可用 `←→` 切段（只读不等于不能看），但 `↑↓` 与数字键无效。

## 相关
[TimePicker](../time-picker/time-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [DatePicker](../date-picker/date-picker.md) · [Calendar](../calendar/calendar.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [InputOtp](../input-otp/input-otp.md)
