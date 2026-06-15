---
slug: picker
name: Picker
category: mobile
group: input
tags: []
exports: [Picker]
status: enriched
---

# Picker

> 滚轮选择器 · 多列 CSS scroll-snap 吸附 + 即时高亮居中项 + 停稳防抖 emit + 受控滚定位(零依赖·H5 选时间/地区) · mobile/input

## 何时用

H5 / 移动端从一组有限离散值里选一项或多列联动值（时:分、省/市/区）时用，iOS 风格滚轮交互。弹出层式的列表动作选择用 [ActionSheet](../action-sheet/action-sheet.md)；通常把 Picker 放进 ActionSheet 或底部抽屉里呈现。

## 导入
```ts
import { Picker } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `columns` * | `PickerColumn[]` | — | 各列配置（见下） |
| `value` | `string[]` | — | 各列选中值数组（受控） |
| `defaultValue` | `string[]` | 各列首项 | 非受控初始值 |
| `onChange` | `(value: string[], columnIndex: number) => void` | — | 某列选定后回调（完整值数组 + 变化的列下标） |
| `visibleCount` | `number` | `5` | 可见行数（建议奇数） |
| `itemHeight` | `number` | `40` | 行高 px |
| `className` | `string` | — | — |

**PickerColumn**：`options: PickerOption[]` · `flex?: number`（列宽 flex 比重，默认 1）。
**PickerOption**：`label: ReactNode` · `value: string`。

## 示例
```tsx
const [val, setVal] = useState(["9", "30"]);

<Picker columns={[hours, minutes]} value={val} onChange={setVal} />
```

## 禁忌 / 坑
- `value` / `defaultValue` 是**字符串数组**，每项对应一列、值须命中该列 `options` 的某个 `value`；列数与 `columns` 长度一致。
- 受控下 `onChange` 在滚动停稳（防抖）后才 emit，并带变化的列下标；高亮居中是即时的，但回调不是每帧触发。

## 相关
[TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [SafeArea](../safe-area/safe-area.md)
