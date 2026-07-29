---
slug: fab
name: Fab
category: mobile
group: nav
tags: []
exports: [Fab]
status: enriched
---

# Fab

> 悬浮操作钮 · fixed 贴边 + speed-dial 子动作错峰展开/主钮旋 45°(零依赖·reduced-motion) · mobile/nav

## 何时用

页面内单一主操作（如新建、回到顶部、分享）需要常驻悬浮入口时用；多个相关动作可挂 speed-dial 展开。全局一级页签切换用 [TabBar](../tab-bar/tab-bar.md)；点击后弹出一组列表动作并需取消按钮用 [ActionSheet](../action-sheet/action-sheet.md)。

## 导入
```ts
import { Fab } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `label` | `string` | — | 主按钮文字（extended 胶囊态）；提供后主钮变「图标+文字」自适应胶囊，并默认作 aria-label |
| `actions` | `FabAction[]` | — | speed-dial 子动作；提供则点击主钮展开/收起，否则直接触发 onClick |
| `position` | `"bottom-right" \| "bottom-left" \| "bottom-center"` | `"bottom-right"` | 贴边位置 |
| `size` | `"sm" \| "md"` | `"md"` | md=56px 主钮，sm=48px（紧凑场景） |
| `draggable` | `boolean` | `false` | 按住拖动重定位（位移 >3px 视为拖拽，该次不触发 onClick） |
| `aria-label` | `string` | `"操作"` | 主按钮无障碍标签 |
| `className` | `string` | — | — |

**FabAction**：`key: string` · `icon: ReactNode` · `label?: string`（展开时显示在图标侧并作 aria-label）· `onClick?: () => void`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `onClick` | `() => void` | 无 actions 时的主按钮点击 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `icon` | `ReactNode` | 主按钮图标（默认 Plus）；展开 speed-dial 时旋转 45° |

## 示例
```tsx
<Fab
  actions={[
    { key: "search", icon: <Search />, label: "搜索" },
    { key: "share", icon: <Share />, label: "分享" },
  ]}
/>
```

可拖拽（`draggable` 默认 `false`，不开则按住不动）：

```tsx
<Fab draggable label="按住拖我" icon={<GripVertical />} onClick={() => alert("新建")} />
```

## 禁忌 / 坑
- 默认 `fixed` 贴视口角落，gallery / 容器内演示时用 `className` 覆盖为 `absolute` 收进框内（容器需 `position: relative` + `overflow-hidden`）。
- 给了 `actions` 时点击主钮是展开/收起子动作，`onClick` 不再触发；只有不给 actions 时主钮才直接触发 `onClick`。
- `draggable` 默认 `false`——不开启时按住主钮不会有任何位移，这是预期行为而非失效。
- `draggable` 下若拖拽位移超过 3px，本次抬手不会触发点击（避免拖完误触）。
- 拖拽偏移写在根节点的 inline `transform` 上，并且只是组件内部 state：不持久化，也不受控（无 `onDragEnd` / 受控位置入参），刷新或重挂载即回到 `position` 指定的贴边处。
- 拖拽只沿相对按下点的自由位移，不做视口边界钳制——拖到屏幕外不会自动拉回，容器内演示务必配 `overflow-hidden`。
- 开启后主钮带 `touch-action: none`，移动端在按钮上的手势归拖拽所有，不会再滚动页面。

## 相关
[TabBar](../tab-bar/tab-bar.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [SafeArea](../safe-area/safe-area.md)
