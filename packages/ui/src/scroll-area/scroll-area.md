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

> 给溢出内容换上更细的自定义滚动条，可竖可横 · layout/container

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
| className | `string` | - | 限高/限宽由消费者经此给 Root（如 `h-48` / `w-64`），否则不会出现滚动。 |
| viewportClassName | `string` | - | 追加到内层视口（真正的滚动盒）。`className` 落在 Root 上够不着视口，而裁剪发生在视口 —— 贴边控件的焦点环被切掉时传 `px-1.5` 之类留出余量（#340，见下方坑位） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 滚动内容。 |

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

- **不给限高/限宽就不滚**：组件不自带尺寸，必须经 `className` 给 Root 限定高度/宽度，否则内容撑开容器、滚动条永不出现。固定高度用 `h-*`（内容少时下方留白），「长则封顶滚动、短则紧凑」用 `max-h-*`（横向同理是 `w-*` / `max-w-*`）—— 0.61.0 前 `max-h-*` 会**静默裁掉**超出部分（没有滚动条、滚轮无效、键盘也到不了），现在两种写法都正常（#342）。
- **滚动条是覆盖式的，内容要自己留出让位内边距**。滚动条 `absolute` 定位、不占布局宽度，宽 `w-2`（8px），横向条高同理。所以内容区请自留 **≥ `pr-2.5`（10px = 8px 条 + 2px 呼吸）**，横向滚动则是 `pb-2.5`；留不够（比如常见的 `pr-1`=4px）滚动条就会稳定地压在最右一列内容上（#118）。这条是隐式约定，组件不代劳——因为「让位」该加在内容层还是各列上，只有消费方知道。
- **贴边控件的焦点环会被裁掉，用 `viewportClassName` 留余量**（#340）。上一条的裁剪不只作用于内容本身：`w-full` 的 `Input` 与视口左右零余量，聚焦时 `ring-2 + ring-offset-2` 向外扩的 4px 整条落在视口外被切掉，**看到的是蓝框只剩上下两条线**（上下方向有富余高度所以还在）。给 Root 加内边距救不了，裁的是视口。传 `viewportClassName="px-1.5"` 即可；留白该加在滚动容器上还是各列上只有你知道，所以组件不给默认值。

- **非声明方向的溢出被锁死（hidden），不会静默可滚**：`vertical` 的视口 `overflow-x: hidden`、`horizontal` 的视口 `overflow-y: hidden`（`both` 两轴都放开）。Base UI 给视口的是两轴 `overflow: scroll` 且原生条隐藏，此前内容比视口宽哪怕 1px 都能被触控板横扫、又没有任何滚动条提示，观感像布局坏了（#287）。所以放进 `vertical` 区域的内容要自己不超宽（`w-full` / `min-w-0` / 内部截断），超出的部分现在是被裁而不是可滚；真要两轴滚就声明 `orientation="both"`。

## 相关
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
