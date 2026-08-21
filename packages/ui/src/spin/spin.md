---
slug: spin
name: Spin
category: feedback
group: loading
tags: []
exports: [Spin]
status: enriched
---

# Spin

> 给内容区盖上加载遮罩，可延迟出现避免闪烁 · feedback/loading

## 何时用

给一块内容区盖上加载遮罩（异步刷新表格/卡片时半透明蒙层 + 旋转器 + 文案）用它，遮罩期内容 `pointer-events:none`。它带遮罩/包裹/整页能力；只需一个裸旋转图标（按钮内、行内）用 [Spinner](../spinner/spinner.md)；已知进度百分比用 [Progress](../progress/progress.md)。

## 导入
```ts
import { Spin } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| spinning | `boolean` | `true` | 是否处于加载态 |
| delay | `number` | `0` | 延迟显示 ms：spinning 持续超过 delay 才显遮罩（防快速完成时闪烁） |
| size | `"sm"｜"md"｜"lg"` | `"md"` | 尺寸，透传内部 Spinner |
| fullscreen | `boolean` | `false` | 整页遮罩（fixed 覆盖视口），忽略 children |
| className | `string` | - | 容器类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| tip | `ReactNode` | 加载文案，居中显示在 Spinner 下方 |
| children | `ReactNode` | 被包裹内容；不传则作纯指示器 |

## 示例
```tsx
// 包裹内容区，加载时盖遮罩
<Spin spinning={loading} tip="加载中…">
  <ReportTable />
</Spin>

// 整页遮罩（忽略 children）
{busy && <Spin fullscreen tip="加载中…" />}
```

## 禁忌 / 坑

- `fullscreen` 会**忽略 children**（fixed 覆盖整个视口），它和「包裹内容」是两种互斥用法，别同时指望它既盖整页又包内容。
- 用 `delay` 防快速完成时的闪烁（请求 < delay 完成就不显遮罩）；长耗时加载置 0 立即显。
- 不传 children 时退化为纯指示器（等价于一个带 tip 的 Spinner）。
- 暂无其它已知坑。

## 相关
[Spinner](../spinner/spinner.md) · [Progress](../progress/progress.md) · [Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md)
