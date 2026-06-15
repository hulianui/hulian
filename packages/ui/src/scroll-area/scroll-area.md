---
slug: scroll-area
name: ScrollArea
category: layout
group: container
tags: []
exports: [ScrollArea]
status: enriched
---

# ScrollArea

> 滚动区 · Base UI 自定义细滚动条 + 竖/横/双向 · layout/container

## 何时用

需要在限定高/宽的区域内滚动、且想要跨平台一致的细滚动条（替代浏览器默认粗条）时用。它只管「滚动条样式 + 方向」；要拖拽改变区域大小用 [Resizable](../resizable/resizable.md)，要按设备宽度做容器查询用 [Viewport](../viewport/viewport.md)。

## 导入
```ts
import { ScrollArea } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| orientation | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | 滚动方向；`both` 时双向滚动条 + corner。 |
| className | `string` | — | 限高/限宽由消费者经此给 Root（如 `h-48` / `w-64`），否则不会出现滚动。 |
| children | `ReactNode` | — | 滚动内容。 |

## 示例
```tsx
// 竖向滚动：必须经 className 给出限高
<ScrollArea className="h-48 w-72 border border-border bg-surface p-4">
  {/* 长内容 */}
</ScrollArea>
```

```tsx
// 横向滚动
<ScrollArea orientation="horizontal" className="w-72">
  <div className="flex gap-3">{/* 横排卡片 */}</div>
</ScrollArea>
```

## 禁忌 / 坑

- **不给限高/限宽就不滚**：组件不自带尺寸，必须经 `className` 给 Root 限定 `h-*` / `w-*`（横向则限 `w-*`），否则内容撑开容器、滚动条永不出现。

## 相关
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
