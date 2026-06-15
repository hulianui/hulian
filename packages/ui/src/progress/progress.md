---
slug: progress
name: Progress
category: feedback
group: loading
tags: []
exports: [Progress, progressPercent, dashOffset]
status: enriched
---

# Progress

> 进度条 · linear/circular + 不定态 · 几何自有(reduced-motion) · feedback/loading

## 何时用

表达「确定进度」（已知 value/max 的任务百分比，如上传、表单步进、配额占用）或「不定态加载」（省略 value）。需要可量化进度时用本组件；只是表达「忙碌中」无具体进度，用 [Spin](../spin/spin.md) / [Spinner](../spinner/spinner.md)。

## 导入
```ts
import { Progress, progressPercent, dashOffset } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `number` | — | 当前值；省略/undefined → indeterminate 不定态 |
| max | `number` | `100` | 最大值 |
| variant | `"linear" \| "circular"` | `"linear"` | 形态 |
| tone | `"primary" \| "danger" \| "success" \| "warning"` | `"primary"` | 进度色调 |
| size | `number` | `40` | circular 直径 px（linear 忽略） |
| thickness | `number` | `4` | circular 描边 px（linear 忽略） |
| showValue | `boolean` | `false` | 显示百分比标签（circular 居中 / linear 右侧）；indeterminate 不显示 |

> 继承 `HTMLAttributes<HTMLDivElement>`（`className` 等）。linear 形态需自给宽度（如 `className="w-64"`）。

## 示例
```tsx
<Progress value={60} showValue className="w-64" />
<Progress variant="circular" value={75} showValue />
<Progress className="w-64" />            {/* 不定态：省略 value */}
```

## 禁忌 / 坑

- circular 形态内部用 SVG ring 实现：弧线从 12 点起始、明暗自适应均依赖 SVG `transform="rotate(…)"` 属性而非 CSS transform——改造其几何时见 [[svg-circular-progress-ring-rotate-via-svg-attr-not-css]]（CSS transform-origin 对 SVG geometry 元素失效）。
- 不定态（省略 value）下 `showValue` 不生效，无百分比可显。

## 相关
[Spin](../spin/spin.md) · [Spinner](../spinner/spinner.md) · [Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md)
