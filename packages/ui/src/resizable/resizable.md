---
slug: resizable
name: Resizable
category: layout
group: container
tags: []
exports: [ResizablePanelGroup, ResizablePanel, ResizableHandle, applyResize, splitEqually]
status: enriched
---

# Resizable

> 拖拽分栏 · 复合 PanelGroup/Panel/Handle + 横竖向 + min/max + 键盘微调(零依赖·role=separator) · layout/container

## 何时用

要让用户拖动手柄实时改变相邻面板尺寸（IDE 三栏、聊天列表+详情等）时用。它是用户可交互调宽的分栏；若只是按容器宽度自动重排布局用 [Viewport](../viewport/viewport.md)，整页固定骨架用 [Layout](../layout/layout.md)。

## 导入
```ts
import { ResizablePanelGroup, ResizablePanel, ResizableHandle, applyResize, splitEqually } from "@hulianui/ui"
```

## Props

### ResizablePanelGroup
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| direction | `"horizontal" \| "vertical"` | `"horizontal"` | horizontal=面板横排(分隔符竖直)；vertical=面板竖排(分隔符水平)。 |
| sizes | `number[]` | — | 受控尺寸（百分比数组，一项一面板），须配 onSizesChange。 |
| defaultSizes | `number[]` | 均分 | 非受控初始尺寸；缺省按面板数均分。 |

继承 `HTMLAttributes<HTMLDivElement>`（除 onChange）。

### ResizablePanel
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| min | `number` | `10` | 最小尺寸百分比下限。 |
| max | `number` | `100` | 最大尺寸百分比上限。 |

继承 `HTMLAttributes<HTMLDivElement>`。

### ResizableHandle
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| keyboardStep | `number` | `5` | 键盘方向键每次微调的百分点（role=separator，可聚焦键控）。 |

继承 `HTMLAttributes<HTMLDivElement>`（除 aria-orientation）。

### 工具函数
- `splitEqually(n)` — 生成 n 个面板均分的尺寸数组。
- `applyResize(...)` — 受控模式下据拖拽增量计算新尺寸数组（含 min/max 钳制）。

## Events

### ResizablePanelGroup
| 事件 | 类型 | 说明 |
|------|------|------|
| onSizesChange | `(sizes: number[]) => void` | 尺寸变化回调。 |

## Slots

### ResizablePanelGroup
| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | Panel 与 Handle 交替排列。 |

## 示例
```tsx
// 横向三栏：文件树 / 编辑器 / 预览
<ResizablePanelGroup direction="horizontal" defaultSizes={[24, 46, 30]}>
  <ResizablePanel min={15}><FileTree /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={25}><Editor /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={18}><Preview /></ResizablePanel>
</ResizablePanelGroup>
```

```tsx
// 竖向两栏
<ResizablePanelGroup direction="vertical" defaultSizes={[55, 45]}>
  <ResizablePanel min={20}><ChatLog /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={20}><LogPanel /></ResizablePanel>
</ResizablePanelGroup>
```

## 禁忌 / 坑

- **Panel 与 Handle 必须交替排列**：每两个 `ResizablePanel` 之间放一个 `ResizableHandle`，组件按手柄两侧定位相邻面板做尺寸再分配；漏放或多放会错位。
- **受控时尺寸数组长度须等于面板数**：`sizes`/`defaultSizes` 是百分比数组，一项对应一面板；用 `splitEqually(n)` 起步、`applyResize` 算增量更稳。
- 受控模式记得在 `onSizesChange` 回写 `sizes`，否则拖不动。

## 相关
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
